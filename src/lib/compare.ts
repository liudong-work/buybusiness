import type { CompareState } from '@/types';

export const compareStorageKey = 'buybusiness.compare';
const compareEventName = 'buybusiness:compare-updated';

const emptyCompareState: CompareState = {
  productIds: [],
  brandIds: [],
};

function dispatchCompareUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(compareEventName));
}

export function subscribeCompareUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === compareStorageKey) {
      listener();
    }
  };

  window.addEventListener(compareEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(compareEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadStoredCompare(): CompareState {
  if (typeof window === 'undefined') return emptyCompareState;

  try {
    const raw = window.localStorage.getItem(compareStorageKey);
    if (!raw) return emptyCompareState;

    const parsed = JSON.parse(raw);
    return {
      productIds: Array.isArray(parsed?.productIds) ? parsed.productIds : [],
      brandIds: Array.isArray(parsed?.brandIds) ? parsed.brandIds : [],
    };
  } catch {
    return emptyCompareState;
  }
}

export function saveStoredCompare(state: CompareState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(compareStorageKey, JSON.stringify(state));
  dispatchCompareUpdated();
}

export function toggleProductCompare(productId: string) {
  const current = loadStoredCompare();
  const nextProductIds = current.productIds.includes(productId)
    ? current.productIds.filter((id) => id !== productId)
    : [...current.productIds, productId].slice(-4);

  saveStoredCompare({
    ...current,
    productIds: nextProductIds,
  });
}

export function toggleBrandCompare(brandId: string) {
  const current = loadStoredCompare();
  const nextBrandIds = current.brandIds.includes(brandId)
    ? current.brandIds.filter((id) => id !== brandId)
    : [...current.brandIds, brandId].slice(-4);

  saveStoredCompare({
    ...current,
    brandIds: nextBrandIds,
  });
}

export function isProductCompared(productId: string) {
  return loadStoredCompare().productIds.includes(productId);
}

export function isBrandCompared(brandId: string) {
  return loadStoredCompare().brandIds.includes(brandId);
}
