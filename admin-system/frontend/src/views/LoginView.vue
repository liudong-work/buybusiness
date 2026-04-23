<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(false);

const formState = reactive({
  username: 'admin',
  password: 'admin123',
});

function detectDeviceName() {
  if (typeof navigator === 'undefined') return '浏览器设备';
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone Safari';
  if (/iPad/i.test(ua)) return 'iPad Safari';
  if (/Macintosh/i.test(ua)) return 'Mac Chrome';
  if (/Windows/i.test(ua) && /Edg/i.test(ua)) return 'Windows Edge';
  if (/Windows/i.test(ua)) return 'Windows Chrome';
  if (/Android/i.test(ua)) return 'Android 浏览器';
  return '浏览器设备';
}

async function submitLogin() {
  if (!formState.username.trim() || !formState.password.trim()) {
    message.warning('请输入账号和密码');
    return;
  }

  loading.value = true;
  try {
    await authStore.login({
      ...formState,
      deviceName: detectDeviceName(),
    });
    message.success('登录成功');
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : authStore.getFirstAllowedPath();
    router.push(redirect);
  } catch (error: any) {
    message.error(error?.response?.data?.detail || '登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
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
      background:
        radial-gradient(circle at top left, rgba(249, 115, 22, 0.22), transparent 30%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    "
  >
    <div
      style="
        width: 100%;
        max-width: 980px;
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 24px;
        align-items: stretch;
      "
    >
      <div
        class="content-panel"
        style="
          padding: 36px;
          background: linear-gradient(135deg, #111827, #1f2937 64%, #9a3412);
          color: white;
        "
      >
        <div class="page-header__eyebrow" style="color: rgba(253, 230, 138, 0.92)">卖家后台登录</div>
        <h1 style="margin: 0; font-size: 38px; line-height: 1.15">先登录，再进入卖家运营工作台</h1>
        <p style="margin: 18px 0 0; line-height: 1.9; color: rgba(255,255,255,0.8)">
          后台面向中国卖家使用，支持商品、订单、询盘、店铺配置等业务操作。账号权限会决定可访问的菜单和页面。
        </p>

        <div style="margin-top: 26px; display: grid; gap: 16px">
          <div style="padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.08)">
            <div style="font-weight: 700">管理员账号</div>
            <div style="margin-top: 8px; color: rgba(255,255,255,0.76)">账号：`admin` 密码：`admin123`</div>
            <div style="margin-top: 6px; color: rgba(255,255,255,0.62)">拥有商品、订单、询盘、设置等全部权限</div>
          </div>
          <div style="padding: 18px; border-radius: 18px; background: rgba(255,255,255,0.08)">
            <div style="font-weight: 700">运营账号</div>
            <div style="margin-top: 8px; color: rgba(255,255,255,0.76)">账号：`ops` 密码：`ops123`</div>
            <div style="margin-top: 6px; color: rgba(255,255,255,0.62)">可访问工作台、订单管理、询盘管理，无商品和设置权限</div>
          </div>
        </div>
      </div>

      <div class="content-panel" style="padding: 36px">
        <div class="page-header__eyebrow">账号验证</div>
        <h2 style="margin: 0; font-size: 28px; color: #111827">登录卖家后台</h2>
        <p style="margin: 12px 0 0; line-height: 1.8; color: #6b7280">
          使用系统分配的后台账号登录，进入对应权限范围内的管理页面。系统会记录最近登录时间和设备，方便管理员审计。
        </p>

        <a-form layout="vertical" style="margin-top: 24px">
          <a-form-item label="账号" name="username">
            <a-input v-model:value="formState.username" placeholder="请输入账号" @pressEnter="submitLogin" />
          </a-form-item>
          <a-form-item label="密码" name="password">
            <a-input-password v-model:value="formState.password" placeholder="请输入密码" @pressEnter="submitLogin" />
          </a-form-item>
          <a-button type="primary" size="large" block :loading="loading" @click="submitLogin">登录并进入后台</a-button>
        </a-form>
      </div>
    </div>
  </div>
</template>
