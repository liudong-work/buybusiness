import type { FavoriteState } from '@/types';

export const favoritesStorageKey = 'buybusiness.favorites';
const favoritesEventName = 'buybusiness:favorites-updated';

const emptyFavoriteState: FavoriteState = {
  productIds: [],
  brandIds: [],
};

function dispatchFavoritesUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(favoritesEventName));
}

export function subscribeFavoriteUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === favoritesStorageKey) {
      listener();
    }
  };

  window.addEventListener(favoritesEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(favoritesEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadStoredFavorites(): FavoriteState {
  if (typeof window === 'undefined') return emptyFavoriteState;

  try {
    const raw = window.localStorage.getItem(favoritesStorageKey);
    if (!raw) return emptyFavoriteState;

    const parsed = JSON.parse(raw);
    return {
      productIds: Array.isArray(parsed?.productIds) ? parsed.productIds : [],
      brandIds: Array.isArray(parsed?.brandIds) ? parsed.brandIds : [],
    };
  } catch {
    return emptyFavoriteState;
  }
}

export function saveStoredFavorites(state: FavoriteState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(favoritesStorageKey, JSON.stringify(state));
  dispatchFavoritesUpdated();
}

export function toggleProductFavorite(productId: string) {
  const current = loadStoredFavorites();
  const nextProductIds = current.productIds.includes(productId)
    ? current.productIds.filter((id) => id !== productId)
    : [...current.productIds, productId];

  saveStoredFavorites({
    ...current,
    productIds: nextProductIds,
  });
}

export function toggleBrandFavorite(brandId: string) {
  const current = loadStoredFavorites();
  const nextBrandIds = current.brandIds.includes(brandId)
    ? current.brandIds.filter((id) => id !== brandId)
    : [...current.brandIds, brandId];

  saveStoredFavorites({
    ...current,
    brandIds: nextBrandIds,
  });
}

export function isProductFavorite(productId: string) {
  return loadStoredFavorites().productIds.includes(productId);
}

export function isBrandFavorite(brandId: string) {
  return loadStoredFavorites().brandIds.includes(brandId);
}
