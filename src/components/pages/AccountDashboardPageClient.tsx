'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ClipboardList,
  Heart,
  Scale,
  PackageSearch,
  ScanSearch,
  ShoppingBag,
  Star,
} from 'lucide-react';
import { getCartDisplayItems, subscribeCartUpdates } from '@/lib/cart';
import { loadStoredCompare, subscribeCompareUpdates } from '@/lib/compare';
import { loadStoredFavorites, subscribeFavoriteUpdates } from '@/lib/favorites';
import { getBrandById, getProductById } from '@/lib/mockData';
import { loadStoredInquiries, subscribeInquiryUpdates } from '@/lib/inquiries';
import { getOrderStatusMeta, loadStoredOrders, subscribeOrderUpdates } from '@/lib/orders';
import { loadStoredRecentViews, subscribeRecentViewUpdates } from '@/lib/recentViews';
import { type CompareState, type FavoriteState, type Inquiry, type Order, type RecentView } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

export default function AccountDashboardPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [favorites, setFavorites] = useState<FavoriteState>({ productIds: [], brandIds: [] });
  const [compareState, setCompareState] = useState<CompareState>({ productIds: [], brandIds: [] });
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const syncOrders = () => setOrders(loadStoredOrders());
    const syncInquiries = () => setInquiries(loadStoredInquiries());
    const syncFavorites = () => setFavorites(loadStoredFavorites());
    const syncCompare = () => setCompareState(loadStoredCompare());
    const syncRecentViews = () => setRecentViews(loadStoredRecentViews());
    const syncCart = () => setCartItemCount(getCartDisplayItems().length);

    syncOrders();
    syncInquiries();
    syncFavorites();
    syncCompare();
    syncRecentViews();
    syncCart();

    const unsubscribeOrders = subscribeOrderUpdates(syncOrders);
    const unsubscribeInquiries = subscribeInquiryUpdates(syncInquiries);
    const unsubscribeFavorites = subscribeFavoriteUpdates(syncFavorites);
    const unsubscribeCompare = subscribeCompareUpdates(syncCompare);
    const unsubscribeRecentViews = subscribeRecentViewUpdates(syncRecentViews);
    const unsubscribeCart = subscribeCartUpdates(syncCart);

    return () => {
      unsubscribeOrders();
      unsubscribeInquiries();
      unsubscribeFavorites();
      unsubscribeCompare();
      unsubscribeRecentViews();
      unsubscribeCart();
    };
  }, []);

  const latestOrder = orders[0];
  const latestInquiry = inquiries[0];
  const totalFavoriteCount = favorites.productIds.length + favorites.brandIds.length;
  const totalCompareCount = compareState.productIds.length + compareState.brandIds.length;
  const processingOrderCount = useMemo(
    () => orders.filter((order) => order.status !== 'completed').length,
    [orders]
  );
  const recentViewCards = useMemo(
    () =>
      recentViews
        .map((view) => {
          if (view.entityType === 'product') {
            const product = getProductById(view.entityId);
            const brand = product ? getBrandById(product.brandId) : undefined;
            if (!product || !brand) return null;
            return {
              key: `product-${product.id}`,
              title: product.name,
              subtitle: brand.name,
              href: `/products/${product.id}`,
              tag: '商品',
            };
          }

          const brand = getBrandById(view.entityId);
          if (!brand) return null;
          return {
            key: `brand-${brand.id}`,
            title: brand.name,
            subtitle: brand.category,
            href: `/brands/${brand.id}`,
            tag: '品牌',
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .slice(0, 4),
    [recentViews]
  );

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/account" />

      <PageHero
        eyebrow="Buyer Workspace"
        title="把订单、询盘、收藏和采购动作收进同一个买家工作台"
        description="这一步让用户提交过的动作不再散落在各个页面里，而是形成一个能回访、能继续推进的前端工作流入口。"
        stats={[
          { label: '订单总数', value: `${orders.length}` },
          { label: '进行中订单', value: `${processingOrderCount}` },
          { label: '询盘总数', value: `${inquiries.length}` },
          { label: '收藏 / 对比', value: `${totalFavoriteCount}/${totalCompareCount}` },
        ]}
        actions={
          <>
            <Link href="/orders" className="brand-button-primary">
              查看我的订单
            </Link>
            <Link href="/recently-viewed" className="brand-button-secondary">
              查看最近浏览
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: '我的订单',
              value: `${orders.length}`,
              description: '继续回看已提交订单和状态流转',
              href: '/orders',
              icon: ShoppingBag,
            },
            {
              title: '我的询盘',
              value: `${inquiries.length}`,
              description: '查看已发起的采购意向和跟进情况',
              href: '/inquiries',
              icon: ClipboardList,
            },
            {
              title: '我的收藏',
              value: `${totalFavoriteCount}`,
              description: '回到已保存的商品和品牌继续判断',
              href: '/favorites',
              icon: Heart,
            },
            {
              title: '最近浏览',
              value: `${recentViews.length}`,
              description: '回看最近访问过的商品和品牌',
              href: '/recently-viewed',
              icon: ScanSearch,
            },
            {
              title: '商品/品牌对比',
              value: `${totalCompareCount}`,
              description: '把待比较对象收进同一个对比面板',
              href: '/compare',
              icon: Scale,
            },
            {
              title: '购物车',
              value: `${cartItemCount}`,
              description: '继续整理当前待结算的采购清单',
              href: '/cart',
              icon: PackageSearch,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 60}>
                <Link href={item.href} className="brand-card block rounded-[2rem] p-6 transition-all hover:-translate-y-1">
                  <Icon className="mb-4 h-6 w-6 text-orange-600" />
                  <div className="text-3xl font-semibold text-gray-950">{item.value}</div>
                  <h2 className="mt-3 text-lg font-semibold text-gray-950">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="brand-section pb-4">
        <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="brand-eyebrow mb-4">Recent Order</p>
                  <h2 className="text-3xl font-semibold text-gray-950">最近订单</h2>
                </div>
                <Link href="/orders" className="text-sm font-semibold text-orange-700">
                  查看全部 →
                </Link>
              </div>

              {latestOrder ? (
                <div className="rounded-[1.8rem] border border-gray-100 bg-white p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-950">{latestOrder.id}</h3>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getOrderStatusMeta(latestOrder.status).className}`}
                    >
                      {getOrderStatusMeta(latestOrder.status).label}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-500">订单金额</p>
                      <p className="mt-2 font-semibold text-gray-950">${latestOrder.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">商品条目</p>
                      <p className="mt-2 font-semibold text-gray-950">{latestOrder.items.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">下单时间</p>
                      <p className="mt-2 font-semibold text-gray-950">
                        {new Date(latestOrder.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-gray-600">
                    {getOrderStatusMeta(latestOrder.status).description}
                  </p>
                  <Link href={`/orders/${latestOrder.id}`} className="brand-button-primary mt-6 text-sm">
                    查看订单详情 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-gray-200 bg-white p-10 text-center">
                  <ShoppingBag className="mx-auto mb-4 h-7 w-7 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-950">还没有订单记录</h3>
                  <p className="mx-auto mt-3 max-w-xl text-gray-600 leading-7">
                    先从商品页加入购物车并完成结算，工作台这里就会开始沉淀你的订单历史。
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={80}>
              <div className="brand-card rounded-[2rem] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="brand-eyebrow mb-4">Recent Inquiry</p>
                    <h2 className="text-3xl font-semibold text-gray-950">最近询盘</h2>
                  </div>
                  <Link href="/inquiries" className="text-sm font-semibold text-orange-700">
                    查看全部 →
                  </Link>
                </div>

                {latestInquiry ? (
                  <div className="rounded-[1.8rem] border border-gray-100 bg-white p-6">
                    <p className="text-lg font-semibold text-gray-950">{latestInquiry.company}</p>
                    <p className="mt-2 text-sm text-gray-500">{latestInquiry.id}</p>
                    <p className="mt-5 text-sm leading-7 text-gray-600">{latestInquiry.message}</p>
                    <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>目的市场 {latestInquiry.destinationCountry}</span>
                      <span>{latestInquiry.needSample ? '需要样品' : '暂不需要样品'}</span>
                    </div>
                    <Link href={`/inquiries/${latestInquiry.id}`} className="brand-button-secondary mt-6 text-sm">
                      查看询盘详情
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-[1.8rem] border border-dashed border-gray-200 bg-white p-8 text-center">
                    <ClipboardList className="mx-auto mb-4 h-7 w-7 text-orange-600" />
                    <p className="text-lg font-semibold text-gray-950">还没有询盘记录</p>
                    <Link href="/request-quote" className="brand-button-primary mt-6 text-sm">
                      发起第一条询盘
                    </Link>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-8 text-white">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Workspace Value</p>
                <div className="grid gap-4">
                  {[
                    '把已提交订单沉淀成可回访的订单历史',
                    '把询盘、收藏和购物车收回统一入口',
                    '更接近 Faire 那种持续采购而不是一次性浏览的体验',
                  ].map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                      <Star className="mb-3 h-4 w-4 text-orange-300" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="brand-eyebrow mb-4">Recent Views</p>
                  <h2 className="text-3xl font-semibold text-gray-950">最近浏览</h2>
                </div>
                <Link href="/recently-viewed" className="text-sm font-semibold text-orange-700">
                  查看全部 →
                </Link>
              </div>

              {recentViewCards.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {recentViewCards.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="rounded-[1.6rem] border border-gray-100 bg-white p-5 transition-all hover:-translate-y-1"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">{item.tag}</p>
                      <p className="mt-4 text-lg font-semibold text-gray-950">{item.title}</p>
                      <p className="mt-2 text-sm text-gray-500">{item.subtitle}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-gray-200 bg-white p-8 text-center">
                  <ScanSearch className="mx-auto mb-4 h-7 w-7 text-orange-600" />
                  <p className="text-lg font-semibold text-gray-950">还没有最近浏览记录</p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="brand-eyebrow mb-4">Compare Panel</p>
                  <h2 className="text-3xl font-semibold text-gray-950">对比清单</h2>
                </div>
                <Link href="/compare" className="text-sm font-semibold text-orange-700">
                  打开对比 →
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5">
                  <p className="text-sm text-gray-500">待对比商品</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-950">{compareState.productIds.length}</p>
                </div>
                <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5">
                  <p className="text-sm text-gray-500">待对比品牌</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-950">{compareState.brandIds.length}</p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-gray-600">
                现在可以从商品页和品牌页把对象加入对比，再统一回到对比页看价格、MOQ、评分、地区和价值标签差异。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
