import type {
  Inquiry,
  InquiryActivity,
  InquiryLineItem,
  InquirySource,
  InquiryStatus,
  Product,
  Brand,
} from '@/types';

export const inquiryStorageKey = 'buybusiness.inquiries';
const inquiryEventName = 'buybusiness:inquiries-updated';

function dispatchInquiryUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(inquiryEventName));
}

function createInquiryActivityId() {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return `ACT-${window.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  return `ACT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

function createInquiryActivity(activity: Omit<InquiryActivity, 'id'>): InquiryActivity {
  return {
    id: createInquiryActivityId(),
    ...activity,
  };
}

function normalizeInquiry(rawInquiry: Inquiry): Inquiry {
  const createdAt = rawInquiry.createdAt ?? new Date().toISOString();
  const updatedAt = rawInquiry.updatedAt ?? rawInquiry.lastFollowUpAt ?? createdAt;

  const activities =
    Array.isArray(rawInquiry.activities) && rawInquiry.activities.length > 0
      ? rawInquiry.activities
      : [
          createInquiryActivity({
            createdAt,
            type: 'created',
            author: 'buyer',
            title: '已提交询盘',
            message: rawInquiry.message?.trim() || '买家已提交询盘，等待进一步跟进。',
            status: 'submitted',
          }),
        ];

  const normalizedActivities = [...activities].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  return {
    ...rawInquiry,
    createdAt,
    updatedAt,
    activities: normalizedActivities,
  };
}

export function subscribeInquiryUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === inquiryStorageKey) {
      listener();
    }
  };

  window.addEventListener(inquiryEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(inquiryEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadStoredInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(inquiryStorageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Inquiry[]).map(normalizeInquiry) : [];
  } catch {
    return [];
  }
}

export function saveStoredInquiries(inquiries: Inquiry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(inquiryStorageKey, JSON.stringify(inquiries));
  dispatchInquiryUpdated();
}

export function prependStoredInquiry(inquiry: Inquiry) {
  const inquiries = loadStoredInquiries();
  saveStoredInquiries([normalizeInquiry(inquiry), ...inquiries]);
}

export function getStoredInquiryById(inquiryId: string) {
  return loadStoredInquiries().find((inquiry) => inquiry.id === inquiryId);
}

export function createInquiryId() {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return window.crypto.randomUUID().slice(0, 8).toUpperCase();
  }

  return `INQ-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export function serializeInquiryItemsParam(items: Array<{ id: string; quantity: number }>) {
  return items.map((item) => `${item.id}:${item.quantity}`).join(',');
}

export function parseInquiryItemsParam(
  value: string | null | undefined
): Array<{ id: string; quantity: number }> {
  if (!value) return [];

  return value
    .split(',')
    .map((entry) => {
      const [id, quantityValue] = entry.split(':');
      const quantity = Number(quantityValue);

      if (!id || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }

      return { id, quantity };
    })
    .filter((item): item is { id: string; quantity: number } => item !== null);
}

export function buildInquiryLineItem(product: Product, brand: Brand, quantity: number): InquiryLineItem {
  return {
    productId: product.id,
    productName: product.name,
    brandId: brand.id,
    brandName: brand.name,
    quantity,
    minOrderQuantity: product.minOrderQuantity,
    unitPrice: product.price,
  };
}

export function getInquirySourceLabel(source: InquirySource) {
  const labels: Record<InquirySource, string> = {
    product: '商品页询盘',
    brand: '品牌页询盘',
    cart: '购物车询盘',
    general: '通用询盘',
  };

  return labels[source];
}

export function getInquiryStatusMeta(status: InquiryStatus) {
  const meta: Record<
    InquiryStatus,
    { label: string; className: string; description: string }
  > = {
    submitted: {
      label: '已提交',
      className: 'bg-orange-50 text-orange-700 border-orange-100',
      description: '平台已收到询盘，等待人工确认需求。',
    },
    reviewing: {
      label: '处理中',
      className: 'bg-blue-50 text-blue-700 border-blue-100',
      description: '顾问正在核对商品、MOQ 与供应商匹配情况。',
    },
    quoted: {
      label: '已报价',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      description: '询盘已进入报价阶段，可继续推进样品或订单。',
    },
    closed: {
      label: '已关闭',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
      description: '该询盘已完成或暂时结束跟进。',
    },
  };

  return meta[status];
}

export function getInquiryTimeline(status: InquiryStatus) {
  const steps: InquiryStatus[] = ['submitted', 'reviewing', 'quoted', 'closed'];
  const activeIndex = steps.indexOf(status);

  return steps.map((step, index) => ({
    step,
    ...getInquiryStatusMeta(step),
    isCompleted: activeIndex >= index,
    isCurrent: step === status,
  }));
}

export function updateStoredInquiry(
  inquiryId: string,
  updater: (inquiry: Inquiry) => Inquiry
) {
  const inquiries = loadStoredInquiries();
  const nextInquiries = inquiries.map((inquiry) =>
    inquiry.id === inquiryId ? normalizeInquiry(updater(inquiry)) : inquiry
  );

  saveStoredInquiries(nextInquiries);
}

export function appendInquiryFollowUp(inquiryId: string, message: string) {
  const trimmedMessage = message.trim();
  if (!trimmedMessage) return;

  updateStoredInquiry(inquiryId, (inquiry) => {
    const followUpAt = new Date().toISOString();
    const nextActivities = [
      ...inquiry.activities,
      createInquiryActivity({
        createdAt: followUpAt,
        type: 'buyer_follow_up',
        author: 'buyer',
        title: '买家补充留言',
        message: trimmedMessage,
      }),
    ];

    let nextStatus = inquiry.status;

    if (inquiry.status === 'submitted') {
      nextStatus = 'reviewing';
      nextActivities.push(
        createInquiryActivity({
          createdAt: followUpAt,
          type: 'status_change',
          author: 'system',
          title: '询盘进入处理中',
          message: getInquiryStatusMeta('reviewing').description,
          status: 'reviewing',
        })
      );
    }

    nextActivities.push(
      createInquiryActivity({
        createdAt: new Date(Date.now() + 60 * 1000).toISOString(),
        type: 'advisor_update',
        author: 'advisor',
        title: '顾问已收到补充说明',
        message: '我们已经收到最新补充内容，会继续核对商品、MOQ、样品和报价信息后再同步你。',
        status: nextStatus,
      })
    );

    return {
      ...inquiry,
      status: nextStatus,
      updatedAt: followUpAt,
      lastFollowUpAt: followUpAt,
      activities: nextActivities,
    };
  });
}
