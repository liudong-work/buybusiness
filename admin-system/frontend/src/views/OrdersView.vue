<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import {
  useAppStore,
  type BatchOrderShippingPayload,
  type OrderDetail,
  type OrderRecord,
  type OrderShippingPayload,
  type ShipmentBatchRecord,
} from '../stores/app';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const { orders, shipmentBatches } = storeToRefs(store);

const detailOpen = ref(false);
const currentOrder = ref<OrderDetail | null>(null);
const detailLoading = ref(false);
const actionLoading = ref(false);
const batchModalOpen = ref(false);
const previewModalOpen = ref(false);
const batchDetailOpen = ref(false);
const batchDetailLoading = ref(false);
const currentBatch = ref<ShipmentBatchRecord | null>(null);
const selectedRowKeys = ref<string[]>([]);
const exceptionDraft = ref('');
const sourceInquiryFilter = ref('');
const convertedOnlyFilter = ref(false);

const shippingForm = reactive<OrderShippingPayload>({
  logisticsCompany: '',
  trackingNumber: '',
  estimatedShipDate: '',
  shippingNote: '',
  packageCount: 1,
  boxMark: '',
});

const batchShippingForm = reactive<BatchOrderShippingPayload>({
  orderIds: [],
  logisticsCompany: '',
  trackingNumber: '',
  estimatedShipDate: '',
  shippingNote: '',
  packageCount: 1,
  boxMark: '',
});

const columns = [
  { title: '订单号', dataIndex: 'id', key: 'id' },
  { title: '买家', dataIndex: 'buyer', key: 'buyer' },
  { title: '目的地', dataIndex: 'destination', key: 'destination' },
  { title: '金额', dataIndex: 'amount', key: 'amount' },
  { title: '来源询盘', dataIndex: 'sourceInquiryId', key: 'sourceInquiryId' },
  { title: '最近更新', dataIndex: 'updatedAt', key: 'updatedAt' },
  { title: '操作', key: 'action' },
] as const;

const batchColumns = [
  { title: '批次号', dataIndex: 'id', key: 'id' },
  { title: '订单数', dataIndex: 'orderCount', key: 'orderCount' },
  { title: '物流公司', dataIndex: 'logisticsCompany', key: 'logisticsCompany' },
  { title: '预计发货', dataIndex: 'estimatedShipDate', key: 'estimatedShipDate' },
  { title: '打印状态', dataIndex: 'printed', key: 'printed' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action' },
] as const;

onMounted(async () => {
  await Promise.all([store.loadOrders(), store.loadShipmentBatches()]);
});

watch(
  () => route.query,
  (query) => {
    sourceInquiryFilter.value = typeof query.sourceInquiryId === 'string' ? query.sourceInquiryId : '';
    convertedOnlyFilter.value = query.convertedOnly === '1';
  },
  { immediate: true }
);

watch(
  () => route.query.orderId,
  async (orderId) => {
    if (typeof orderId === 'string' && orderId) {
      await openOrder(orderId);
    }
  },
  { immediate: true }
);

const activeStatusFilter = computed(() => {
  const status = route.query.status;
  if (
    status === 'submitted' ||
    status === 'processing' ||
    status === 'ready_to_ship' ||
    status === 'completed' ||
    status === 'exception'
  ) {
    return status;
  }
  return '';
});

const sourceInquiryOptions = computed(() =>
  Array.from(new Set(orders.value.map((item) => item.sourceInquiryId).filter(Boolean))).map((item) => ({
    label: item,
    value: item,
  }))
);

const highlightedOrderId = computed(() => (typeof route.query.orderId === 'string' ? route.query.orderId : ''));

const visibleOrders = computed(() =>
  orders.value.filter((item) => {
    if (activeStatusFilter.value && item.status !== activeStatusFilter.value) return false;
    if (sourceInquiryFilter.value && item.sourceInquiryId !== sourceInquiryFilter.value) return false;
    if (convertedOnlyFilter.value && !item.sourceInquiryId) return false;
    return true;
  })
);

const selectedCount = computed(() => selectedRowKeys.value.length);
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[]) => {
    selectedRowKeys.value = keys.map((item) => String(item));
  },
}));

function statusClass(status: OrderRecord['status']) {
  if (status === 'completed') return 'status-pill status-pill--success';
  if (status === 'processing' || status === 'ready_to_ship') return 'status-pill status-pill--processing';
  if (status === 'exception') return 'status-pill status-pill--warning';
  return 'status-pill status-pill--muted';
}

function statusText(status: OrderRecord['status']) {
  if (status === 'submitted') return '已提交';
  if (status === 'processing') return '处理中';
  if (status === 'ready_to_ship') return '待发货';
  if (status === 'completed') return '已完成';
  return '异常处理中';
}

function nextStatus(status: OrderRecord['status']): OrderRecord['status'] | null {
  if (status === 'submitted') return 'processing';
  if (status === 'processing') return 'ready_to_ship';
  if (status === 'ready_to_ship') return 'completed';
  return null;
}

function resetShippingForm(form: OrderShippingPayload) {
  form.logisticsCompany = '';
  form.trackingNumber = '';
  form.estimatedShipDate = '';
  form.shippingNote = '';
  form.packageCount = 1;
  form.boxMark = '';
}

function validateShipping(form: OrderShippingPayload) {
  if (!form.logisticsCompany.trim()) return '请填写物流公司';
  if (!form.trackingNumber.trim()) return '请填写运单号或提单号';
  if (!form.estimatedShipDate.trim()) return '请填写预计发货日期';
  if (form.packageCount <= 0) return '箱数必须大于 0';
  if (!form.boxMark.trim()) return '请填写箱唛';
  return '';
}

async function openOrder(orderId: string) {
  detailLoading.value = true;
  detailOpen.value = true;
  try {
    currentOrder.value = await store.getOrderDetail(orderId);
    shippingForm.logisticsCompany = currentOrder.value.logisticsCompany;
    shippingForm.trackingNumber = currentOrder.value.trackingNumber;
    shippingForm.estimatedShipDate = currentOrder.value.estimatedShipDate;
    shippingForm.shippingNote = currentOrder.value.shippingNote;
    shippingForm.packageCount = currentOrder.value.packageCount;
    shippingForm.boxMark = currentOrder.value.boxMark;
    exceptionDraft.value = currentOrder.value.exceptionReason;
  } finally {
    detailLoading.value = false;
  }
}

function syncRouteFilters() {
  router.replace({
    path: '/orders',
    query: {
      ...route.query,
      sourceInquiryId: sourceInquiryFilter.value || undefined,
      convertedOnly: convertedOnlyFilter.value ? '1' : undefined,
    },
  });
}

function clearFilters() {
  sourceInquiryFilter.value = '';
  convertedOnlyFilter.value = false;
  router.replace({
    path: '/orders',
    query: {
      status: activeStatusFilter.value || undefined,
      orderId: highlightedOrderId.value || undefined,
    },
  });
}

async function advanceOrderStatus() {
  if (!currentOrder.value) return;
  const next = nextStatus(currentOrder.value.status);
  if (!next) return;

  actionLoading.value = true;
  try {
    currentOrder.value = await store.updateOrderStatus(currentOrder.value.id, next);
    await store.loadOrders();
    message.success('订单状态已更新');
  } finally {
    actionLoading.value = false;
  }
}

async function saveShipping() {
  if (!currentOrder.value) return;
  const error = validateShipping(shippingForm);
  if (error) {
    message.warning(error);
    return;
  }

  actionLoading.value = true;
  try {
    currentOrder.value = await store.updateOrderShipping(currentOrder.value.id, { ...shippingForm });
    await store.loadOrders();
    message.success('发货信息已保存');
  } finally {
    actionLoading.value = false;
  }
}

function openBatchModal() {
  if (!selectedCount.value) {
    message.warning('请先选择要批量处理的订单');
    return;
  }
  batchShippingForm.orderIds = [...selectedRowKeys.value];
  resetShippingForm(batchShippingForm);
  batchModalOpen.value = true;
}

async function submitBatchShipping() {
  const error = validateShipping(batchShippingForm);
  if (error) {
    message.warning(error);
    return;
  }

  actionLoading.value = true;
  try {
    await store.batchUpdateOrderShipping({ ...batchShippingForm, orderIds: [...selectedRowKeys.value] });
    await Promise.all([store.loadOrders(), store.loadShipmentBatches()]);
    batchModalOpen.value = false;
    selectedRowKeys.value = [];
    message.success('批量发货信息已录入并生成批次');
  } finally {
    actionLoading.value = false;
  }
}

async function markException(resolved: boolean) {
  if (!currentOrder.value) return;
  if (!resolved && !exceptionDraft.value.trim()) {
    message.warning('请填写异常原因');
    return;
  }

  actionLoading.value = true;
  try {
    currentOrder.value = await store.markOrderException(currentOrder.value.id, {
      reason: exceptionDraft.value,
      resolved,
    });
    await store.loadOrders();
    message.success(resolved ? '异常已处理' : '订单已标记异常');
  } finally {
    actionLoading.value = false;
  }
}

function jumpToInquiry() {
  if (!currentOrder.value?.sourceInquiryId) return;
  router.push({
    path: '/inquiries',
    query: {
      inquiryId: currentOrder.value.sourceInquiryId,
      orderId: currentOrder.value.id,
    },
  });
}

async function openBatchDetail(batchId: string) {
  batchDetailLoading.value = true;
  batchDetailOpen.value = true;
  try {
    currentBatch.value = await store.getShipmentBatchDetail(batchId);
  } finally {
    batchDetailLoading.value = false;
  }
}

async function markBatchPrinted(batchId: string) {
  await store.markShipmentBatchPrinted(batchId);
  if (currentBatch.value?.id === batchId) {
    currentBatch.value = await store.getShipmentBatchDetail(batchId);
  }
  message.success('批次已标记为已打印');
}

function exportBatch(batch: ShipmentBatchRecord) {
  if (typeof window === 'undefined') return;
  const content = [
    `批次号：${batch.id}`,
    `订单数量：${batch.orderCount}`,
    `订单明细：${batch.orderIds.join('、')}`,
    `物流公司：${batch.logisticsCompany}`,
    `运单号：${batch.trackingNumber}`,
    `预计发货：${batch.estimatedShipDate}`,
    `箱数：${batch.packageCount}`,
    `箱唛：${batch.boxMark}`,
    `发货备注：${batch.shippingNote || '无'}`,
    `打印状态：${batch.printed ? '已打印' : '未打印'}`,
    `创建时间：${batch.createdAt}`,
  ].join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${batch.id}.txt`;
  link.click();
  window.URL.revokeObjectURL(link.href);
  message.success(`已导出 ${batch.id}`);
}

function rowClassName(record: OrderRecord) {
  return highlightedOrderId.value === record.id ? 'orders-row--highlight' : '';
}

async function exportOrders() {
  const status = activeStatusFilter.value;
  try {
    const response = await fetch(`/api/v1/orders/export${status ? `?status=${status}` : ''}`);
    const data = await response.json();
    
    const blob = new Blob([data.data], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = data.filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
    message.success(`已导出 ${data.count} 条订单`);
  } catch (error) {
    message.error('导出失败');
    console.error('Export failed:', error);
  }
}
</script>

<template>
  <div>
    <div class="content-panel" style="padding: 24px; margin-bottom: 22px">
      <div class="page-header">
        <div class="page-header__meta">
          <p class="page-header__eyebrow">订单管理</p>
          <h1>把来源询盘、发货动作和批次履约都收进订单闭环</h1>
          <p>
            现在不仅能录发货和推进状态，也能按来源询盘筛选、从订单回跳原询盘，并把批量发货沉淀成独立批次。
          </p>
        </div>
        <a-space>
          <a-button @click="openBatchModal">批量发货 {{ selectedCount ? `(${selectedCount})` : '' }}</a-button>
          <a-button type="primary" @click="selectedCount ? openBatchModal() : message.warning('请先选择订单')">创建发货批次</a-button>
          <a-button @click="exportOrders">导出订单列表</a-button>
        </a-space>
      </div>

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :lg="9">
          <a-select
            v-model:value="sourceInquiryFilter"
            allow-clear
            placeholder="按来源询盘筛选"
            style="width: 100%"
            :options="sourceInquiryOptions"
            @change="syncRouteFilters"
          />
        </a-col>
        <a-col :xs="24" :lg="8" style="display: flex; align-items: center">
          <a-checkbox v-model:checked="convertedOnlyFilter" @change="syncRouteFilters">仅看询盘转单</a-checkbox>
        </a-col>
        <a-col :xs="24" :lg="7" style="display: flex; justify-content: flex-end">
          <a-button @click="clearFilters">清空筛选</a-button>
        </a-col>
      </a-row>

      <div
        v-if="activeStatusFilter || sourceInquiryFilter || convertedOnlyFilter || highlightedOrderId"
        style="
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
          line-height: 1.8;
        "
      >
        <div v-if="activeStatusFilter">状态筛选：{{ statusText(activeStatusFilter) }}</div>
        <div v-if="sourceInquiryFilter">来源询盘：{{ sourceInquiryFilter }}</div>
        <div v-if="convertedOnlyFilter">当前仅展示由询盘转单生成的订单</div>
        <div v-if="highlightedOrderId">当前高亮订单：{{ highlightedOrderId }}</div>
      </div>
    </div>

    <div class="content-panel" style="padding: 24px; margin-bottom: 22px">
      <a-table
        :columns="columns"
        :data-source="visibleOrders"
        :pagination="{ pageSize: 6 }"
        row-key="id"
        :row-selection="rowSelection"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'id'">
            <div>
              <div style="font-weight: 700; color: #111827">{{ record.id }}</div>
              <div style="margin-top: 4px; display: flex; gap: 8px; flex-wrap: wrap">
                <span :class="statusClass(record.status)">{{ statusText(record.status) }}</span>
                <a-tag v-if="record.exceptionStatus === 'pending'" color="orange">异常待处理</a-tag>
                <a-tag v-if="record.exceptionStatus === 'resolved'" color="green">异常已恢复</a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'sourceInquiryId'">
            <div>
              <a-tag v-if="record.sourceInquiryId" color="blue">{{ record.sourceInquiryId }}</a-tag>
              <span v-else style="color: #94a3b8">直建订单</span>
              <div v-if="record.sourceQuoteVersion" style="margin-top: 6px; color: #6b7280; font-size: 12px">
                {{ record.sourceQuoteVersion }}
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button type="link" @click="openOrder(record.id)">查看详情</a-button>
              <a-button v-if="record.sourceInquiryId" type="link" @click="router.push({ path: '/inquiries', query: { inquiryId: record.sourceInquiryId, orderId: record.id } })">
                回到询盘
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <div class="content-panel" style="padding: 24px">
      <div class="page-header" style="margin-bottom: 18px">
        <div class="page-header__meta">
          <p class="page-header__eyebrow">发货批次</p>
          <h1 style="font-size: 24px">把批量发货动作沉淀成可追踪批次</h1>
        </div>
      </div>

      <a-table :columns="batchColumns" :data-source="shipmentBatches" row-key="id" :pagination="{ pageSize: 6 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'id'">
            <div>
              <div style="font-weight: 700; color: #111827">{{ record.id }}</div>
              <div style="margin-top: 6px; color: #6b7280; font-size: 12px">{{ record.orderIds.join('、') }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'printed'">
            <a-tag :color="record.printed ? 'green' : 'orange'">{{ record.printed ? '已打印' : '未打印' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button type="link" @click="openBatchDetail(record.id)">查看详情</a-button>
              <a-button type="link" @click="exportBatch(record)">导出</a-button>
              <a-button v-if="!record.printed" type="link" @click="markBatchPrinted(record.id)">标记已打印</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <a-drawer :open="detailOpen" :width="920" title="订单详情" @close="detailOpen = false">
      <a-spin :spinning="detailLoading">
        <template v-if="currentOrder">
          <div class="metric-card" style="padding: 20px; margin-bottom: 20px">
            <div style="display: flex; justify-content: space-between; gap: 16px; align-items: flex-start">
              <div>
                <div style="font-size: 24px; font-weight: 700; color: #111827">{{ currentOrder.id }}</div>
                <div style="margin-top: 8px; color: #6b7280">{{ currentOrder.buyer }} · {{ currentOrder.destination }}</div>
              </div>
              <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end">
                <span :class="statusClass(currentOrder.status)">{{ statusText(currentOrder.status) }}</span>
                <a-tag v-if="currentOrder.exceptionStatus === 'pending'" color="orange">异常待处理</a-tag>
                <a-tag v-if="currentOrder.exceptionStatus === 'resolved'" color="green">异常已恢复</a-tag>
              </div>
            </div>
            <div style="margin-top: 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">
              <div><strong>联系人：</strong>{{ currentOrder.contactName }}</div>
              <div><strong>联系电话：</strong>{{ currentOrder.contactPhone }}</div>
              <div><strong>付款方式：</strong>{{ currentOrder.paymentMethod }}</div>
              <div><strong>最近更新：</strong>{{ currentOrder.updatedAt }}</div>
            </div>
            <div v-if="currentOrder.sourceInquiryId" style="margin-top: 14px">
              <strong>来源询盘：</strong>{{ currentOrder.sourceInquiryId }} / {{ currentOrder.sourceQuoteVersion }}
              <a-button type="link" @click="jumpToInquiry">跳回原询盘</a-button>
            </div>
            <div style="margin-top: 14px"><strong>收货地址：</strong>{{ currentOrder.shippingAddress }}</div>
            <div style="margin-top: 14px"><strong>内部备注：</strong>{{ currentOrder.internalNote }}</div>
          </div>

          <div class="content-panel" style="padding: 20px; margin-bottom: 20px">
            <div class="page-header__eyebrow" style="margin-bottom: 10px">订单商品</div>
            <a-table
              :pagination="false"
              :data-source="currentOrder.items"
              row-key="sku"
              :columns="[
                { title: '商品', dataIndex: 'productName' },
                { title: 'SKU', dataIndex: 'sku' },
                { title: '数量', dataIndex: 'quantity' },
                { title: '单价', dataIndex: 'unitPrice' },
              ]"
            />
          </div>

          <a-row :gutter="[18, 18]">
            <a-col :span="12">
              <div class="content-panel" style="padding: 20px; margin-bottom: 20px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">履约时间线</div>
                <a-timeline>
                  <a-timeline-item
                    v-for="step in currentOrder.timeline"
                    :key="step.label"
                    :color="step.current ? 'blue' : step.done ? 'green' : 'gray'"
                  >
                    <div style="font-weight: 700; color: #111827">{{ step.label }}</div>
                    <div style="margin-top: 4px; color: #6b7280">{{ step.time }}</div>
                  </a-timeline-item>
                </a-timeline>
              </div>

              <div class="content-panel" style="padding: 20px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">异常处理</div>
                <a-textarea
                  v-model:value="exceptionDraft"
                  :rows="4"
                  placeholder="填写异常原因，例如地址变更、标签问题、货代延迟等"
                />
                <div style="margin-top: 14px; display: flex; justify-content: flex-end; gap: 10px">
                  <a-button danger :loading="actionLoading" @click="markException(false)">标记异常</a-button>
                  <a-button :loading="actionLoading" @click="markException(true)">恢复订单</a-button>
                </div>
              </div>
            </a-col>

            <a-col :span="12">
              <div class="content-panel" style="padding: 20px; margin-bottom: 20px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">发货信息录入</div>
                <a-row :gutter="[16, 16]">
                  <a-col :span="12">
                    <a-input v-model:value="shippingForm.logisticsCompany" placeholder="物流公司，如 DHL / UPS / 马士基" />
                  </a-col>
                  <a-col :span="12">
                    <a-input v-model:value="shippingForm.trackingNumber" placeholder="运单号 / 提单号" />
                  </a-col>
                  <a-col :span="12">
                    <a-input v-model:value="shippingForm.estimatedShipDate" placeholder="预计发货日期，如 2026-04-24" />
                  </a-col>
                  <a-col :span="12">
                    <a-input-number v-model:value="shippingForm.packageCount" :min="1" style="width: 100%" />
                  </a-col>
                  <a-col :span="24">
                    <a-input v-model:value="shippingForm.boxMark" placeholder="箱唛，如 WE / LOS ANGELES / SKU LABEL" />
                  </a-col>
                  <a-col :span="24">
                    <a-textarea v-model:value="shippingForm.shippingNote" :rows="3" placeholder="补充发货备注、打托要求、标签说明等" />
                  </a-col>
                </a-row>
                <div style="margin-top: 14px; display: flex; justify-content: space-between; gap: 10px">
                  <a-button @click="previewModalOpen = true">打印面单 / 箱唛预览</a-button>
                  <a-button :loading="actionLoading" type="primary" @click="saveShipping">保存发货信息</a-button>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end">
                <a-button
                  v-if="nextStatus(currentOrder.status)"
                  type="primary"
                  :loading="actionLoading"
                  @click="advanceOrderStatus"
                >
                  推进到下一状态
                </a-button>
              </div>
            </a-col>
          </a-row>
        </template>
      </a-spin>
    </a-drawer>

    <a-drawer :open="batchDetailOpen" :width="560" title="发货批次详情" @close="batchDetailOpen = false">
      <a-spin :spinning="batchDetailLoading">
        <template v-if="currentBatch">
          <div class="metric-card" style="padding: 20px">
            <div style="font-size: 24px; font-weight: 700; color: #111827">{{ currentBatch.id }}</div>
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap">
              <a-tag color="blue">{{ currentBatch.orderCount }} 单</a-tag>
              <a-tag :color="currentBatch.printed ? 'green' : 'orange'">
                {{ currentBatch.printed ? '已打印' : '未打印' }}
              </a-tag>
            </div>
            <div style="margin-top: 16px; line-height: 2; color: #374151">
              <div><strong>订单：</strong>{{ currentBatch.orderIds.join('、') }}</div>
              <div><strong>物流公司：</strong>{{ currentBatch.logisticsCompany }}</div>
              <div><strong>运单号：</strong>{{ currentBatch.trackingNumber }}</div>
              <div><strong>预计发货：</strong>{{ currentBatch.estimatedShipDate }}</div>
              <div><strong>箱数：</strong>{{ currentBatch.packageCount }}</div>
              <div><strong>箱唛：</strong>{{ currentBatch.boxMark }}</div>
              <div><strong>备注：</strong>{{ currentBatch.shippingNote || '无' }}</div>
              <div><strong>创建时间：</strong>{{ currentBatch.createdAt }}</div>
            </div>
            <div style="margin-top: 18px; display: flex; justify-content: flex-end; gap: 10px">
              <a-button @click="exportBatch(currentBatch)">导出批次</a-button>
              <a-button v-if="!currentBatch.printed" type="primary" @click="markBatchPrinted(currentBatch.id)">标记已打印</a-button>
            </div>
          </div>
        </template>
      </a-spin>
    </a-drawer>

    <a-modal v-model:open="batchModalOpen" title="批量发货信息录入" @ok="submitBatchShipping" :confirm-loading="actionLoading">
      <div style="margin-bottom: 16px; color: #6b7280">当前已选 {{ selectedCount }} 个订单，将统一录入发货信息并生成批次。</div>
      <a-space direction="vertical" style="width: 100%">
        <a-input v-model:value="batchShippingForm.logisticsCompany" placeholder="物流公司" />
        <a-input v-model:value="batchShippingForm.trackingNumber" placeholder="运单号 / 提单号" />
        <a-input v-model:value="batchShippingForm.estimatedShipDate" placeholder="预计发货日期" />
        <a-input-number v-model:value="batchShippingForm.packageCount" :min="1" style="width: 100%" />
        <a-input v-model:value="batchShippingForm.boxMark" placeholder="箱唛" />
        <a-textarea v-model:value="batchShippingForm.shippingNote" :rows="3" placeholder="发货备注" />
      </a-space>
    </a-modal>

    <a-modal v-model:open="previewModalOpen" title="面单 / 箱唛预览" :footer="null">
      <template v-if="currentOrder">
        <div
          style="
            padding: 18px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px dashed #94a3b8;
            line-height: 2;
            color: #111827;
          "
        >
          <div><strong>订单号：</strong>{{ currentOrder.id }}</div>
          <div><strong>收件方：</strong>{{ currentOrder.contactName }} / {{ currentOrder.contactPhone }}</div>
          <div><strong>目的地：</strong>{{ currentOrder.destination }}</div>
          <div><strong>地址：</strong>{{ currentOrder.shippingAddress }}</div>
          <div><strong>物流公司：</strong>{{ shippingForm.logisticsCompany || currentOrder.logisticsCompany }}</div>
          <div><strong>运单号：</strong>{{ shippingForm.trackingNumber || currentOrder.trackingNumber }}</div>
          <div><strong>箱数：</strong>{{ shippingForm.packageCount || currentOrder.packageCount }}</div>
          <div><strong>箱唛：</strong>{{ shippingForm.boxMark || currentOrder.boxMark }}</div>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<style scoped>
:deep(.orders-row--highlight td) {
  background: #fff7ed !important;
}
</style>
