'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CreditCard, MapPin, Package, Truck } from 'lucide-react';
import {
  getOrderStatusMeta,
  getOrderTimeline,
  getStoredOrderById,
  subscribeOrderUpdates,
} from '@/lib/orders';
import { type Order } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

interface OrderDetailPageClientProps {
  orderId: string;
}

export default function OrderDetailPageClient({ orderId }: OrderDetailPageClientProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const syncOrder = () => setOrder(getStoredOrderById(orderId) ?? null);
    syncOrder();
    return subscribeOrderUpdates(syncOrder);
  }, [orderId]);

  if (!order) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/account" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <Package className="mx-auto mb-5 h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-semibold text-gray-950">订单未找到</h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-7">
              当前订单可能还没有被创建，或者本地演示数据已经清理。可以先返回订单列表继续查看其他记录。
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/orders" className="brand-button-primary">
                返回订单列表
              </Link>
              <Link href="/account" className="brand-button-secondary">
                返回工作台
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const timeline = getOrderTimeline(order.status);

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/account" />

      <PageHero
        eyebrow="Order Detail"
        title={`订单 ${order.id}`}
        description="订单详情页现在已经能承接成功页之后的回访动作，这样用户后续再回来时，不会只看到一次性提示。"
        stats={[
          { label: '当前状态', value: statusMeta.label },
          { label: '订单金额', value: `$${order.total.toFixed(0)}` },
          { label: '商品条目', value: `${order.items.length}` },
          { label: '下单时间', value: new Date(order.createdAt).toLocaleDateString('zh-CN') },
        ]}
        actions={
          <>
            <Link href="/orders" className="brand-button-primary">
              返回订单列表
            </Link>
            <Link href="/account" className="brand-button-secondary">
              返回工作台
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold text-gray-950">订单概览</h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <MapPin className="mb-3 h-5 w-5 text-orange-600" />
                  <p className="text-sm text-gray-500">收货国家</p>
                  <p className="mt-2 font-semibold text-gray-950">{order.destinationCountry}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <CreditCard className="mb-3 h-5 w-5 text-orange-600" />
                  <p className="text-sm text-gray-500">支付方式</p>
                  <p className="mt-2 font-semibold text-gray-950">{order.paymentMethod}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.8rem] bg-[#fffaf5] p-6 text-sm leading-7 text-gray-600">
                <p className="font-semibold text-gray-950">配送地址</p>
                <p className="mt-2">{order.shippingAddress}</p>
                {order.notes ? (
                  <>
                    <p className="mt-5 font-semibold text-gray-950">订单备注</p>
                    <p className="mt-2">{order.notes}</p>
                  </>
                ) : null}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="brand-eyebrow mb-4">Line Items</p>
                  <h2 className="text-3xl font-semibold text-gray-950">订单商品</h2>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="rounded-[1.6rem] border border-gray-100 bg-white p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="brand-icon-badge h-11 w-11 text-white">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-950">{item.productName}</p>
                          <p className="mt-1 text-sm text-gray-500">{item.brandName}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>数量 {item.quantity}</span>
                        <span>MOQ {item.minOrderQuantity}</span>
                        <span>单价 ${item.unitPrice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-4 border-t border-gray-100 pt-6 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>小计</span>
                  <span className="font-semibold text-gray-950">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>运费</span>
                  <span className="font-semibold text-gray-950">${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold text-gray-950">
                  <span>总计</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-8 text-white">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Order Timeline</p>
            <div className="grid gap-4 md:grid-cols-4">
              {timeline.map((step) => (
                <div
                  key={step.step}
                  className={`rounded-2xl border p-4 text-sm transition-all ${
                    step.isCurrent
                      ? 'border-orange-300 bg-white/12 text-white'
                      : step.isCompleted
                        ? 'border-white/10 bg-white/8 text-white/90'
                        : 'border-white/8 bg-white/5 text-white/55'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        step.isCurrent ? 'bg-orange-300' : step.isCompleted ? 'bg-emerald-300' : 'bg-white/30'
                      }`}
                    ></div>
                    <span className="font-semibold">{step.label}</span>
                  </div>
                  <p className="leading-6">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-4">
              <Truck className="mt-1 h-5 w-5 text-orange-300" />
              <div>
                <p className="font-semibold">{statusMeta.label}</p>
                <p className="mt-2 text-sm leading-7 text-white/75">{statusMeta.description}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
