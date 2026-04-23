<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import {
  useAppStore,
  type InviteMemberPayload,
  type LoginLogRecord,
  type MemberRecord,
} from '../stores/app';

const store = useAppStore();
const { members, roles, operationLogs, loginLogs } = storeToRefs(store);

const inviteOpen = ref(false);
const resetPasswordOpen = ref(false);
const saving = ref(false);
const resettingPassword = ref(false);
const loginLogFilter = ref('');
const selectedMember = ref<MemberRecord | null>(null);

const inviteForm = reactive<InviteMemberPayload>({
  username: '',
  displayName: '',
  email: '',
  role: 'ops_manager',
  tempPassword: '',
});

const resetPasswordForm = reactive({
  newPassword: '',
});

const roleOptions = [
  { label: '管理员', value: 'seller_admin' },
  { label: '运营', value: 'ops_manager' },
  { label: '销售', value: 'sales_manager' },
  { label: '查看账号', value: 'viewer' },
] as const;

const columns = [
  { title: '成员', dataIndex: 'displayName', key: 'displayName' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '最近登录', dataIndex: 'lastLogin', key: 'lastLogin' },
  { title: '最近设备', dataIndex: 'lastLoginDevice', key: 'lastLoginDevice' },
  { title: '权限', key: 'permissions' },
  { title: '操作', key: 'action' },
] as const;

const loginLogColumns = [
  { title: '成员', dataIndex: 'displayName', key: 'displayName' },
  { title: '结果', dataIndex: 'status', key: 'status' },
  { title: '原因', dataIndex: 'reason', key: 'reason' },
  { title: '设备', dataIndex: 'deviceName', key: 'deviceName' },
  { title: 'IP', dataIndex: 'ipAddress', key: 'ipAddress' },
  { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
] as const;

const activeCount = computed(() => members.value.filter((item) => item.status === 'active').length);
const invitedCount = computed(() => members.value.filter((item) => item.status === 'invited').length);
const failedLoginCount = computed(() => loginLogs.value.filter((item) => item.status === 'failed').length);

onMounted(async () => {
  await Promise.all([
    store.loadMembers(),
    store.loadRoles(),
    store.loadOperationLogs(),
    store.loadLoginLogs(),
  ]);
});

function roleLabel(role: MemberRecord['role']) {
  return roleOptions.find((item) => item.value === role)?.label ?? role;
}

function statusText(status: MemberRecord['status']) {
  if (status === 'active') return '已启用';
  if (status === 'invited') return '待激活';
  return '已停用';
}

function statusClass(status: MemberRecord['status']) {
  if (status === 'active') return 'status-pill status-pill--success';
  if (status === 'invited') return 'status-pill status-pill--processing';
  return 'status-pill status-pill--muted';
}

function loginStatusText(status: LoginLogRecord['status']) {
  return status === 'success' ? '成功' : '失败';
}

function loginStatusColor(status: LoginLogRecord['status']) {
  return status === 'success' ? 'green' : 'red';
}

function resetInviteForm() {
  inviteForm.username = '';
  inviteForm.displayName = '';
  inviteForm.email = '';
  inviteForm.role = 'ops_manager';
  inviteForm.tempPassword = '';
}

function openResetPassword(member: MemberRecord) {
  selectedMember.value = member;
  resetPasswordForm.newPassword = '';
  resetPasswordOpen.value = true;
}

async function refreshAccountData(username = loginLogFilter.value) {
  await Promise.all([
    store.loadMembers(),
    store.loadRoles(),
    store.loadOperationLogs(),
    store.loadLoginLogs(username),
  ]);
}

async function submitInvite() {
  if (!inviteForm.username.trim() || !inviteForm.displayName.trim() || !inviteForm.email.trim() || !inviteForm.tempPassword.trim()) {
    message.warning('请完整填写成员邀请信息');
    return;
  }

  saving.value = true;
  try {
    await store.inviteMember({ ...inviteForm });
    await refreshAccountData();
    message.success('成员已邀请');
    inviteOpen.value = false;
    resetInviteForm();
  } finally {
    saving.value = false;
  }
}

async function changeRole(username: string, role: MemberRecord['role']) {
  await store.updateMemberRole(username, role);
  await refreshAccountData();
  message.success('成员角色已更新');
}

async function toggleStatus(member: MemberRecord) {
  const nextStatus: MemberRecord['status'] = member.status === 'disabled' ? 'active' : 'disabled';
  await store.updateMemberStatus(member.username, nextStatus);
  await refreshAccountData();
  message.success(nextStatus === 'active' ? '成员已启用' : '成员已停用');
}

async function activateInvite(member: MemberRecord) {
  await store.updateMemberStatus(member.username, 'active');
  await refreshAccountData();
  message.success('成员已激活');
}

async function submitResetPassword() {
  if (!selectedMember.value) return;
  if (resetPasswordForm.newPassword.trim().length < 6) {
    message.warning('新密码至少需要 6 位');
    return;
  }

  resettingPassword.value = true;
  try {
    await store.resetMemberPassword(selectedMember.value.username, resetPasswordForm.newPassword.trim());
    await refreshAccountData();
    message.success(`已重置 ${selectedMember.value.displayName} 的密码`);
    resetPasswordOpen.value = false;
  } finally {
    resettingPassword.value = false;
  }
}

async function applyLoginLogFilter() {
  await store.loadLoginLogs(loginLogFilter.value);
}

async function resetLoginLogFilter() {
  loginLogFilter.value = '';
  await store.loadLoginLogs();
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header__meta">
        <p class="page-header__eyebrow">账号权限</p>
        <h1>让卖家团队可以多人协同使用后台</h1>
        <p>
          这里集中处理成员邀请、角色权限、账号状态、密码重置和登录日志，补齐后台从单人演示到团队协作的关键一环。
        </p>
      </div>
      <a-button type="primary" size="large" @click="inviteOpen = true">邀请成员</a-button>
    </div>

    <a-row :gutter="[18, 18]" style="margin-bottom: 22px">
      <a-col :xs="24" :md="8">
        <div class="metric-card" style="padding: 22px">
          <div style="font-size: 13px; color: #6b7280">已启用成员</div>
          <div style="margin-top: 10px; font-size: 30px; font-weight: 700; color: #111827">{{ activeCount }}</div>
          <div style="margin-top: 10px; color: #047857; font-weight: 600">可直接参与后台业务处理</div>
        </div>
      </a-col>
      <a-col :xs="24" :md="8">
        <div class="metric-card" style="padding: 22px">
          <div style="font-size: 13px; color: #6b7280">待激活成员</div>
          <div style="margin-top: 10px; font-size: 30px; font-weight: 700; color: #111827">{{ invitedCount }}</div>
          <div style="margin-top: 10px; color: #1d4ed8; font-weight: 600">已发出邀请，待首次登录启用</div>
        </div>
      </a-col>
      <a-col :xs="24" :md="8">
        <div class="metric-card" style="padding: 22px">
          <div style="font-size: 13px; color: #6b7280">近期登录失败</div>
          <div style="margin-top: 10px; font-size: 30px; font-weight: 700; color: #111827">{{ failedLoginCount }}</div>
          <div style="margin-top: 10px; color: #9a3412; font-weight: 600">可快速排查密码错误、停用和待激活账号</div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="[18, 18]" style="margin-bottom: 22px">
      <a-col v-for="role in roles" :key="role.key" :xs="24" :xl="12">
        <div class="content-panel" style="padding: 22px">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px">
            <div>
              <div style="font-size: 20px; font-weight: 700; color: #111827">{{ role.label }}</div>
              <div style="margin-top: 8px; color: #6b7280; line-height: 1.8">{{ role.description }}</div>
            </div>
            <a-tag color="blue">{{ role.memberCount }} 人</a-tag>
          </div>
          <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px">
            <a-tag v-for="permission in role.permissions" :key="permission" color="geekblue">{{ permission }}</a-tag>
          </div>
        </div>
      </a-col>
    </a-row>

    <a-row :gutter="[18, 18]">
      <a-col :xs="24" :xl="16">
        <div class="content-panel" style="padding: 24px">
          <div class="page-header" style="margin-bottom: 18px">
            <div class="page-header__meta">
              <p class="page-header__eyebrow">成员列表</p>
              <h1 style="font-size: 24px">可直接调整角色、状态和密码</h1>
            </div>
          </div>

          <a-table :columns="columns" :data-source="members" row-key="username" :pagination="{ pageSize: 6 }">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'displayName'">
                <div>
                  <div style="font-weight: 700; color: #111827">{{ record.displayName }}</div>
                  <div style="margin-top: 6px; color: #6b7280; font-size: 13px">{{ record.username }} · {{ record.email }}</div>
                </div>
              </template>
              <template v-else-if="column.key === 'role'">
                <a-select :value="record.role" style="width: 130px" @change="changeRole(record.username, $event)">
                  <a-select-option v-for="item in roleOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </template>
              <template v-else-if="column.key === 'status'">
                <span :class="statusClass(record.status)">{{ statusText(record.status) }}</span>
              </template>
              <template v-else-if="column.key === 'lastLogin'">
                <div>
                  <div style="font-weight: 600; color: #111827">{{ record.lastLogin }}</div>
                  <div style="margin-top: 6px; color: #94a3b8; font-size: 12px">{{ roleLabel(record.role) }}</div>
                </div>
              </template>
              <template v-else-if="column.key === 'lastLoginDevice'">
                <span style="color: #4b5563">{{ record.lastLoginDevice || '暂无记录' }}</span>
              </template>
              <template v-else-if="column.key === 'permissions'">
                <div style="display: flex; flex-wrap: wrap; gap: 6px">
                  <a-tag v-for="permission in record.permissions" :key="permission">{{ permission }}</a-tag>
                </div>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-space wrap>
                  <a-button type="link" @click="openResetPassword(record)">重置密码</a-button>
                  <a-button v-if="record.status === 'invited'" type="link" @click="activateInvite(record)">激活</a-button>
                  <a-button v-else type="link" @click="toggleStatus(record)">
                    {{ record.status === 'disabled' ? '启用' : '停用' }}
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>

      <a-col :xs="24" :xl="8">
        <div class="content-panel" style="padding: 24px">
          <div class="page-header__eyebrow" style="margin-bottom: 12px">操作日志</div>
          <a-timeline>
            <a-timeline-item v-for="item in operationLogs.slice(0, 10)" :key="item.id" color="blue">
              <div style="font-weight: 700; color: #111827">{{ item.actor }} · {{ item.action }}</div>
              <div style="margin-top: 8px; color: #4b5563; line-height: 1.8">{{ item.target }}</div>
              <div style="margin-top: 6px; color: #94a3b8; font-size: 12px">{{ item.createdAt }}</div>
            </a-timeline-item>
          </a-timeline>
        </div>
      </a-col>
    </a-row>

    <div class="content-panel" style="padding: 24px; margin-top: 22px">
      <div class="page-header" style="margin-bottom: 18px">
        <div class="page-header__meta">
          <p class="page-header__eyebrow">登录日志</p>
          <h1 style="font-size: 24px">可追踪登录成功、失败原因和最近设备</h1>
        </div>
        <a-space>
          <a-select
            v-model:value="loginLogFilter"
            allow-clear
            placeholder="按成员筛选"
            style="width: 180px"
            @change="applyLoginLogFilter"
          >
            <a-select-option v-for="item in members" :key="item.username" :value="item.username">
              {{ item.displayName }} / {{ item.username }}
            </a-select-option>
          </a-select>
          <a-button @click="resetLoginLogFilter">重置</a-button>
        </a-space>
      </div>

      <a-table :columns="loginLogColumns" :data-source="loginLogs" row-key="id" :pagination="{ pageSize: 8 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'displayName'">
            <div>
              <div style="font-weight: 700; color: #111827">{{ record.displayName }}</div>
              <div style="margin-top: 6px; color: #6b7280; font-size: 13px">{{ record.username }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="loginStatusColor(record.status)">{{ loginStatusText(record.status) }}</a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <a-drawer :open="inviteOpen" :width="520" title="邀请新成员" @close="inviteOpen = false">
      <a-form layout="vertical">
        <a-form-item label="成员姓名" required>
          <a-input v-model:value="inviteForm.displayName" placeholder="例如：采购同事 / 客服同事" />
        </a-form-item>
        <a-form-item label="登录账号" required>
          <a-input v-model:value="inviteForm.username" placeholder="例如：buyer01" />
        </a-form-item>
        <a-form-item label="邮箱" required>
          <a-input v-model:value="inviteForm.email" placeholder="请输入成员邮箱" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="inviteForm.role" :options="roleOptions" />
        </a-form-item>
        <a-form-item label="初始密码" required>
          <a-input-password v-model:value="inviteForm.tempPassword" placeholder="请输入初始密码" />
        </a-form-item>
        <div
          style="
            padding: 14px 16px;
            border-radius: 16px;
            background: #fff7ed;
            color: #9a3412;
            line-height: 1.8;
            margin-bottom: 18px;
          "
        >
          当前是后台版成员邀请，邀请后账号会进入“待激活”状态，可在成员列表中继续启用或调整权限。
        </div>
        <div style="display: flex; justify-content: flex-end">
          <a-button type="primary" :loading="saving" @click="submitInvite">确认邀请</a-button>
        </div>
      </a-form>
    </a-drawer>

    <a-modal
      :open="resetPasswordOpen"
      title="重置成员密码"
      :confirm-loading="resettingPassword"
      ok-text="确认重置"
      cancel-text="取消"
      @ok="submitResetPassword"
      @cancel="resetPasswordOpen = false"
    >
      <div
        style="
          margin-bottom: 16px;
          padding: 14px 16px;
          border-radius: 16px;
          background: #eff6ff;
          color: #1d4ed8;
          line-height: 1.8;
        "
      >
        正在为 <strong>{{ selectedMember?.displayName || '成员' }}</strong> 重置密码，保存后成员将使用新密码登录后台。
      </div>
      <a-form layout="vertical">
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="resetPasswordForm.newPassword" placeholder="请输入不少于 6 位的新密码" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
