<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import { useAppStore, type SettingsRecord } from '../stores/app';

const store = useAppStore();
const { settings } = storeToRefs(store);
const saving = ref(false);

const formState = reactive<SettingsRecord>({
  shopName: '',
  contactEmail: '',
  contactPhone: '',
  defaultLeadTime: '',
  samplePolicy: '',
  defaultPaymentTerms: '',
  defaultSampleFeePolicy: '',
});

onMounted(() => {
  store.loadSettings();
});

watch(
  settings,
  (value) => {
    if (!value) return;
    Object.assign(formState, value);
  },
  { immediate: true }
);

async function saveSettings() {
  if (!formState.shopName.trim() || !formState.contactEmail.trim() || !formState.contactPhone.trim()) {
    message.warning('请先补齐店铺名称、邮箱和联系电话');
    return;
  }

  saving.value = true;
  try {
    await store.saveSettings({ ...formState });
    message.success('店铺设置已保存');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header__meta">
        <p class="page-header__eyebrow">店铺设置</p>
        <h1>统一维护卖家店铺的默认业务口径和联系方式</h1>
        <p>
          这里已经从展示页改成可编辑设置页，修改后可以直接保存，便于后续在询盘报价、商品发布和订单沟通里复用统一配置。
        </p>
      </div>
      <a-button type="primary" size="large" :loading="saving" @click="saveSettings">保存设置</a-button>
    </div>

    <a-row :gutter="[18, 18]">
      <a-col :xs="24" :xl="14">
        <div class="content-panel" style="padding: 24px">
          <div class="page-header__eyebrow" style="margin-bottom: 12px">基础信息</div>
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="店铺名称" required>
                  <a-input v-model:value="formState.shopName" placeholder="请输入店铺名称" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="客服邮箱" required>
                  <a-input v-model:value="formState.contactEmail" placeholder="请输入客服邮箱" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="联系电话" required>
              <a-input v-model:value="formState.contactPhone" placeholder="请输入联系电话" />
            </a-form-item>

            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item label="默认交期">
                  <a-input v-model:value="formState.defaultLeadTime" placeholder="例如：15-20 个工作日" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="默认付款条款">
                  <a-input v-model:value="formState.defaultPaymentTerms" placeholder="例如：30% 定金，70% 发货前付清" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="样品政策">
              <a-textarea
                v-model:value="formState.samplePolicy"
                :rows="4"
                placeholder="请输入样品政策，例如哪些询盘可安排样品、响应时效等"
              />
            </a-form-item>

            <a-form-item label="默认样品费政策">
              <a-textarea
                v-model:value="formState.defaultSampleFeePolicy"
                :rows="4"
                placeholder="请输入默认样品费政策，例如返还规则、出样周期等"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-col>

      <a-col :xs="24" :xl="10">
        <div class="metric-card" style="padding: 24px; margin-bottom: 18px">
          <div class="page-header__eyebrow" style="margin-bottom: 10px">当前设置预览</div>
          <div style="font-size: 24px; font-weight: 700; color: #111827">{{ formState.shopName || '未填写店铺名称' }}</div>
          <div style="margin-top: 14px; color: #4b5563; line-height: 1.9">
            <div><strong>客服邮箱：</strong>{{ formState.contactEmail || '--' }}</div>
            <div><strong>联系电话：</strong>{{ formState.contactPhone || '--' }}</div>
            <div><strong>默认交期：</strong>{{ formState.defaultLeadTime || '--' }}</div>
            <div><strong>付款条款：</strong>{{ formState.defaultPaymentTerms || '--' }}</div>
          </div>
        </div>

        <div
          class="content-panel"
          style="
            padding: 24px;
            background: linear-gradient(135deg, #111827, #1f2937 64%, #9a3412);
            color: white;
          "
        >
          <div class="page-header__eyebrow" style="color: rgba(253, 230, 138, 0.92)">配置用途</div>
          <div style="font-size: 22px; font-weight: 700">业务口径统一</div>
          <div style="margin-top: 14px; color: rgba(255,255,255,0.8); line-height: 1.9">
            修改后的设置可以作为询盘报价、样品沟通、商品发布和订单交付时的默认口径，减少团队成员各自维护文案的成本。
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
