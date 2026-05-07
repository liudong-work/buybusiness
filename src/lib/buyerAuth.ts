import type { BuyerUser } from '@/types';

export interface BuyerSession {
  accessToken: string;
  user: BuyerUser;
}

const buyerSessionStorageKey = 'buybusiness.buyer-session';
const buyerAuthEventName = 'buybusiness:buyer-auth-updated';

function dispatchBuyerAuthUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(buyerAuthEventName));
}

export function getStoredBuyerSession(): BuyerSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(buyerSessionStorageKey);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as BuyerSession;
    if (!session.accessToken?.startsWith('buyer-session-')) {
      window.localStorage.removeItem(buyerSessionStorageKey);
      return null;
    }
    return session;
  } catch {
    window.localStorage.removeItem(buyerSessionStorageKey);
    return null;
  }
}

export function getStoredBuyerAccessToken() {
  return getStoredBuyerSession()?.accessToken ?? '';
}

export function getStoredBuyerUser() {
  return getStoredBuyerSession()?.user ?? null;
}

export function isBuyerAuthenticated() {
  return Boolean(getStoredBuyerSession());
}

export function setStoredBuyerSession(session: BuyerSession) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(buyerSessionStorageKey, JSON.stringify(session));
  dispatchBuyerAuthUpdated();
}

export function clearStoredBuyerSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(buyerSessionStorageKey);
  dispatchBuyerAuthUpdated();
}

export function subscribeBuyerAuthUpdates(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === buyerSessionStorageKey) {
      listener();
    }
  };

  window.addEventListener(buyerAuthEventName, listener);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(buyerAuthEventName, listener);
    window.removeEventListener('storage', onStorage);
  };
}
