import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import ProductsView from '../views/ProductsView.vue';
import OrdersView from '../views/OrdersView.vue';
import InquiriesView from '../views/InquiriesView.vue';
import SettingsView from '../views/SettingsView.vue';
import LoginView from '../views/LoginView.vue';
import ForbiddenView from '../views/ForbiddenView.vue';
import ProfileView from '../views/ProfileView.vue';
import AccountsView from '../views/AccountsView.vue';
import { pinia } from '../pinia';
import { useAuthStore, type PermissionCode } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: ForbiddenView,
    meta: { public: true },
  },
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardView,
        meta: { permission: 'dashboard.view' satisfies PermissionCode },
      },
      {
        path: 'products',
        name: 'products',
        component: ProductsView,
        meta: { permission: 'products.manage' satisfies PermissionCode },
      },
      {
        path: 'orders',
        name: 'orders',
        component: OrdersView,
        meta: { permission: 'orders.manage' satisfies PermissionCode },
      },
      {
        path: 'inquiries',
        name: 'inquiries',
        component: InquiriesView,
        meta: { permission: 'inquiries.manage' satisfies PermissionCode },
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsView,
        meta: { permission: 'settings.manage' satisfies PermissionCode },
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: AccountsView,
        meta: { permission: 'accounts.manage' satisfies PermissionCode },
      },
      {
        path: 'profile',
        name: 'profile',
        component: ProfileView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia);
  authStore.hydrate();

  if (to.meta.public) {
    if (to.name === 'login' && authStore.isAuthenticated) {
      return authStore.getFirstAllowedPath();
    }
    return true;
  }

  if (!authStore.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    };
  }

  const permission = to.meta.permission as PermissionCode | undefined;
  if (permission && !authStore.hasPermission(permission)) {
    return '/403';
  }

  return true;
});

export default router;
