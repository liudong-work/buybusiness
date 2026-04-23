<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  AppstoreOutlined,
  BarsOutlined,
  DownOutlined,
  LogoutOutlined,
  MessageOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons-vue';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const selectedKeys = computed(() => [route.name?.toString() ?? 'dashboard']);

const items = [
  { key: 'dashboard', icon: AppstoreOutlined, label: '工作台', path: '/', permission: 'dashboard.view' },
  { key: 'products', icon: ShopOutlined, label: '商品管理', path: '/products', permission: 'products.manage' },
  { key: 'orders', icon: BarsOutlined, label: '订单管理', path: '/orders', permission: 'orders.manage' },
  { key: 'inquiries', icon: MessageOutlined, label: '询盘管理', path: '/inquiries', permission: 'inquiries.manage' },
  { key: 'accounts', icon: TeamOutlined, label: '账号权限', path: '/accounts', permission: 'accounts.manage' },
  { key: 'settings', icon: SettingOutlined, label: '店铺设置', path: '/settings', permission: 'settings.manage' },
];

const visibleItems = computed(() => items.filter((item) => authStore.hasPermission(item.permission as never)));

function handleMenuClick(payload: { key: string }) {
  const match = visibleItems.value.find((item) => item.key === payload.key);
  if (match) {
    router.push(match.path);
  }
}

function logout() {
  authStore.logout();
  router.push('/login');
}

function handleUserMenuClick(payload: { key: string }) {
  if (payload.key === 'profile') {
    router.push('/profile');
    return;
  }

  if (payload.key === 'logout') {
    logout();
  }
}
</script>

<template>
  <a-layout style="min-height: 100vh; background: transparent">
    <a-layout-sider
      width="260"
      theme="light"
      :style="{
        padding: '22px 18px',
        background: 'rgba(255,255,255,0.88)',
        borderRight: '1px solid rgba(226,232,240,0.95)',
      }"
    >
      <div
        style="
          padding: 20px 18px;
          border-radius: 22px;
          background: linear-gradient(135deg, #111827, #374151);
          color: white;
          margin-bottom: 18px;
        "
      >
        <div style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.65)">
          卖家后台
        </div>
        <div style="margin-top: 10px; font-size: 24px; font-weight: 700">北辰供应链</div>
        <div style="margin-top: 10px; color: rgba(255,255,255,0.72); line-height: 1.7">
          用一个后台统一管理商品、订单、询盘跟进和店铺运营配置。
        </div>
      </div>

      <a-menu
        mode="inline"
        :selected-keys="selectedKeys"
        @click="handleMenuClick"
        style="border: none; background: transparent"
      >
        <a-menu-item v-for="item in visibleItems" :key="item.key">
          <component :is="item.icon" />
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout style="background: transparent">
      <a-layout-header
        :style="{
          background: 'transparent',
          padding: '24px 28px 0',
          height: 'auto',
          lineHeight: 'normal',
        }"
      >
        <div
          class="content-panel"
          style="
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
          <div>
            <div style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #9a3412">
              卖家运营中心
            </div>
            <div style="margin-top: 8px; font-size: 28px; font-weight: 700; color: #111827">
              批发平台招商卖家后台
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 16px">
            <a-badge status="processing" text="本地接口服务已连接" />
            <a-dropdown placement="bottomRight">
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 8px 12px;
                  border-radius: 999px;
                  cursor: pointer;
                  transition: background 0.2s ease;
                "
              >
                <div style="text-align: right">
                  <div style="font-weight: 700; color: #111827">{{ authStore.user?.displayName ?? '未登录' }}</div>
                  <div style="margin-top: 4px; color: #6b7280; font-size: 12px">
                    {{
                      authStore.user?.role === 'seller_admin'
                        ? '管理员'
                        : authStore.user?.role === 'sales_manager'
                          ? '销售账号'
                          : authStore.user?.role === 'viewer'
                            ? '查看账号'
                            : '运营账号'
                    }}
                  </div>
                </div>
                <a-avatar style="background: #111827">
                  {{ authStore.user?.displayName?.slice(0, 1) ?? '未' }}
                </a-avatar>
                <DownOutlined style="color: #94a3b8" />
              </div>

              <template #overlay>
                <a-menu @click="handleUserMenuClick">
                  <a-menu-item key="profile">
                    <UserOutlined />
                    <span>个人中心</span>
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="logout">
                    <LogoutOutlined />
                    <span>退出登录</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
        </div>
      </a-layout-header>

      <a-layout-content style="padding: 24px 28px 28px">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
