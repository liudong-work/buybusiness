<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { message, Upload } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore, type ProductPayload, type ProductRecord, type ProductSku } from '../stores/app';
import { uploadImage } from '../api/client';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const { products } = storeToRefs(store);
const search = ref('');
const drawerOpen = ref(false);
const saving = ref(false);
const editingProductId = ref<string | null>(null);
const uploading = ref(false);
const fileList = ref<any[]>([]);

function createSku(seed?: Partial<ProductSku>): ProductSku {
  return {
    id: seed?.id ?? `sku-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    skuCode: seed?.skuCode ?? '',
    specSummaryZh: seed?.specSummaryZh ?? '',
    specSummaryEn: seed?.specSummaryEn ?? '',
    inventory: seed?.inventory ?? 0,
  };
}

const emptyForm = (): ProductPayload => ({
  nameZh: '',
  nameEn: '',
  descriptionZh: '',
  descriptionEn: '',
  category: '',
  price: '',
  inventory: 0,
  status: 'draft',
  coverImage: '',
  images: [''],
  specs: [''],
  skus: [createSku()],
});

const formState = reactive<ProductPayload>(emptyForm());

onMounted(() => {
  store.loadProducts();
});

watch(
  () => route.query.action,
  (action) => {
    if (action === 'create') {
      openCreateDrawer();
      router.replace({ path: '/products', query: {} });
    }
  },
  { immediate: true }
);

const filteredProducts = computed(() =>
  products.value.filter((item) =>
    [item.nameZh, item.nameEn, item.category, item.id].some((field) =>
      field.toLowerCase().includes(search.value.toLowerCase())
    )
  )
);

const activeCount = computed(() => products.value.filter((item) => item.status === 'active').length);
const draftCount = computed(() => products.value.filter((item) => item.status === 'draft').length);
const bilingualReadyCount = computed(() => products.value.filter((item) => item.englishReady).length);

const englishReadyPreview = computed(() => {
  const hasEnglish = Boolean(formState.nameEn.trim() && formState.descriptionEn.trim());
  const hasAssets = Boolean(formState.coverImage.trim() && sanitizedImages().length && sanitizedSpecs().length && sanitizedSkus().length);
  const skusReady = sanitizedSkus().every((item) => item.specSummaryEn.trim());
  return hasEnglish && hasAssets && skusReady;
});

const columns = [
  { title: '商品信息', dataIndex: 'nameZh', key: 'nameZh' },
  { title: '素材 / SKU', key: 'assets' },
  { title: '售价', dataIndex: 'price', key: 'price' },
  { title: '最近更新', dataIndex: 'updatedAt', key: 'updatedAt' },
  { title: '操作', key: 'action' },
] as const;

const statusOptions = [
  { label: '已上架', value: 'active' },
  { label: '草稿', value: 'draft' },
  { label: '低库存', value: 'low_stock' },
] as const;

function statusLabel(status: ProductRecord['status']) {
  if (status === 'active') return 'status-pill status-pill--success';
  if (status === 'draft') return 'status-pill status-pill--muted';
  return 'status-pill status-pill--warning';
}

function statusText(status: ProductRecord['status']) {
  if (status === 'active') return '已上架';
  if (status === 'draft') return '草稿';
  return '低库存';
}

function sanitizedImages() {
  return formState.images.map((item) => item.trim()).filter(Boolean);
}

function sanitizedSpecs() {
  return formState.specs.map((item) => item.trim()).filter(Boolean);
}

function sanitizedSkus() {
  return formState.skus
    .map((item) => ({
      ...item,
      skuCode: item.skuCode.trim(),
      specSummaryZh: item.specSummaryZh.trim(),
      specSummaryEn: item.specSummaryEn.trim(),
    }))
    .filter((item) => item.skuCode || item.specSummaryZh || item.specSummaryEn || item.inventory > 0);
}

function resetForm() {
  Object.assign(formState, emptyForm());
  editingProductId.value = null;
}

function openCreateDrawer() {
  resetForm();
  drawerOpen.value = true;
}

function openEditDrawer(product: ProductRecord) {
  Object.assign(formState, {
    nameZh: product.nameZh,
    nameEn: product.nameEn,
    descriptionZh: product.descriptionZh,
    descriptionEn: product.descriptionEn,
    category: product.category,
    price: product.price,
    inventory: product.inventory,
    status: product.status,
    coverImage: product.coverImage,
    images: product.images.length ? [...product.images] : [''],
    specs: product.specs.length ? [...product.specs] : [''],
    skus: product.skus.length ? product.skus.map((item) => createSku(item)) : [createSku()],
  });
  editingProductId.value = product.id;
  drawerOpen.value = true;
}

function addImageField() {
  formState.images.push('');
}

function removeImageField(index: number) {
  formState.images.splice(index, 1);
  if (!formState.images.length) formState.images.push('');
}

function addSpecField() {
  formState.specs.push('');
}

function removeSpecField(index: number) {
  formState.specs.splice(index, 1);
  if (!formState.specs.length) formState.specs.push('');
}

function addSkuField() {
  formState.skus.push(createSku());
}

function removeSkuField(index: number) {
  formState.skus.splice(index, 1);
  if (!formState.skus.length) formState.skus.push(createSku());
}

async function submitForm() {
  const payload: ProductPayload = {
    ...formState,
    coverImage: formState.coverImage.trim(),
    images: sanitizedImages(),
    specs: sanitizedSpecs(),
    skus: sanitizedSkus(),
  };

  if (!payload.nameZh.trim() || !payload.category.trim() || !payload.price.trim()) {
    message.warning('请补齐商品基础信息');
    return;
  }

  if (!payload.skus.length) {
    message.warning('请至少维护一个 SKU');
    return;
  }

  if (payload.status === 'active' && !englishReadyPreview.value) {
    message.warning('英文内容、图片或 SKU 英文规格未补齐，暂不能直接设为上架');
    return;
  }

  saving.value = true;
  try {
    if (editingProductId.value) {
      await store.updateProduct(editingProductId.value, payload);
      message.success('商品已更新');
    } else {
      await store.createProduct(payload);
      message.success('商品已创建');
    }

    drawerOpen.value = false;
    resetForm();
  } finally {
    saving.value = false;
  }
}

async function togglePublish(product: ProductRecord) {
  if (product.status === 'active' || product.status === 'low_stock') {
    await store.unpublishProduct(product.id);
    message.success('商品已下架');
    return;
  }

  await store.publishProduct(product.id);
  message.success('商品已上架');
}

async function removeProduct(product: ProductRecord) {
  if (!window.confirm(`确认删除商品 ${product.nameZh} 吗？`)) return;
  await store.deleteProduct(product.id);
  message.success('商品已删除');
}

async function handleImageUpload(file: File): Promise<string> {
  uploading.value = true;
  try {
    const result = await uploadImage(file);
    return result.url;
  } catch (error) {
    message.error('图片上传失败');
    throw error;
  } finally {
    uploading.value = false;
  }
}

async function uploadCoverImage(file: File) {
  try {
    const url = await handleImageUpload(file);
    formState.coverImage = url;
    message.success('封面图上传成功');
  } catch (error) {
    console.error('Cover image upload failed:', error);
  }
}

async function uploadProductImage(file: File, index: number) {
  try {
    const url = await handleImageUpload(file);
    formState.images[index] = url;
    message.success('商品图片上传成功');
  } catch (error) {
    console.error('Product image upload failed:', error);
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header__meta">
        <p class="page-header__eyebrow">商品管理</p>
        <h1>把商品从草稿、补图、补英文一路推进到可发布状态</h1>
        <p>
          现在除了新增和编辑，还可以直接维护图片、规格、SKU，并在英文内容完整时执行上架，下架和删除动作也都已经打通。
        </p>
      </div>
      <a-space>
        <a-input-search v-model:value="search" placeholder="搜索商品名称、英文名、类目或编号" style="width: 300px" />
        <a-button type="primary" @click="openCreateDrawer">新增商品</a-button>
      </a-space>
    </div>

    <a-row :gutter="[18, 18]" style="margin-bottom: 22px">
      <a-col :xs="24" :md="8">
        <div class="metric-card" style="padding: 22px">
          <div style="font-size: 13px; color: #6b7280">已上架商品</div>
          <div style="margin-top: 10px; font-size: 30px; font-weight: 700; color: #111827">{{ activeCount }}</div>
          <div style="margin-top: 10px; color: #047857; font-weight: 600">可直接对外展示</div>
        </div>
      </a-col>
      <a-col :xs="24" :md="8">
        <div class="metric-card" style="padding: 22px">
          <div style="font-size: 13px; color: #6b7280">草稿商品</div>
          <div style="margin-top: 10px; font-size: 30px; font-weight: 700; color: #111827">{{ draftCount }}</div>
          <div style="margin-top: 10px; color: #9a3412; font-weight: 600">待补图、补英文或补 SKU</div>
        </div>
      </a-col>
      <a-col :xs="24" :md="8">
        <div class="metric-card" style="padding: 22px">
          <div style="font-size: 13px; color: #6b7280">英文完整商品</div>
          <div style="margin-top: 10px; font-size: 30px; font-weight: 700; color: #111827">{{ bilingualReadyCount }}</div>
          <div style="margin-top: 10px; color: #1d4ed8; font-weight: 600">标题、描述、图片和英文规格均已就绪</div>
        </div>
      </a-col>
    </a-row>

    <div class="content-panel" style="padding: 24px">
      <a-table :columns="columns" :data-source="filteredProducts" :pagination="{ pageSize: 6 }" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'nameZh'">
            <div style="display: flex; gap: 14px; align-items: flex-start">
              <img
                :src="record.coverImage || 'https://dummyimage.com/88x88/e5e7eb/9ca3af&text=No+Image'"
                alt=""
                style="width: 88px; height: 88px; object-fit: cover; border-radius: 18px; flex-shrink: 0"
              />
              <div>
                <div style="font-weight: 700; color: #111827">{{ record.nameZh }}</div>
                <div style="margin-top: 6px; color: #6b7280; font-size: 13px">{{ record.nameEn || '待补英文标题' }}</div>
                <div style="margin-top: 8px">
                  <span :class="statusLabel(record.status)">{{ statusText(record.status) }}</span>
                  <a-tag :color="record.englishReady ? 'green' : 'orange'" style="margin-left: 8px">
                    {{ record.englishReady ? '英文完整' : '待补英文' }}
                  </a-tag>
                </div>
                <div style="margin-top: 8px; color: #94a3b8; font-size: 12px">{{ record.id }} · {{ record.category }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'assets'">
            <div style="line-height: 1.9; color: #4b5563">
              <div>图片 {{ record.images.length }} 张</div>
              <div>规格 {{ record.specs.length }} 条</div>
              <div>SKU {{ record.skus.length }} 个</div>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEditDrawer(record)">编辑</a-button>
              <a-button type="link" @click="togglePublish(record)">
                {{ record.status === 'active' || record.status === 'low_stock' ? '下架' : '上架' }}
              </a-button>
              <a-button type="link" danger @click="removeProduct(record)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <a-drawer
      :open="drawerOpen"
      :width="880"
      :title="editingProductId ? '编辑商品' : '新增商品'"
      @close="drawerOpen = false"
    >
      <a-form layout="vertical">
        <div
          style="
            margin-bottom: 20px;
            padding: 18px 20px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: center;
          "
        >
          <div>
            <div style="font-weight: 700; color: #111827">发布就绪度检查</div>
            <div style="margin-top: 8px; color: #6b7280; line-height: 1.8">
              英文标题、英文描述、封面图、图片组、规格和 SKU 英文信息补齐后，商品才适合直接上架。
            </div>
          </div>
          <a-tag :color="englishReadyPreview ? 'green' : 'orange'" style="padding: 8px 12px">
            {{ englishReadyPreview ? '可直接上架' : '仍需补齐' }}
          </a-tag>
        </div>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="商品类目" required>
              <a-input v-model:value="formState.category" placeholder="如：家居餐厨 / 节庆礼品" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="售价" required>
              <a-input v-model:value="formState.price" placeholder="如：$28.00" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="库存" required>
              <a-input-number v-model:value="formState.inventory" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="商品状态" required>
              <a-select v-model:value="formState.status" :options="statusOptions" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="封面图 URL" required>
          <a-space>
            <a-input v-model:value="formState.coverImage" placeholder="请输入封面图 URL" style="flex: 1" />
            <a-upload
              :before-upload="uploadCoverImage"
              :show-upload-list="false"
              accept="image/*"
            >
              <a-button :loading="uploading" type="primary">上传封面图</a-button>
            </a-upload>
          </a-space>
        </a-form-item>

        <a-tabs>
          <a-tab-pane key="zh" tab="中文内容">
            <a-form-item label="商品中文名称" required>
              <a-input v-model:value="formState.nameZh" placeholder="请输入中文商品名称" />
            </a-form-item>
            <a-form-item label="中文描述" required>
              <a-textarea
                v-model:value="formState.descriptionZh"
                :rows="5"
                placeholder="请输入面向中文运营人员或招商素材的商品说明"
              />
            </a-form-item>
          </a-tab-pane>

          <a-tab-pane key="en" tab="英文发布内容">
            <a-form-item label="商品英文名称" required>
              <a-input v-model:value="formState.nameEn" placeholder="Enter the English product title" />
            </a-form-item>
            <a-form-item label="英文描述" required>
              <a-textarea
                v-model:value="formState.descriptionEn"
                :rows="5"
                placeholder="Enter the English description for buyer-facing product pages"
              />
            </a-form-item>
          </a-tab-pane>
        </a-tabs>

        <a-row :gutter="[16, 16]" style="margin-top: 6px">
          <a-col :span="12">
            <div class="content-panel" style="padding: 18px">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
                <div class="page-header__eyebrow" style="margin: 0">商品图片</div>
                <a-button size="small" @click="addImageField">新增图片</a-button>
              </div>
              <a-space direction="vertical" style="width: 100%">
                <div v-for="(item, index) in formState.images" :key="`image-${index}`" style="display: flex; gap: 8px; align-items: center">
                  <a-input v-model:value="formState.images[index]" placeholder="请输入图片 URL" style="flex: 1" />
                  <a-upload
                    :before-upload="(file) => uploadProductImage(file, index)"
                    :show-upload-list="false"
                    accept="image/*"
                  >
                    <a-button :loading="uploading" type="primary">上传</a-button>
                  </a-upload>
                  <a-button danger @click="removeImageField(index)">删除</a-button>
                </div>
              </a-space>
            </div>
          </a-col>

          <a-col :span="12">
            <div class="content-panel" style="padding: 18px">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
                <div class="page-header__eyebrow" style="margin: 0">商品规格</div>
                <a-button size="small" @click="addSpecField">新增规格</a-button>
              </div>
              <a-space direction="vertical" style="width: 100%">
                <div v-for="(item, index) in formState.specs" :key="`spec-${index}`" style="display: flex; gap: 8px">
                  <a-input v-model:value="formState.specs[index]" placeholder="例如：礼盒包装 / 130 x 180 cm" />
                  <a-button danger @click="removeSpecField(index)">删除</a-button>
                </div>
              </a-space>
            </div>
          </a-col>
        </a-row>

        <div class="content-panel" style="padding: 18px; margin-top: 16px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
            <div class="page-header__eyebrow" style="margin: 0">SKU 管理</div>
            <a-button size="small" @click="addSkuField">新增 SKU</a-button>
          </div>
          <a-space direction="vertical" style="width: 100%">
            <div
              v-for="(item, index) in formState.skus"
              :key="item.id"
              style="padding: 16px; border-radius: 18px; background: #f8fafc; border: 1px solid #e2e8f0"
            >
              <a-row :gutter="[12, 12]">
                <a-col :span="8">
                  <a-input v-model:value="item.skuCode" placeholder="SKU 编码" />
                </a-col>
                <a-col :span="8">
                  <a-input v-model:value="item.specSummaryZh" placeholder="中文规格摘要" />
                </a-col>
                <a-col :span="8">
                  <a-input v-model:value="item.specSummaryEn" placeholder="English spec summary" />
                </a-col>
                <a-col :span="8">
                  <a-input-number v-model:value="item.inventory" :min="0" style="width: 100%" />
                </a-col>
                <a-col :span="16" style="display: flex; justify-content: flex-end">
                  <a-button danger @click="removeSkuField(index)">删除 SKU</a-button>
                </a-col>
              </a-row>
            </div>
          </a-space>
        </div>

        <div style="margin-top: 24px; display: flex; justify-content: flex-end">
          <a-button type="primary" :loading="saving" @click="submitForm">
            {{ editingProductId ? '保存商品' : '创建商品' }}
          </a-button>
        </div>
      </a-form>
    </a-drawer>
  </div>
</template>
