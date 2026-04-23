'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, CreditCard, Package, ShieldCheck, Truck } from 'lucide-react';
import { clearStoredCart, getCartDisplayItems, subscribeCartUpdates } from '@/lib/cart';
import { prependStoredOrder } from '@/lib/orders';
import { type Order } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type CheckoutFormState = {
  contactName: string;
  email: string;
  company: string;
  destinationCountry: string;
  shippingAddress: string;
  paymentMethod: string;
  notes: string;
};

function createOrderId() {
  if (typeof window !== 'undefined' && 'crypto' in window && 'randomUUID' in window.crypto) {
    return `ORD-${window.crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  }

  return `ORD-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export default function CheckoutPageClient() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(getCartDisplayItems);
  const [formData, setFormData] = useState<CheckoutFormState>({
    contactName: '',
    email: '',
    company: '',
    destinationCountry: '',
    shippingAddress: '',
    paymentMethod: 'net60',
    notes: '',
  });

  useEffect(() => subscribeCartUpdates(() => setCartItems(getCartDisplayItems())), []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );
  const shipping = subtotal > 250 ? 0 : 25;
  const total = subtotal + shipping;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const orderId = createOrderId();
    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'submitted',
      contactName: formData.contactName,
      email: formData.email,
      company: formData.company,
      destinationCountry: formData.destinationCountry,
      shippingAddress: formData.shippingAddress,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      subtotal,
      shipping,
      total,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        brandId: item.brand.id,
        brandName: item.brand.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        minOrderQuantity: item.product.minOrderQuantity,
      })),
    };

    prependStoredOrder(newOrder);
    clearStoredCart();
    router.push(`/checkout/success?order=${encodeURIComponent(orderId)}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/cart" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Package className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-950">当前没有可结算商品</h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-7">
              先从商品页加入购物车，再回来完成下单和后续询盘动作，这样整条前端链路就更完整。
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/brands" className="brand-button-primary">
                浏览供应商
              </Link>
              <Link href="/cart" className="brand-button-secondary">
                返回购物车
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/cart" />

      <PageHero
        eyebrow="Checkout"
        title="把采购清单整理成一笔可以继续推进的订单"
        description="这一步先以前端表单把结算信息、收货市场和支付方式补完整，让下单动作在演示层面形成闭环。"
        stats={[
          { label: '待结算商品', value: `${cartItems.length}` },
          { label: '采购件数', value: `${cartItems.reduce((sum, item) => sum + item.quantity, 0)}` },
          { label: '支付方式', value: formData.paymentMethod === 'card' ? 'Card' : 'Net 60' },
          { label: '订单金额', value: `$${total.toFixed(0)}` },
        ]}
      />

      <section className="brand-section py-10">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8 lg:p-10">
              <div className="mb-8">
                <p className="brand-eyebrow mb-4">Order Details</p>
                <h2 className="text-3xl font-semibold text-gray-950">填写结算信息</h2>
                <p className="mt-3 text-gray-600 leading-7">
                  当前先用前端表单模拟下单流程，后续可以继续接支付、地址校验、税费和真实订单 API。
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    联系人
                    <input
                      value={formData.contactName}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, contactName: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="请输入联系人姓名"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    商务邮箱
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, email: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="buyer@example.com"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    公司名称
                    <input
                      value={formData.company}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, company: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="请输入公司名称"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    收货国家
                    <input
                      value={formData.destinationCountry}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          destinationCountry: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="如 United States"
                      required
                    />
                  </label>
                </div>

                <label className="block text-sm font-semibold text-gray-700">
                  收货地址
                  <textarea
                    rows={4}
                    value={formData.shippingAddress}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        shippingAddress: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    placeholder="请输入完整收货地址"
                    required
                  ></textarea>
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  支付方式
                  <select
                    value={formData.paymentMethod}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, paymentMethod: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="net60">Net 60</option>
                    <option value="card">Corporate Card</option>
                    <option value="wire">Wire Transfer</option>
                  </select>
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  订单备注
                  <textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    placeholder="可填写交期、包装、样品或税务说明"
                  ></textarea>
                </label>

                <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-sm leading-6 text-gray-500">
                    下单后会跳到成功页，并清空购物车，完成前端交易路径的最后一步演示。
                  </p>
                  <button className="brand-button-primary" type="submit">
                    提交订单 <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={80}>
              <div className="brand-card rounded-[2rem] p-7">
                <p className="brand-eyebrow mb-4">Order Summary</p>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="rounded-[1.4rem] border border-gray-100 bg-white p-4">
                      <div className="flex items-start gap-4">
                        <div className="brand-icon-badge h-11 w-11 shrink-0 text-white">
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-950">{item.product.name}</p>
                          <p className="mt-1 text-sm text-gray-500">{item.brand.name}</p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>数量 {item.quantity}</span>
                            <span>MOQ {item.product.minOrderQuantity}</span>
                            <span>单价 ${item.product.price}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-4 border-t border-gray-100 pt-6 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>小计</span>
                    <span className="font-semibold text-gray-950">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>运费</span>
                    <span className="font-semibold text-gray-950">
                      {shipping === 0 ? '免费' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-lg font-semibold text-gray-950">
                    <span>订单总计</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-7 text-white">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Why This Step Matters</p>
                <div className="grid gap-3">
                  {[
                    { icon: Truck, text: '把收货国家和地址补齐，页面体验更接近真实结算场景。' },
                    { icon: CreditCard, text: '先支持 Net 60、企业卡和电汇等 B2B 语义。' },
                    { icon: ShieldCheck, text: '下单成功页可以承接后续通知、订单跟踪和复购入口。' },
                    { icon: BadgeCheck, text: '这一版完成后，前端交易路径就从浏览延伸到了下单结果。' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.text} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                        <Icon className="mb-3 h-4 w-4 text-orange-300" />
                        {item.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
