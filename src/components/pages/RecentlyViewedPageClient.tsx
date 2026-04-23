'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Package, ScanSearch, Scale } from 'lucide-react';
import { toggleBrandCompare, toggleProductCompare } from '@/lib/compare';
import { getBrandById, getProductById } from '@/lib/mockData';
import { loadStoredRecentViews, subscribeRecentViewUpdates } from '@/lib/recentViews';
import { type RecentView } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

export default function RecentlyViewedPageClient() {
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);

  useEffect(() => {
    const syncRecentViews = () => setRecentViews(loadStoredRecentViews());
    syncRecentViews();
    return subscribeRecentViewUpdates(syncRecentViews);
  }, []);

  const resolvedViews = useMemo(
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
              meta: [`MOQ ${product.minOrderQuantity}`, `$${product.price}`, product.category],
              href: `/products/${product.id}`,
              tag: '商品',
              icon: Package,
              compareAction: () => toggleProductCompare(product.id),
            };
          }

          const brand = getBrandById(view.entityId);
          if (!brand) return null;

          return {
            key: `brand-${brand.id}`,
            title: brand.name,
            subtitle: brand.location,
            meta: [brand.category, `${brand.productCount} Products`, `${brand.rating} Rating`],
            href: `/brands/${brand.id}`,
            tag: '品牌',
            icon: Building2,
            compareAction: () => toggleBrandCompare(brand.id),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [recentViews]
  );

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/account" />

      <PageHero
        eyebrow="Recently Viewed"
        title="把最近浏览记录沉淀下来，方便继续采购判断"
        description="批发采购很少一次完成决策。最近浏览把你刚刚看过的商品和品牌收回来，减少重复搜索和来回跳转。"
        stats={[
          { label: '最近浏览总数', value: `${resolvedViews.length}` },
          { label: '商品浏览', value: `${resolvedViews.filter((item) => item.tag === '商品').length}` },
          { label: '品牌浏览', value: `${resolvedViews.filter((item) => item.tag === '品牌').length}` },
          { label: '下一步动作', value: 'Compare' },
        ]}
        actions={
          <>
            <Link href="/account" className="brand-button-primary">
              返回工作台
            </Link>
            <Link href="/compare" className="brand-button-secondary">
              打开对比页
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        {resolvedViews.length > 0 ? (
          <div className="space-y-5">
            {resolvedViews.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.key} delay={index * 60}>
                  <div className="brand-card rounded-[2rem] p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="brand-icon-badge h-12 w-12 text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">{item.tag}</p>
                          <h2 className="mt-3 text-xl font-semibold text-gray-950">{item.title}</h2>
                          <p className="mt-2 text-sm text-gray-500">{item.subtitle}</p>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                            {item.meta.map((meta) => (
                              <span key={`${item.key}-${meta}`}>{meta}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link href={item.href} className="brand-button-primary text-sm">
                          继续查看
                        </Link>
                        <button type="button" onClick={item.compareAction} className="brand-button-secondary text-sm">
                          <Scale className="mr-2 h-4 w-4" />
                          加入对比
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal>
            <div className="brand-card rounded-[2rem] p-12 text-center">
              <ScanSearch className="mx-auto mb-5 h-8 w-8 text-orange-600" />
              <h2 className="text-3xl font-semibold text-gray-950">还没有最近浏览记录</h2>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                先去浏览商品和品牌，最近浏览会自动把访问过的内容沉淀到这里。
              </p>
            </div>
          </Reveal>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
