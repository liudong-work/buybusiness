<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth';
import { useAppStore } from '../stores/app';

const authStore = useAuthStore();
const appStore = useAppStore();
const { members, operationLogs, loginLogs } = storeToRefs(appStore);
const saving = ref(false);

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const permissionLabels = computed(() => {
  const mapping: Record<string, string> = {
    'dashboard.view': '工作台查看',
    'products.manage': '商品管理',
    'orders.manage': '订单管理',
    'inquiries.manage': '询盘管理',
    'settings.manage': '店铺设置',
    'accounts.manage': '账号权限',
  };

  return (authStore.user?.permissions ?? []).map((permission) => mapping[permission] ?? permission);
});

const roleLabel = computed(() => {
  if (authStore.user?.role === 'seller_admin') return '管理员账号';
  if (authStore.user?.role === 'sales_manager') return '销售账号';
  if (authStore.user?.role === 'viewer') return '查看账号';
  return '运营账号';
});

const myLogs = computed(() =>
  operationLogs.value.filter((item) => item.actor === authStore.user?.displayName).slice(0, 8)
);

const currentMember = computed(() => members.value.find((item) => item.username === authStore.user?.username) ?? null);

const myLoginLogs = computed(() => loginLogs.value.slice(0, 6));

onMounted(() => {
  appStore.loadMembers();
  appStore.loadOperationLogs();
  if (authStore.user?.username) {
    appStore.loadLoginLogs(authStore.user.username);
  }
});

async function submitPasswordChange() {
  if (!authStore.user) return;
  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    message.warning('请完整填写密码信息');
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.warning('两次输入的新密码不一致');
    return;
  }

  saving.value = true;
  try {
    await appStore.changePassword({
      username: authStore.user.username,
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    await appStore.loadOperationLogs();
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    message.success('密码已修改');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header__meta">
        <p class="page-header__eyebrow">个人中心</p>
        <h1>查看当前登录账号、权限和个人操作记录</h1>
        <p>
          这里除了展示当前账号信息，也补上了密码修改和个人操作轨迹，让账号体系更接近正式后台的使用方式。
        </p>
      </div>
    </div>

    <a-row :gutter="[18, 18]">
      <a-col :xs="24" :xl="10">
        <div class="content-panel" style="padding: 24px">
          <div style="display: flex; align-items: center; gap: 16px">
            <a-avatar :size="72" style="background: #111827; font-size: 28px">
              {{ authStore.user?.displayName?.slice(0, 1) ?? '未' }}
            </a-avatar>
            <div>
              <div style="font-size: 28px; font-weight: 700; color: #111827">
                {{ authStore.user?.displayName ?? '未登录' }}
              </div>
              <div style="margin-top: 8px; color: #6b7280">
                {{ roleLabel }}
              </div>
            </div>
          </div>

          <a-descriptions :column="1" style="margin-top: 24px">
            <a-descriptions-item label="登录账号">{{ authStore.user?.username ?? '--' }}</a-descriptions-item>
            <a-descriptions-item label="角色">{{ authStore.user?.role ?? '--' }}</a-descriptions-item>
            <a-descriptions-item label="当前状态">已登录</a-descriptions-item>
            <a-descriptions-item label="最近登录时间">{{ currentMember?.lastLogin ?? '--' }}</a-descriptions-item>
            <a-descriptions-item label="最近登录设备">{{ currentMember?.lastLoginDevice || '--' }}</a-descriptions-item>
          </a-descriptions>

          <div
            style="
              margin-top: 22px;
              padding: 18px;
              border-radius: 18px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
            "
          >
            <div class="page-header__eyebrow" style="margin-bottom: 10px">密码修改</div>
            <a-form layout="vertical">
              <a-form-item label="当前密码">
                <a-input-password v-model:value="passwordForm.currentPassword" placeholder="请输入当前密码" />
              </a-form-item>
              <a-form-item label="新密码">
                <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
              </a-form-item>
              <a-form-item label="确认新密码">
                <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
              </a-form-item>
              <a-button type="primary" :loading="saving" @click="submitPasswordChange">保存新密码</a-button>
            </a-form>
          </div>
        </div>
      </a-col>

      <a-col :xs="24" :xl="14">
        <div class="content-panel" style="padding: 24px; margin-bottom: 18px">
          <div class="page-header__eyebrow" style="margin-bottom: 10px">权限列表</div>
          <a-space wrap>
            <a-tag v-for="item in permissionLabels" :key="item" color="blue" style="padding: 6px 12px">
              {{ item }}
            </a-tag>
          </a-space>
        </div>

        <div class="content-panel" style="padding: 24px">
          <div class="page-header__eyebrow" style="margin-bottom: 10px">最近操作</div>
          <a-timeline>
            <a-timeline-item v-for="item in myLogs" :key="item.id" color="blue">
              <div style="font-weight: 700; color: #111827">{{ item.action }}</div>
              <div style="margin-top: 8px; color: #4b5563; line-height: 1.8">{{ item.target }}</div>
              <div style="margin-top: 6px; color: #94a3b8; font-size: 12px">{{ item.createdAt }}</div>
            </a-timeline-item>
          </a-timeline>
        </div>

        <div class="content-panel" style="padding: 24px; margin-top: 18px">
          <div class="page-header__eyebrow" style="margin-bottom: 10px">最近登录记录</div>
          <a-timeline>
            <a-timeline-item
              v-for="item in myLoginLogs"
              :key="item.id"
              :color="item.status === 'success' ? 'green' : 'red'"
            >
              <div style="font-weight: 700; color: #111827">
                {{ item.status === 'success' ? '登录成功' : '登录失败' }} · {{ item.deviceName || '未识别设备' }}
              </div>
              <div style="margin-top: 8px; color: #4b5563; line-height: 1.8">
                {{ item.reason }} · {{ item.ipAddress }}
              </div>
              <div style="margin-top: 6px; color: #94a3b8; font-size: 12px">{{ item.createdAt }}</div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
