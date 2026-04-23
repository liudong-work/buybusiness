import type { RecentView, RecentViewType } from '@/types';

export const recentViewsStorageKey = 'buybusiness.recent-views';
const recentViewsEventName = 'buybusiness:recent-views-updated';
const maxRecentViews = 12;

function dispatchRecentViewsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(recentViewsEventName));
}

export function subscribeRecentViewUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === recentViewsStorageKey) {
      listener();
    }
  };

  window.addEventListener(recentViewsEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(recentViewsEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function loadStoredRecentViews(): RecentView[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(recentViewsStorageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentView[]) : [];
  } catch {
    return [];
  }
}

export function saveStoredRecentViews(items: RecentView[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(recentViewsStorageKey, JSON.stringify(items));
  dispatchRecentViewsUpdated();
}

export function trackRecentView(entityType: RecentViewType, entityId: string) {
  const currentItems = loadStoredRecentViews();
  const dedupedItems = currentItems.filter(
    (item) => !(item.entityType === entityType && item.entityId === entityId)
  );

  saveStoredRecentViews([
    {
      entityType,
      entityId,
      viewedAt: new Date().toISOString(),
    },
    ...dedupedItems,
  ].slice(0, maxRecentViews));
}
