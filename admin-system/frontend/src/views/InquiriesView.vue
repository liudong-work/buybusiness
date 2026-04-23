<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { MessageOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore, type InquiryDetail, type InquiryQuoteItem, type InquiryRecord } from '../stores/app';

const store = useAppStore();
const route = useRoute();
const router = useRouter();
const { inquiries } = storeToRefs(store);

const detailOpen = ref(false);
const detailLoading = ref(false);
const actionLoading = ref(false);
const currentInquiry = ref<InquiryDetail | null>(null);
const replyMessage = ref('');
const noteMessage = ref('');
const selectedStatus = ref<InquiryRecord['status']>('new');
const selectedOwner = ref('');
const selectedQuoteId = ref('');
const highlightedInquiryId = ref('');

const ownerOptions = [
  { label: '王敏', value: '王敏' },
  { label: '刘畅', value: '刘畅' },
  { label: '赵磊', value: '赵磊' },
] as const;

const quoteForm = reactive({
  currency: 'USD',
  validUntil: '2026-04-30',
  shippingFee: 0,
  leadTime: '15-20 天',
  paymentTerms: '30% 定金，70% 发货前付清',
  note: '',
  items: [] as InquiryQuoteItem[],
});

const convertForm = reactive({
  contactName: '',
  contactPhone: '',
  shippingAddress: '',
  paymentMethod: '30% 定金，70% 发货前付清',
  internalNote: '',
});

onMounted(() => {
  store.loadInquiries();
});

watch(
  () => route.query.inquiryId,
  async (inquiryId) => {
    highlightedInquiryId.value = typeof inquiryId === 'string' ? inquiryId : '';
    if (typeof inquiryId === 'string' && inquiryId) {
      await openInquiry(inquiryId);
    }
  },
  { immediate: true }
);

watch(selectedQuoteId, (quoteId) => {
  if (!quoteId || !currentInquiry.value) return;
  const matched = currentInquiry.value.quotes.find((item) => item.id === quoteId);
  if (matched) {
    convertForm.paymentMethod = matched.paymentTerms;
  }
});

const activeStatusFilter = computed(() => {
  const status = route.query.status;
  if (status === 'new' || status === 'follow_up' || status === 'quoted' || status === 'converted') {
    return status;
  }
  return '';
});

const visibleInquiries = computed(() =>
  activeStatusFilter.value ? inquiries.value.filter((item) => item.status === activeStatusFilter.value) : inquiries.value
);

function priorityColor(priority: string) {
  if (priority === 'high') return 'red';
  if (priority === 'medium') return 'orange';
  return 'blue';
}

function statusClass(status: string) {
  if (status === 'quoted' || status === 'converted') return 'status-pill status-pill--success';
  if (status === 'follow_up') return 'status-pill status-pill--processing';
  return 'status-pill status-pill--warning';
}

function priorityText(priority: string) {
  if (priority === 'high') return '高优先级';
  if (priority === 'medium') return '中优先级';
  return '低优先级';
}

function statusText(status: string) {
  if (status === 'converted') return '已转订单';
  if (status === 'quoted') return '已报价';
  if (status === 'follow_up') return '跟进中';
  return '待处理';
}

function activityRoleText(role: string) {
  if (role === 'buyer') return '买家';
  if (role === 'seller') return '卖家';
  return '系统';
}

function parsePriceHint(priceHint: string) {
  const matched = priceHint.replace(/[^0-9.]/g, '');
  return Number(matched || 0);
}

function buildQuoteItems(inquiry: InquiryDetail) {
  return inquiry.items.map((item, index) => ({
    productName: item.productName,
    sku: `SKU-${index + 1}`,
    quantity: item.quantity,
    unitPrice: parsePriceHint(item.priceHint),
    note: '',
  }));
}

function resetQuoteForm(inquiry: InquiryDetail) {
  quoteForm.currency = 'USD';
  quoteForm.validUntil = '2026-04-30';
  quoteForm.shippingFee = 0;
  quoteForm.leadTime = '15-20 天';
  quoteForm.paymentTerms = '30% 定金，70% 发货前付清';
  quoteForm.note = '';
  quoteForm.items = buildQuoteItems(inquiry);
  selectedQuoteId.value = inquiry.quotes[0]?.id ?? '';
  convertForm.contactName = inquiry.buyer;
  convertForm.contactPhone = '';
  convertForm.shippingAddress = '';
  convertForm.paymentMethod = inquiry.quotes[0]?.paymentTerms ?? '30% 定金，70% 发货前付清';
  convertForm.internalNote = inquiry.convertedOrderId
    ? `该询盘已转为订单 ${inquiry.convertedOrderId}。`
    : `由询盘 ${inquiry.id} 转单生成，优先延续 ${inquiry.owner} 的跟进节奏。`;
}

function addQuoteLine() {
  quoteForm.items.push({
    productName: '',
    sku: '',
    quantity: 1,
    unitPrice: 0,
    note: '',
  });
}

function removeQuoteLine(index: number) {
  quoteForm.items.splice(index, 1);
}

async function openInquiry(inquiryId: string) {
  detailOpen.value = true;
  detailLoading.value = true;
  replyMessage.value = '';
  noteMessage.value = '';
  try {
    currentInquiry.value = await store.getInquiryDetail(inquiryId);
    selectedStatus.value = currentInquiry.value.status;
    selectedOwner.value = currentInquiry.value.owner;
    resetQuoteForm(currentInquiry.value);
  } finally {
    detailLoading.value = false;
  }
}

async function submitReply() {
  if (!currentInquiry.value || !replyMessage.value.trim()) return;
  actionLoading.value = true;
  try {
    currentInquiry.value = await store.replyInquiry(currentInquiry.value.id, {
      author: currentInquiry.value.owner,
      message: replyMessage.value,
    });
    selectedStatus.value = currentInquiry.value.status;
    replyMessage.value = '';
    message.success('跟进回复已添加');
  } finally {
    actionLoading.value = false;
  }
}

async function submitNote() {
  if (!currentInquiry.value || !noteMessage.value.trim()) return;
  actionLoading.value = true;
  try {
    currentInquiry.value = await store.addInquiryNote(currentInquiry.value.id, {
      author: currentInquiry.value.owner,
      message: noteMessage.value,
    });
    noteMessage.value = '';
    message.success('内部备注已保存');
  } finally {
    actionLoading.value = false;
  }
}

async function submitStatus() {
  if (!currentInquiry.value) return;
  actionLoading.value = true;
  try {
    currentInquiry.value = await store.updateInquiryStatus(currentInquiry.value.id, selectedStatus.value);
    message.success('询盘状态已更新');
  } finally {
    actionLoading.value = false;
  }
}

async function submitOwner() {
  if (!currentInquiry.value || !selectedOwner.value) return;
  actionLoading.value = true;
  try {
    currentInquiry.value = await store.updateInquiryOwner(currentInquiry.value.id, { owner: selectedOwner.value });
    message.success('负责人已更新');
  } finally {
    actionLoading.value = false;
  }
}

async function submitQuote() {
  if (!currentInquiry.value) return;
  if (!quoteForm.validUntil.trim() || !quoteForm.leadTime.trim() || !quoteForm.paymentTerms.trim()) {
    message.warning('请先补齐报价基础信息');
    return;
  }

  const validItems = quoteForm.items.filter((item) => item.productName.trim());
  if (!validItems.length || validItems.some((item) => !item.sku.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
    message.warning('请补齐报价商品行的 SKU、数量和单价');
    return;
  }

  actionLoading.value = true;
  try {
    currentInquiry.value = await store.createInquiryQuote(currentInquiry.value.id, {
      author: currentInquiry.value.owner,
      currency: quoteForm.currency,
      validUntil: quoteForm.validUntil,
      shippingFee: quoteForm.shippingFee,
      leadTime: quoteForm.leadTime,
      paymentTerms: quoteForm.paymentTerms,
      note: quoteForm.note,
      items: validItems,
    });
    selectedStatus.value = currentInquiry.value.status;
    message.success('报价版本已生成');
  } finally {
    actionLoading.value = false;
  }
}

async function submitConvertToOrder() {
  if (!currentInquiry.value) return;
  if (!selectedQuoteId.value) {
    message.warning('请先选择要转单的报价版本');
    return;
  }
  if (!convertForm.contactName.trim() || !convertForm.contactPhone.trim() || !convertForm.shippingAddress.trim()) {
    message.warning('请补齐联系人、联系电话和收货地址');
    return;
  }

  actionLoading.value = true;
  try {
    const result = await store.convertInquiryToOrder(currentInquiry.value.id, {
      quoteId: selectedQuoteId.value,
      contactName: convertForm.contactName,
      contactPhone: convertForm.contactPhone,
      shippingAddress: convertForm.shippingAddress,
      paymentMethod: convertForm.paymentMethod,
      internalNote: convertForm.internalNote,
    });
    currentInquiry.value = result.inquiry;
    selectedStatus.value = result.inquiry.status;
    message.success(`已生成订单 ${result.order.id}`);
    router.push({
      path: '/orders',
      query: {
        orderId: result.order.id,
        sourceInquiryId: result.inquiry.id,
        convertedOnly: '1',
      },
    });
  } finally {
    actionLoading.value = false;
  }
}

function openConvertedOrder() {
  if (!currentInquiry.value?.convertedOrderId) return;
  router.push({
    path: '/orders',
    query: {
      orderId: currentInquiry.value.convertedOrderId,
      sourceInquiryId: currentInquiry.value.id,
      convertedOnly: '1',
    },
  });
}

function cardClass(inquiryId: string) {
  return highlightedInquiryId.value === inquiryId ? 'metric-card inquiry-card inquiry-card--highlight' : 'metric-card inquiry-card';
}
</script>

<template>
  <div class="content-panel" style="padding: 24px">
    <div class="page-header">
      <div class="page-header__meta">
        <p class="page-header__eyebrow">询盘管理</p>
        <h1>让跟进、报价和历史版本都回到同一条询盘链路里</h1>
        <p>
          现在除了负责人、状态和跟进记录，也能直接在详情里录入报价版本，沉淀报价历史并继续补充后续沟通。
        </p>
      </div>
      <a-space>
        <a-button>分配负责人</a-button>
        <a-button type="primary">批量回复</a-button>
      </a-space>
    </div>

    <a-row :gutter="[18, 18]">
      <a-col v-for="item in visibleInquiries" :key="item.id" :xs="24" :lg="12" :xl="8">
        <div :class="cardClass(item.id)" style="padding: 22px">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px">
            <div>
              <div style="display: flex; align-items: center; gap: 12px">
                <a-avatar style="background: #eff6ff; color: #1d4ed8">
                  <MessageOutlined />
                </a-avatar>
                <div>
                  <div style="font-weight: 700; color: #111827">{{ item.buyer }}</div>
                  <div style="margin-top: 4px; color: #6b7280; font-size: 13px">{{ item.id }}</div>
                </div>
              </div>
              <div style="margin-top: 18px; font-size: 18px; font-weight: 700; color: #111827">{{ item.topic }}</div>
              <div style="margin-top: 12px; color: #6b7280">最近更新：{{ item.updatedAt }}</div>
              <div v-if="item.latestQuoteVersion" style="margin-top: 8px; color: #1d4ed8; font-weight: 600">
                最新报价：{{ item.latestQuoteVersion }}
              </div>
              <div v-if="item.convertedOrderId" style="margin-top: 8px; color: #047857; font-weight: 600">
                已转订单：{{ item.convertedOrderId }}
              </div>
            </div>
            <a-tag :color="priorityColor(item.priority)">{{ priorityText(item.priority) }}</a-tag>
          </div>

          <div style="margin-top: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px">
            <span :class="statusClass(item.status)">{{ statusText(item.status) }}</span>
            <a-button type="link" @click="openInquiry(item.id)">查看详情</a-button>
          </div>
        </div>
      </a-col>
    </a-row>

    <div
      v-if="activeStatusFilter || highlightedInquiryId"
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
      <div v-if="activeStatusFilter">当前正在查看筛选结果：{{ statusText(activeStatusFilter) }}</div>
      <div v-if="highlightedInquiryId">当前高亮询盘：{{ highlightedInquiryId }}</div>
    </div>

    <a-drawer :open="detailOpen" :width="1160" title="询盘详情" @close="detailOpen = false">
      <a-spin :spinning="detailLoading">
        <template v-if="currentInquiry">
          <div class="metric-card" style="padding: 20px; margin-bottom: 20px">
            <div style="display: flex; justify-content: space-between; gap: 16px; align-items: flex-start">
              <div>
                <div style="font-size: 24px; font-weight: 700; color: #111827">{{ currentInquiry.topic }}</div>
                <div style="margin-top: 8px; color: #6b7280">
                  {{ currentInquiry.buyer }} · {{ currentInquiry.company }} · {{ currentInquiry.destination }}
                </div>
              </div>
              <div style="display: flex; gap: 10px; align-items: center">
                <a-tag v-if="currentInquiry.latestQuoteVersion" color="blue">{{ currentInquiry.latestQuoteVersion }}</a-tag>
                <a-tag v-if="currentInquiry.convertedOrderId" color="green">{{ currentInquiry.convertedOrderId }}</a-tag>
                <span :class="statusClass(currentInquiry.status)">{{ statusText(currentInquiry.status) }}</span>
              </div>
            </div>
            <div style="margin-top: 18px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px">
              <div><strong>负责人：</strong>{{ currentInquiry.owner }}</div>
              <div><strong>邮箱：</strong>{{ currentInquiry.email }}</div>
              <div><strong>目标价格：</strong>{{ currentInquiry.targetPrice }}</div>
              <div><strong>样品需求：</strong>{{ currentInquiry.needSample ? '需要样品' : '暂不需要' }}</div>
            </div>
            <div
              v-if="typeof route.query.orderId === 'string' && route.query.orderId"
              style="
                margin-top: 14px;
                padding: 12px 14px;
                border-radius: 14px;
                background: #fff7ed;
                color: #9a3412;
              "
            >
              当前从订单 <strong>{{ route.query.orderId }}</strong> 回到该询盘，可继续查看报价与沟通历史。
            </div>
          </div>

          <a-row :gutter="[18, 18]">
            <a-col :span="10">
              <div class="content-panel" style="padding: 20px; margin-bottom: 18px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">对外沟通记录</div>
                <a-timeline>
                  <a-timeline-item
                    v-for="activity in currentInquiry.activities"
                    :key="activity.id"
                    :color="activity.role === 'seller' ? 'blue' : activity.role === 'buyer' ? 'green' : 'gray'"
                  >
                    <div style="font-weight: 700; color: #111827">
                      {{ activityRoleText(activity.role) }} · {{ activity.author }}
                    </div>
                    <div style="margin-top: 8px; color: #4b5563; line-height: 1.8">{{ activity.message }}</div>
                    <div style="margin-top: 8px; color: #94a3b8; font-size: 12px">{{ activity.createdAt }}</div>
                  </a-timeline-item>
                </a-timeline>
              </div>

              <div class="content-panel" style="padding: 20px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">外部跟进回复</div>
                <a-textarea
                  v-model:value="replyMessage"
                  :rows="4"
                  placeholder="填写要同步给买家的跟进内容，例如样品安排、交期确认、报价说明。"
                />
                <div style="margin-top: 14px; display: flex; justify-content: flex-end">
                  <a-button type="primary" :loading="actionLoading" @click="submitReply">追加跟进回复</a-button>
                </div>
              </div>
            </a-col>

            <a-col :span="7">
              <div class="content-panel" style="padding: 20px; margin-bottom: 18px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">报价历史</div>
                <a-timeline>
                  <a-timeline-item v-for="quote in currentInquiry.quotes" :key="quote.id" color="blue">
                    <div style="display: flex; justify-content: space-between; gap: 10px">
                      <strong style="color: #111827">{{ quote.version }}</strong>
                      <span style="color: #1d4ed8; font-weight: 700">{{ quote.totalAmount }}</span>
                    </div>
                    <div style="margin-top: 6px; color: #4b5563">{{ quote.leadTime }} · {{ quote.paymentTerms }}</div>
                    <div style="margin-top: 6px; color: #6b7280">{{ quote.note || '无备注' }}</div>
                    <div style="margin-top: 6px; color: #94a3b8; font-size: 12px">
                      {{ quote.author }} · 有效期至 {{ quote.validUntil }}
                    </div>
                  </a-timeline-item>
                </a-timeline>
                <div
                  v-if="!currentInquiry.quotes.length"
                  style="padding: 16px; border-radius: 16px; background: #f8fafc; color: #6b7280"
                >
                  还没有报价版本，可以在右侧直接生成第一版报价。
                </div>
              </div>

              <div class="content-panel" style="padding: 20px; margin-bottom: 18px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">成交转订单</div>
                <div
                  v-if="currentInquiry.convertedOrderId"
                  style="
                    margin-bottom: 14px;
                    padding: 14px 16px;
                    border-radius: 16px;
                    background: #ecfdf5;
                    color: #047857;
                    line-height: 1.8;
                  "
                >
                  当前询盘已经生成订单 <strong>{{ currentInquiry.convertedOrderId }}</strong>，可以直接跳转到订单详情继续履约。
                </div>
                <a-space direction="vertical" style="width: 100%">
                  <a-select
                    v-model:value="selectedQuoteId"
                    :disabled="Boolean(currentInquiry.convertedOrderId)"
                    placeholder="请选择报价版本"
                  >
                    <a-select-option v-for="quote in currentInquiry.quotes" :key="quote.id" :value="quote.id">
                      {{ quote.version }} · {{ quote.totalAmount }}
                    </a-select-option>
                  </a-select>
                  <a-input
                    v-model:value="convertForm.contactName"
                    :disabled="Boolean(currentInquiry.convertedOrderId)"
                    placeholder="收货联系人"
                  />
                  <a-input
                    v-model:value="convertForm.contactPhone"
                    :disabled="Boolean(currentInquiry.convertedOrderId)"
                    placeholder="联系电话"
                  />
                  <a-textarea
                    v-model:value="convertForm.shippingAddress"
                    :rows="3"
                    :disabled="Boolean(currentInquiry.convertedOrderId)"
                    placeholder="收货地址"
                  />
                  <a-input
                    v-model:value="convertForm.paymentMethod"
                    :disabled="Boolean(currentInquiry.convertedOrderId)"
                    placeholder="付款方式"
                  />
                  <a-textarea
                    v-model:value="convertForm.internalNote"
                    :rows="3"
                    :disabled="Boolean(currentInquiry.convertedOrderId)"
                    placeholder="转订单内部备注"
                  />
                  <a-button
                    v-if="!currentInquiry.convertedOrderId"
                    type="primary"
                    block
                    :loading="actionLoading"
                    :disabled="!currentInquiry.quotes.length"
                    @click="submitConvertToOrder"
                  >
                    确认成交并生成订单
                  </a-button>
                  <a-button v-else block @click="openConvertedOrder">查看已生成订单</a-button>
                </a-space>
              </div>

              <div class="content-panel" style="padding: 20px; margin-bottom: 18px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">询盘商品</div>
                <a-list :data-source="currentInquiry.items" item-layout="horizontal">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <a-list-item-meta>
                        <template #title>{{ item.productName }}</template>
                        <template #description>
                          数量 {{ item.quantity }} · MOQ {{ item.moq }} · 参考价 {{ item.priceHint }}
                        </template>
                      </a-list-item-meta>
                    </a-list-item>
                  </template>
                </a-list>
              </div>

              <div class="content-panel" style="padding: 20px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">内部备注</div>
                <a-list :data-source="currentInquiry.internalNotes" item-layout="vertical" style="margin-bottom: 14px">
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <div style="font-weight: 700; color: #111827">{{ item.author }}</div>
                      <div style="margin-top: 8px; color: #4b5563; line-height: 1.8">{{ item.message }}</div>
                      <div style="margin-top: 8px; color: #94a3b8; font-size: 12px">{{ item.createdAt }}</div>
                    </a-list-item>
                  </template>
                </a-list>
                <a-textarea
                  v-model:value="noteMessage"
                  :rows="3"
                  placeholder="填写只在卖家后台内部可见的备注，例如报价策略、客户风险、优先级判断。"
                />
                <div style="margin-top: 14px; display: flex; justify-content: flex-end">
                  <a-button :loading="actionLoading" @click="submitNote">保存内部备注</a-button>
                </div>
              </div>
            </a-col>

            <a-col :span="7">
              <div class="content-panel" style="padding: 20px; margin-bottom: 18px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">报价录入</div>
                <a-row :gutter="[12, 12]">
                  <a-col :span="10">
                    <a-select v-model:value="quoteForm.currency" style="width: 100%">
                      <a-select-option value="USD">USD</a-select-option>
                      <a-select-option value="CNY">CNY</a-select-option>
                    </a-select>
                  </a-col>
                  <a-col :span="14">
                    <a-input v-model:value="quoteForm.validUntil" placeholder="有效期，如 2026-04-30" />
                  </a-col>
                  <a-col :span="12">
                    <a-input-number v-model:value="quoteForm.shippingFee" :min="0" style="width: 100%" />
                  </a-col>
                  <a-col :span="12">
                    <a-input v-model:value="quoteForm.leadTime" placeholder="交期，如 15-20 天" />
                  </a-col>
                  <a-col :span="24">
                    <a-input v-model:value="quoteForm.paymentTerms" placeholder="付款条款" />
                  </a-col>
                </a-row>

                <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center">
                  <div class="page-header__eyebrow" style="margin: 0">报价商品行</div>
                  <a-button size="small" @click="addQuoteLine">新增行</a-button>
                </div>

                <a-space direction="vertical" style="width: 100%; margin-top: 12px">
                  <div
                    v-for="(item, index) in quoteForm.items"
                    :key="`${item.productName}-${index}`"
                    style="padding: 14px; border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0"
                  >
                    <a-space direction="vertical" style="width: 100%">
                      <a-input v-model:value="item.productName" placeholder="商品名称" />
                      <a-input v-model:value="item.sku" placeholder="SKU" />
                      <a-row :gutter="10">
                        <a-col :span="12">
                          <a-input-number v-model:value="item.quantity" :min="1" style="width: 100%" />
                        </a-col>
                        <a-col :span="12">
                          <a-input-number v-model:value="item.unitPrice" :min="0" :precision="2" style="width: 100%" />
                        </a-col>
                      </a-row>
                      <a-input v-model:value="item.note" placeholder="备注，如颜色/包装要求" />
                      <div style="display: flex; justify-content: flex-end">
                        <a-button danger size="small" @click="removeQuoteLine(index)">删除</a-button>
                      </div>
                    </a-space>
                  </div>
                </a-space>

                <a-textarea
                  v-model:value="quoteForm.note"
                  :rows="3"
                  style="margin-top: 14px"
                  placeholder="补充本次报价说明，如物流、样品费、包装条件等"
                />
                <div style="margin-top: 14px; display: flex; justify-content: flex-end">
                  <a-button type="primary" :loading="actionLoading" @click="submitQuote">生成报价版本</a-button>
                </div>
              </div>

              <div class="content-panel" style="padding: 20px; margin-bottom: 18px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">状态管理</div>
                <a-space direction="vertical" style="width: 100%">
                  <a-select v-model:value="selectedStatus" style="width: 100%">
                    <a-select-option value="new">待处理</a-select-option>
                    <a-select-option value="follow_up">跟进中</a-select-option>
                    <a-select-option value="quoted">已报价</a-select-option>
                    <a-select-option value="converted">已转订单</a-select-option>
                  </a-select>
                  <a-button type="primary" block :loading="actionLoading" @click="submitStatus">更新询盘状态</a-button>
                </a-space>
              </div>

              <div class="content-panel" style="padding: 20px">
                <div class="page-header__eyebrow" style="margin-bottom: 10px">负责人分配</div>
                <a-space direction="vertical" style="width: 100%">
                  <a-select v-model:value="selectedOwner" :options="ownerOptions" style="width: 100%" />
                  <a-button type="primary" block :loading="actionLoading" @click="submitOwner">保存负责人</a-button>
                </a-space>
              </div>
            </a-col>
          </a-row>
        </template>
      </a-spin>
    </a-drawer>
  </div>
</template>

<style scoped>
.inquiry-card {
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.inquiry-card--highlight {
  border: 1px solid rgba(249, 115, 22, 0.45);
  box-shadow: 0 16px 40px rgba(249, 115, 22, 0.14);
  transform: translateY(-2px);
}
</style>
