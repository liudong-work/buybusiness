'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Package, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { getCartDisplayItems, removeStoredCartItem, subscribeCartUpdates, updateStoredCartQuantity } from '@/lib/cart';
import { serializeInquiryItemsParam } from '@/lib/inquiries';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';
import { type CartDisplayItem } from '@/types';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartDisplayItem[]>([]);

  useEffect(() => {
    const syncCart = () => setCartItems(getCartDisplayItems());
    syncCart();
    return subscribeCartUpdates(syncCart);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    updateStoredCartQuantity(id, newQuantity);
  };

  const removeItem = (id: string) => {
    removeStoredCartItem(id);
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );
  const shipping = subtotal > 250 ? 0 : 25;
  const total = subtotal + shipping;
  const inquiryItems = serializeInquiryItemsParam(
    cartItems.map((item) => ({ id: item.productId, quantity: item.quantity }))
  );

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/cart" />

      <PageHero
        eyebrow="Cart Overview"
        title="把采购清单做得更像真实商务决策，而不只是一个价格汇总"
        description="购物车里重点展示商品来源、MOQ、汇总信息和下一步动作，让批发采购决策更清晰。"
        stats={[
          { label: '购物车商品', value: `${cartItems.length}` },
          { label: '当前小计', value: `$${subtotal.toFixed(0)}` },
          { label: '运费状态', value: shipping === 0 ? 'Free' : '$25' },
          { label: '支付条款', value: 'Net 60' },
        ]}
      />

      <section className="brand-section py-10">
        {cartItems.length === 0 ? (
          <Reveal>
            <div className="brand-card rounded-[2rem] p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-950">购物车暂时是空的</h2>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                你可以先继续浏览供应商和商品，再回到这里汇总采购清单。
              </p>
              <Link href="/brands" className="brand-button-primary mt-8">
                浏览供应商
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              {cartItems.map((item, index) => (
                <Reveal key={item.productId} delay={index * 70}>
                  <div className="brand-card rounded-[2rem] p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white">
                        <Package className="h-8 w-8" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-semibold text-gray-950">{item.product.name}</h3>
                        <Link href={`/brands/${item.brand.id}`} className="mt-2 inline-flex text-sm font-medium text-blue-700">
                          {item.brand.name}
                        </Link>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>单价 ${item.product.price}</span>
                          <span>MOQ {item.product.minOrderQuantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 md:flex-col md:items-end">
                        <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-4 py-3 text-gray-500 transition-colors hover:text-gray-900"
                          >
                            -
                          </button>
                          <span className="min-w-[60px] px-3 text-center font-semibold text-gray-950">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-4 py-3 text-gray-500 transition-colors hover:text-gray-900"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold text-gray-950">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="mt-2 text-sm font-semibold text-red-600 hover:text-red-500"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="brand-card rounded-[2rem] p-7 xl:sticky xl:top-28 xl:h-fit">
                <p className="brand-eyebrow mb-5">Order Summary</p>
                <h2 className="text-3xl font-semibold text-gray-950 mb-6">订单摘要</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>小计</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>运费</span>
                    <span className="font-semibold text-gray-900">
                      {shipping === 0 ? '免费' : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 ? (
                    <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                      再消费 ${(250 - subtotal).toFixed(2)} 即可享受免运费
                    </div>
                  ) : null}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold text-gray-950">
                      <span>总计</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3">
                  <Link href="/checkout" className="brand-button-primary w-full">
                    去结算 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href={`/request-quote?source=cart&items=${encodeURIComponent(inquiryItems)}`}
                    className="brand-button-secondary w-full"
                  >
                    整单申请报价
                  </Link>
                </div>

                <div className="mt-8 grid gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
                    <Truck className="mb-3 h-4 w-4 text-blue-600" />
                    支持全球物流与订单追踪
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
                    <ShieldCheck className="mb-3 h-4 w-4 text-blue-600" />
                    支持 Net 60 与采购保障
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
