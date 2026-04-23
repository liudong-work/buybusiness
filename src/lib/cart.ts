import type { CartDisplayItem, StoredCartItem } from '@/types';
import { getBrandById, getProductById } from '@/lib/mockData';

export const cartStorageKey = 'buybusiness.cart';
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

export function loadStoredCart(): StoredCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(cartStorageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredCartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(items: StoredCartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  dispatchCartUpdated();
}

export function addProductToCart(productId: string, quantity: number) {
  const currentItems = loadStoredCart();
  const product = getProductById(productId);

  if (!product) return currentItems;

  const nextItems = [...currentItems];
  const existingItem = nextItems.find((item) => item.productId === productId);
  const nextQuantity = Math.max(product.minOrderQuantity, quantity);

  if (existingItem) {
    existingItem.quantity = Math.max(product.minOrderQuantity, existingItem.quantity + nextQuantity);
  } else {
    nextItems.push({ productId, quantity: nextQuantity });
  }

  saveStoredCart(nextItems);
  return nextItems;
}

export function updateStoredCartQuantity(productId: string, quantity: number) {
  const product = getProductById(productId);
  if (!product) return;

  const currentItems = loadStoredCart();
  const nextItems = currentItems.map((item) =>
    item.productId === productId
      ? { ...item, quantity: Math.max(product.minOrderQuantity, quantity) }
      : item
  );

  saveStoredCart(nextItems);
}

export function removeStoredCartItem(productId: string) {
  const currentItems = loadStoredCart();
  saveStoredCart(currentItems.filter((item) => item.productId !== productId));
}

export function clearStoredCart() {
  saveStoredCart([]);
}

export function getCartDisplayItems(): CartDisplayItem[] {
  return loadStoredCart()
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;

      const brand = getBrandById(product.brandId);
      if (!brand) return null;

      return {
        productId: item.productId,
        quantity: Math.max(product.minOrderQuantity, item.quantity),
        product,
        brand,
      };
    })
    .filter((item): item is CartDisplayItem => item !== null);
}

export function getCartItemCount() {
  return loadStoredCart().reduce((sum, item) => sum + item.quantity, 0);
}
