'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, PackageSearch, Truck } from 'lucide-react';
import { getOrderStatusMeta, loadStoredOrders, subscribeOrderUpdates } from '@/lib/orders';
import { type Order, type OrderStatus } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type OrderFilter = 'all' | OrderStatus;

const filters: Array<{ key: OrderFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'submitted', label: '已提交' },
  { key: 'processing', label: '处理中' },
  { key: 'ready_to_ship', label: '待发货' },
  { key: 'completed', label: '已完成' },
];

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');

  useEffect(() => {
    const syncOrders = () => setOrders(loadStoredOrders());
    syncOrders();
    return subscribeOrderUpdates(syncOrders);
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') return orders;
    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/account" />

      <PageHero
        eyebrow="My Orders"
        title="把下单结果从成功页延伸成可持续查看的订单列表"
        description="现在订单不会只停留在一个成功提示里了，而是会沉淀成可筛选、可查看详情、可继续回访的列表。"
        stats={[
          { label: '订单总数', value: `${orders.length}` },
          { label: '待处理', value: `${orders.filter((order) => order.status !== 'completed').length}` },
          { label: '已完成', value: `${orders.filter((order) => order.status === 'completed').length}` },
          { label: '最高订单额', value: orders[0] ? `$${Math.max(...orders.map((order) => order.total)).toFixed(0)}` : '--' },
        ]}
        actions={
          <>
            <Link href="/account" className="brand-button-primary">
              返回工作台
            </Link>
            <Link href="/brands" className="brand-button-secondary">
              继续采购
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <Reveal>
          <div className="brand-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="brand-eyebrow mb-4">Order Filter</p>
                <h2 className="text-3xl font-semibold text-gray-950">订单列表</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      activeFilter === filter.key
                        ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-[0_12px_24px_rgba(194,65,12,0.2)]'
                        : 'bg-[#fff7ed] text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 space-y-5">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => {
              const statusMeta = getOrderStatusMeta(order.status);

              return (
                <Reveal key={order.id} delay={index * 60}>
                  <div className="brand-card rounded-[2rem] p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-semibold text-gray-950">{order.id}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-4">
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">订单金额</div>
                            <div className="mt-2 font-semibold text-gray-950">${order.total.toFixed(2)}</div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">商品条目</div>
                            <div className="mt-2 font-semibold text-gray-950">{order.items.length}</div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">支付方式</div>
                            <div className="mt-2 font-semibold text-gray-950">{order.paymentMethod}</div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">目的市场</div>
                            <div className="mt-2 font-semibold text-gray-950">{order.destinationCountry}</div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-[1.6rem] bg-[#fffaf5] p-5 text-sm leading-7 text-gray-600">
                          <p className="font-semibold text-gray-950">当前状态说明</p>
                          <p className="mt-2">{statusMeta.description}</p>
                        </div>
                      </div>

                      <div className="w-full lg:max-w-[280px]">
                        <div className="rounded-[1.8rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-5 text-white">
                          <p className="text-xs uppercase tracking-[0.24em] text-orange-200/80">Next Step</p>
                          <div className="mt-4 space-y-4 text-sm text-white/75">
                            <div className="flex items-center gap-3">
                              <PackageSearch className="h-4 w-4 text-orange-300" />
                              <span>{order.company}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Truck className="h-4 w-4 text-orange-300" />
                              <span>{new Date(order.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                          <Link href={`/orders/${order.id}`} className="brand-button-primary mt-6 text-sm">
                            查看订单详情 <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })
          ) : (
            <Reveal>
              <div className="brand-card rounded-[2rem] p-12 text-center">
                <PackageSearch className="mx-auto mb-5 h-8 w-8 text-orange-600" />
                <h2 className="text-3xl font-semibold text-gray-950">还没有订单记录</h2>
                <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                  现在下单动作已经会沉淀到这里。你可以先从商品页加入购物车，再继续完成结算。
                </p>
                <Link href="/brands" className="brand-button-primary mt-8">
                  去浏览供应商
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
