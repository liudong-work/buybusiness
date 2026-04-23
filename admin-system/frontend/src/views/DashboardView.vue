<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useAppStore } from '../stores/app';

const store = useAppStore();
const router = useRouter();
const { metrics, tasks, loading } = storeToRefs(store);

onMounted(() => {
  store.loadDashboard();
});

const quickLinks = computed(() => [
  {
    key: 'inquiries-follow-up',
    title: '待跟进询盘',
    description: '直接进入询盘页并筛选跟进中状态',
    action: () => router.push({ path: '/inquiries', query: { status: 'follow_up' } }),
  },
  {
    key: 'orders-ready',
    title: '待发货订单',
    description: '跳到订单页并筛选待发货状态',
    action: () => router.push({ path: '/orders', query: { status: 'ready_to_ship' } }),
  },
  {
    key: 'create-product',
    title: '新增商品',
    description: '进入商品页后直接打开新增抽屉',
    action: () => router.push({ path: '/products', query: { action: 'create' } }),
  },
  {
    key: 'shipment-batches',
    title: '发货批次',
    description: '直接进入订单页查看最新批次与打印状态',
    action: () => router.push({ path: '/orders' }),
  },
]);

function statusClass(status: string) {
  if (status === 'success') return 'status-pill status-pill--success';
  if (status === 'processing') return 'status-pill status-pill--processing';
  return 'status-pill status-pill--warning';
}

function statusText(status: string) {
  if (status === 'success') return '已完成';
  if (status === 'processing') return '处理中';
  return '待处理';
}

function openMetric(label: string) {
  if (label.includes('待跟进询盘')) {
    router.push({ path: '/inquiries', query: { status: 'follow_up' } });
    return;
  }
  if (label.includes('待发货订单')) {
    router.push({ path: '/orders', query: { status: 'ready_to_ship' } });
    return;
  }
  if (label.includes('上架商品')) {
    router.push('/products');
    return;
  }
}

function openTask(title: string) {
  if (title.includes('样品') || title.includes('报价')) {
    router.push({ path: '/inquiries', query: { status: 'follow_up' } });
    return;
  }
  if (title.includes('库存')) {
    router.push('/products');
    return;
  }
  if (title.includes('账期') || title.includes('政策')) {
    router.push('/settings');
    return;
  }
  router.push('/orders');
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header__meta">
        <p class="page-header__eyebrow">工作台</p>
        <h1>让卖家团队围绕每日运营重点协同推进</h1>
        <p>
          现在首页不只是看板了，关键指标和快捷入口都已经能直接带你进入对应业务页面，减少来回切换和再次筛选。
        </p>
      </div>
      <a-space>
        <a-button size="large" @click="router.push('/settings')">编辑店铺设置</a-button>
        <a-button type="primary" size="large" @click="router.push({ path: '/products', query: { action: 'create' } })">
          新增商品
        </a-button>
      </a-space>
    </div>

    <a-spin :spinning="loading">
      <a-row :gutter="[18, 18]">
        <a-col v-for="metric in metrics" :key="metric.label" :xs="24" :sm="12" :xl="6">
          <div class="metric-card" style="padding: 22px; cursor: pointer" @click="openMetric(metric.label)">
            <div style="font-size: 13px; color: #6b7280">{{ metric.label }}</div>
            <div style="margin-top: 10px; font-size: 32px; font-weight: 700; color: #111827">{{ metric.value }}</div>
            <div style="margin-top: 10px; color: #047857; font-weight: 600">{{ metric.delta }}</div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[18, 18]" style="margin-top: 22px; margin-bottom: 22px">
        <a-col v-for="link in quickLinks" :key="link.key" :xs="24" :md="12" :xl="6">
          <div class="content-panel" style="padding: 22px; cursor: pointer" @click="link.action">
            <div class="page-header__eyebrow" style="margin-bottom: 10px">快捷入口</div>
            <div style="font-size: 22px; font-weight: 700; color: #111827">{{ link.title }}</div>
            <div style="margin-top: 12px; color: #6b7280; line-height: 1.8">{{ link.description }}</div>
          </div>
        </a-col>
      </a-row>

      <a-row :gutter="[20, 20]">
        <a-col :xs="24" :xl="15">
          <div class="content-panel" style="padding: 24px">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px">
              <div>
                <div class="page-header__eyebrow" style="margin-bottom: 8px">待办事项</div>
                <h2 style="margin: 0; font-size: 24px; color: #111827">卖家行动队列</h2>
              </div>
              <a-badge status="warning" text="建议每日巡检" />
            </div>

            <a-list :data-source="tasks" item-layout="horizontal">
              <template #renderItem="{ item }">
                <a-list-item style="cursor: pointer" @click="openTask(item.title)">
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar style="background: #fff7ed; color: #c2410c">
                        <ExclamationCircleOutlined />
                      </a-avatar>
                    </template>
                    <template #title>
                      <span style="font-weight: 700; color: #111827">{{ item.title }}</span>
                    </template>
                    <template #description>
                      <span style="color: #6b7280">
                        负责人：{{ item.owner }} · 截止时间：{{ item.dueLabel }}
                      </span>
                    </template>
                  </a-list-item-meta>
                  <span :class="statusClass(item.status)">{{ statusText(item.status) }}</span>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </a-col>

        <a-col :xs="24" :xl="9">
          <div
            class="content-panel"
            style="
              padding: 24px;
              background: linear-gradient(135deg, #111827, #1f2937 64%, #9a3412);
              color: white;
            "
          >
            <div class="page-header__eyebrow" style="color: rgba(253, 230, 138, 0.92)">运行状态</div>
            <h2 style="margin: 0; font-size: 24px; color: white">运营就绪度</h2>
            <p style="margin: 14px 0 0; color: rgba(255,255,255,0.76); line-height: 1.8">
              工作台已经接通询盘、订单、商品和店铺设置入口，首页可以直接承接日常运营操作，而不只是展示数据。
            </p>

            <a-statistic
              title="当前询盘响应 SLA"
              value="3.5h"
              :value-style="{ color: '#fff' }"
              style="margin-top: 28px"
            />

            <a-divider style="border-color: rgba(255,255,255,0.12)" />

            <a-space direction="vertical" size="middle">
              <a-tag color="blue">点击待跟进询盘可直达跟进列表</a-tag>
              <a-tag color="orange">点击待发货订单可直达待发货视图</a-tag>
              <a-tag color="green">点击新增商品可直接打开创建抽屉</a-tag>
              <a-tag color="gold">点击发货批次可查看打印和导出进度</a-tag>
            </a-space>
          </div>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>
