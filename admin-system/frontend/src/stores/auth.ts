import { defineStore } from 'pinia';
import { apiClient } from '../api/client';

export type PermissionCode =
  | 'dashboard.view'
  | 'products.manage'
  | 'orders.manage'
  | 'inquiries.manage'
  | 'settings.manage'
  | 'accounts.manage';

export interface AuthUser {
  username: string;
  displayName: string;
  role: 'seller_admin' | 'ops_manager' | 'sales_manager' | 'viewer';
  permissions: PermissionCode[];
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

const tokenStorageKey = 'seller-admin.access-token';
const userStorageKey = 'seller-admin.user';

export function getStoredAccessToken() {
  if (typeof window === 'undefined') return '';
  const token = window.localStorage.getItem(tokenStorageKey) ?? '';
  if (token.startsWith('mock-token-')) {
    const normalizedToken = token.replace('mock-token-', 'seller-admin-token-');
    window.localStorage.setItem(tokenStorageKey, normalizedToken);
    return normalizedToken;
  }
  return token;
}

function setStoredSession(accessToken: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(tokenStorageKey, accessToken);
  window.localStorage.setItem(userStorageKey, JSON.stringify(user));
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(tokenStorageKey);
  window.localStorage.removeItem(userStorageKey);
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(userStorageKey);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as AuthUser;
    if (user.username === 'admin' && user.displayName !== '李华') {
      const normalizedUser = { ...user, displayName: '李华' } satisfies AuthUser;
      window.localStorage.setItem(userStorageKey, JSON.stringify(normalizedUser));
      return normalizedUser;
    }
    return user;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('seller-admin-auth', {
  state: () => ({
    accessToken: '',
    user: null as AuthUser | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken && state.user),
  },
  actions: {
    hydrate() {
      this.accessToken = getStoredAccessToken();
      this.user = getStoredUser();
    },
    async login(payload: { username: string; password: string; deviceName?: string }) {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
      this.accessToken = data.accessToken;
      this.user = data.user;
      setStoredSession(data.accessToken, data.user);
      return data.user;
    },
    logout() {
      this.accessToken = '';
      this.user = null;
      clearStoredSession();
    },
    hasPermission(permission?: PermissionCode) {
      if (!permission) return true;
      return Boolean(this.user?.permissions.includes(permission));
    },
    getFirstAllowedPath() {
      if (this.hasPermission('dashboard.view')) return '/';
      if (this.hasPermission('products.manage')) return '/products';
      if (this.hasPermission('orders.manage')) return '/orders';
      if (this.hasPermission('inquiries.manage')) return '/inquiries';
      if (this.hasPermission('accounts.manage')) return '/accounts';
      if (this.hasPermission('settings.manage')) return '/settings';
      return '/403';
    },
  },
});
