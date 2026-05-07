import type { CartDisplayItem, StoredCartItem } from '@/types';
import { apiClient } from './apiClient';
import { loadStoredCart, saveStoredCart, cartStorageKey } from './cart';

const cartEventName = 'buybusiness:cart-updated';

function dispatchCartUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(cartEventName));
}

export function subscribeCartUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === cartStorageKey) {
      listener();
    }
  };

  window.addEventListener(cartEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(cartEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}

async function migrateCartToServer() {
  const localCart = loadStoredCart();
  if (localCart.length === 0) return;

  try {
    for (const item of localCart) {
      await apiClient.cart.addItem({
        productId: item.productId,
        quantity: item.quantity,
      });
    }
    saveStoredCart([]);
    console.log('Cart migrated to server successfully');
  } catch (error) {
    console.error('Failed to migrate cart:', error);
  }
}

export async function getCartItems(): Promise<CartDisplayItem[]> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (!token) {
      const localCart = loadStoredCart();
      await migrateCartToServer();
      return [];
    }

    const items = await apiClient.cart.get();
    return items as CartDisplayItem[];
  } catch (error) {
    console.error('Failed to fetch cart from server, falling back to local storage:', error);
    const localCart = loadStoredCart();
    return localCart as CartDisplayItem[];
  }
}

export async function addProductToCart(productId: string, quantity: number): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.cart.addItem({
        productId,
        quantity,
      });
    } else {
      const { addProductToCart: addLocal } = await import('./cart');
      addLocal(productId, quantity);
    }
    dispatchCartUpdated();
  } catch (error) {
    console.error('Failed to add product to cart:', error);
    throw error;
  }
}

export async function updateCartQuantity(productId: string, quantity: number): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.cart.updateItem(productId, quantity);
    } else {
      const { updateStoredCartQuantity: updateLocal } = await import('./cart');
      updateLocal(productId, quantity);
    }
    dispatchCartUpdated();
  } catch (error) {
    console.error('Failed to update cart quantity:', error);
    throw error;
  }
}

export async function removeCartItem(productId: string): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.cart.removeItem(productId);
    } else {
      const { removeStoredCartItem: removeLocal } = await import('./cart');
      removeLocal(productId);
    }
    dispatchCartUpdated();
  } catch (error) {
    console.error('Failed to remove cart item:', error);
    throw error;
  }
}

export async function clearCart(): Promise<void> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      await apiClient.cart.clear();
    } else {
      const { clearStoredCart: clearLocal } = await import('./cart');
      clearLocal();
    }
    dispatchCartUpdated();
  } catch (error) {
    console.error('Failed to clear cart:', error);
    throw error;
  }
}

export async function getCartItemCount(): Promise<number> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      const items = await apiClient.cart.get();
      return items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    } else {
      const { getCartItemCount: getLocalCount } = await import('./cart');
      return getLocalCount();
    }
  } catch (error) {
    console.error('Failed to get cart item count:', error);
    return 0;
  }
}

export async function getCartDisplayItems(): Promise<CartDisplayItem[]> {
  try {
    const token = localStorage.getItem('buyer_token');
    if (token) {
      return await getCartItems();
    } else {
      const { getCartDisplayItems: getLocalDisplayItems } = await import('./cart');
      return getLocalDisplayItems();
    }
  } catch (error) {
    console.error('Failed to get cart display items:', error);
    return [];
  }
}