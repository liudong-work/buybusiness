import type { Order, OrderStatus } from '@/types';

export const ordersStorageKey = 'buybusiness.orders';
const ordersEventName = 'buybusiness:orders-updated';

function dispatchOrdersUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ordersEventName));
}

export function subscribeOrderUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === ordersStorageKey) {
      listener();
    }
  };

  window.addEventListener(ordersEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(ordersEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadStoredOrders(): Order[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(ordersStorageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
  dispatchOrdersUpdated();
}

export function prependStoredOrder(order: Order) {
  saveStoredOrders([order, ...loadStoredOrders()]);
}

export function getStoredOrderById(orderId: string) {
  return loadStoredOrders().find((order) => order.id === orderId);
}

export function getOrderStatusMeta(status: OrderStatus) {
  const meta: Record<OrderStatus, { label: string; className: string; description: string }> = {
    submitted: {
      label: '已提交',
      className: 'bg-orange-50 text-orange-700 border-orange-100',
      description: '订单刚刚提交，正在等待平台确认。',
    },
    processing: {
      label: '处理中',
      className: 'bg-blue-50 text-blue-700 border-blue-100',
      description: '顾问正在核对商品、库存与发货信息。',
    },
    ready_to_ship: {
      label: '待发货',
      className: 'bg-violet-50 text-violet-700 border-violet-100',
      description: '订单已经确认，正在准备发货。',
    },
    completed: {
      label: '已完成',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      description: '这笔订单已经完成交付或流程结束。',
    },
  };

  return meta[status];
}

export function getOrderTimeline(status: OrderStatus) {
  const steps: OrderStatus[] = ['submitted', 'processing', 'ready_to_ship', 'completed'];
  const activeIndex = steps.indexOf(status);

  return steps.map((step, index) => ({
    step,
    ...getOrderStatusMeta(step),
    isCompleted: activeIndex >= index,
    isCurrent: step === status,
  }));
}
