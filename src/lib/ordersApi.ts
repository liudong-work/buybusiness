import type { Order } from '@/types';
import { apiClient } from './apiClient';
import { prependStoredOrder, loadStoredOrders } from './orders';

const orderEventName = 'buybusiness:orders-updated';

function dispatchOrdersUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(orderEventName));
}

export function subscribeOrderUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  window.addEventListener(orderEventName, listener);

  return () => {
    window.removeEventListener(orderEventName, listener);
  };
}

async function migrateOrdersToServer() {
  const localOrders = loadStoredOrders();
  if (localOrders.length === 0) return;

  try {
    for (const order of localOrders) {
      await apiClient.orders.create(order);
    }
    localStorage.removeItem('buybusiness.orders');
    console.log('Orders migrated to server successfully');
  } catch (error) {
    console.error('Failed to migrate orders:', error);
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (!token) {
      await migrateOrdersToServer();
      return [];
    }

    const orders = await apiClient.orders.getAll();
    return orders;
  } catch (error) {
    console.error('Failed to fetch orders from server, falling back to local storage:', error);
    return loadStoredOrders();
  }
}

export async function getOrderById(orderId: string): Promise<Order | undefined> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (!token) {
      const localOrders = loadStoredOrders();
      return localOrders.find((order: Order) => order.id === orderId);
    }

    return await apiClient.orders.getById(orderId);
  } catch (error) {
    console.error('Failed to fetch order from server:', error);
    return loadStoredOrders().find((order: Order) => order.id === orderId);
  }
}

export async function createOrder(order: Partial<Order>): Promise<Order> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      const newOrder = await apiClient.orders.create(order);
      dispatchOrdersUpdated();
      return newOrder;
    } else {
      prependStoredOrder(order as Order);
      dispatchOrdersUpdated();
      return order as Order;
    }
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.orders.updateStatus(orderId, status);
      dispatchOrdersUpdated();
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
}

export async function updateOrderShipping(orderId: string, shippingInfo: any): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.orders.updateShipping(orderId, shippingInfo);
      dispatchOrdersUpdated();
    }
  } catch (error) {
    console.error('Failed to update order shipping:', error);
    throw error;
  }
}