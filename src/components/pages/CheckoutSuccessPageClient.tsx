'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, Mail, Package, Sparkles } from 'lucide-react';
import { getStoredOrderById } from '@/lib/orders';
import { type Order } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type CheckoutSuccessPageClientProps = {
  orderId?: string;
};

export default function CheckoutSuccessPageClient({ orderId }: CheckoutSuccessPageClientProps) {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;
    setOrder(getStoredOrderById(orderId) ?? null);
  }, [orderId]);

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/cart" />

      <PageHero
        eyebrow="Order Submitted"
        title="订单已经提交，前端交易闭环已完整跑通"
        description="这一步说明从商品浏览、购物车整理、结算填写到成功反馈的整条前端路径已经能自洽地串起来。"
        stats={[
          { label: '订单编号', value: orderId ?? '已生成' },
          { label: '商品条目', value: order ? `${order.items.length}` : '--' },
          { label: '订单金额', value: order ? `$${order.total.toFixed(2)}` : '--' },
          { label: '当前状态', value: 'Submitted' },
        ]}
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8 lg:p-10">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BadgeCheck className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-950">下单成功</h2>
              <p className="mt-4 max-w-2xl text-gray-600 leading-8">
                当前为前端演示版本，订单已经完成提交反馈，购物车也会同步清空。后续接入真实 API 后，这里可以继续承接订单详情、物流状态和邮件通知。
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <Package className="mb-3 h-5 w-5 text-orange-600" />
                  <p className="text-sm text-gray-500">订单编号</p>
                  <p className="mt-2 font-semibold text-gray-950">{orderId ?? '自动生成'}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <Sparkles className="mb-3 h-5 w-5 text-orange-600" />
                  <p className="text-sm text-gray-500">前端状态</p>
                  <p className="mt-2 font-semibold text-gray-950">闭环完成</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5">
                  <Mail className="mb-3 h-5 w-5 text-orange-600" />
                  <p className="text-sm text-gray-500">下一步</p>
                  <p className="mt-2 font-semibold text-gray-950">接订单通知</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {orderId ? (
                  <Link href={`/orders/${orderId}`} className="brand-button-primary">
                    查看订单详情
                  </Link>
                ) : (
                  <Link href="/brands" className="brand-button-primary">
                    继续浏览供应商
                  </Link>
                )}
                <Link href="/inquiries" className="brand-button-secondary">
                  查看我的询盘
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-8 text-white lg:p-10">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Next Iteration</p>
              <h2 className="text-3xl font-semibold leading-tight">下一步最自然的衔接，就是把订单、询盘和账号全部接到真实数据层。</h2>
              <div className="mt-8 grid gap-4">
                {[
                  '订单提交后写入真实数据库',
                  '邮件或站内通知提醒采购商',
                  '订单列表与详情页承接回访',
                  '和询盘、购物车、登录账号打通',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
