<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function goBack() {
  router.push(authStore.getFirstAllowedPath());
}
</script>

<template>
  <div
    style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    "
  >
    <div class="content-panel" style="padding: 40px; width: 100%; max-width: 560px; text-align: center">
      <div class="page-header__eyebrow">无权限</div>
      <h1 style="margin: 0; font-size: 32px; color: #111827">当前账号没有访问这个页面的权限</h1>
      <p style="margin: 16px 0 0; line-height: 1.8; color: #6b7280">
        请返回你有权限访问的页面，或者使用更高权限账号重新登录。
      </p>
      <a-space style="margin-top: 24px">
        <a-button @click="goBack">回到可访问页面</a-button>
        <a-button type="primary" @click="authStore.logout(); router.push('/login')">切换账号</a-button>
      </a-space>
    </div>
  </div>
</template>
