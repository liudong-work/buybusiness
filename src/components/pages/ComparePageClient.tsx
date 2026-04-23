'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Package, Scale, Trash2 } from 'lucide-react';
import { loadStoredCompare, subscribeCompareUpdates, toggleBrandCompare, toggleProductCompare } from '@/lib/compare';
import { getBrandById, getProductById } from '@/lib/mockData';
import { type Brand, type CompareState, type Product } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type CompareTab = 'products' | 'brands';

export default function ComparePageClient() {
  const [compareState, setCompareState] = useState<CompareState>({ productIds: [], brandIds: [] });
  const [activeTab, setActiveTab] = useState<CompareTab>('products');

  useEffect(() => {
    const syncCompare = () => setCompareState(loadStoredCompare());
    syncCompare();
    return subscribeCompareUpdates(syncCompare);
  }, []);

  const comparedProducts = useMemo(
    () =>
      compareState.productIds
        .map((productId) => getProductById(productId))
        .filter((product): product is Product => product !== undefined),
    [compareState.productIds]
  );

  const comparedBrands = useMemo(
    () =>
      compareState.brandIds
        .map((brandId) => getBrandById(brandId))
        .filter((brand): brand is Brand => brand !== undefined),
    [compareState.brandIds]
  );

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/account" />

      <PageHero
        eyebrow="Compare"
        title="把商品和品牌放到一个对比面板里集中判断"
        description="这一步更贴近真实 B2B 采购场景：不是单看一个对象，而是把 MOQ、价格、评分、地区和价值标签放到一起比较。"
        stats={[
          { label: '待比商品', value: `${comparedProducts.length}` },
          { label: '待比品牌', value: `${comparedBrands.length}` },
          { label: '上限', value: '4 / 4' },
          { label: '回访入口', value: 'Workspace' },
        ]}
        actions={
          <>
            <Link href="/account" className="brand-button-primary">
              返回工作台
            </Link>
            <Link href="/recently-viewed" className="brand-button-secondary">
              从最近浏览继续加
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <Reveal>
          <div className="brand-card rounded-[2rem] p-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'products', label: `商品 (${comparedProducts.length})` },
                { key: 'brands', label: `品牌 (${comparedBrands.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as CompareTab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-[0_12px_24px_rgba(194,65,12,0.2)]'
                      : 'bg-[#fff7ed] text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-8">
          {activeTab === 'products' ? (
            comparedProducts.length > 0 ? (
              <div className="grid gap-5 xl:grid-cols-2">
                {comparedProducts.map((product, index) => {
                  const brand = getBrandById(product.brandId);
                  if (!brand) return null;

                  return (
                    <Reveal key={product.id} delay={index * 60}>
                      <div className="brand-card rounded-[2rem] p-6">
                        <div className="mb-6 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="brand-icon-badge h-12 w-12 text-white">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-gray-950">{product.name}</h2>
                              <p className="mt-2 text-sm text-gray-500">{brand.name}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleProductCompare(product.id)}
                            className="rounded-full border border-gray-200 p-2 text-gray-500 hover:text-orange-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-500">单价</p>
                            <p className="mt-2 font-semibold text-gray-950">${product.price}</p>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-500">MOQ</p>
                            <p className="mt-2 font-semibold text-gray-950">{product.minOrderQuantity}</p>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-500">评分</p>
                            <p className="mt-2 font-semibold text-gray-950">{product.rating}</p>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <p className="text-sm text-gray-500">库存状态</p>
                            <p className="mt-2 font-semibold text-gray-950">{product.inStock ? 'In Stock' : 'Out of Stock'}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <span key={`${product.id}-${tag}`} className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-medium text-orange-700">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                          <Link href={`/products/${product.id}`} className="brand-button-primary text-sm">
                            查看商品
                          </Link>
                          <Link
                            href={`/request-quote?source=product&brandId=${brand.id}&productId=${product.id}&quantity=${product.minOrderQuantity}`}
                            className="brand-button-secondary text-sm"
                          >
                            发起询盘
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <Reveal>
                <div className="brand-card rounded-[2rem] p-12 text-center">
                  <Scale className="mx-auto mb-5 h-8 w-8 text-orange-600" />
                  <h2 className="text-3xl font-semibold text-gray-950">还没有待对比商品</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                    从商品页、收藏页或最近浏览里把商品加入对比，再回来统一比较价格和 MOQ。
                  </p>
                </div>
              </Reveal>
            )
          ) : comparedBrands.length > 0 ? (
            <div className="grid gap-5 xl:grid-cols-2">
              {comparedBrands.map((brand, index) => (
                <Reveal key={brand.id} delay={index * 60}>
                  <div className="brand-card rounded-[2rem] p-6">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="brand-icon-badge h-12 w-12 text-white">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-950">{brand.name}</h2>
                          <p className="mt-2 text-sm text-gray-500">{brand.location}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBrandCompare(brand.id)}
                        className="rounded-full border border-gray-200 p-2 text-gray-500 hover:text-orange-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-sm text-gray-500">主营品类</p>
                        <p className="mt-2 font-semibold text-gray-950">{brand.category}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-sm text-gray-500">品牌评分</p>
                        <p className="mt-2 font-semibold text-gray-950">{brand.rating}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-sm text-gray-500">商品数量</p>
                        <p className="mt-2 font-semibold text-gray-950">{brand.productCount}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-sm text-gray-500">所在地</p>
                        <p className="mt-2 font-semibold text-gray-950">{brand.location}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {brand.values.map((value) => (
                        <span key={`${brand.id}-${value}`} className="rounded-full bg-[#fff7ed] px-3 py-1 text-xs font-medium text-orange-700">
                          {value}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link href={`/brands/${brand.id}`} className="brand-button-primary text-sm">
                        查看品牌
                      </Link>
                      <Link href={`/request-quote?source=brand&brandId=${brand.id}`} className="brand-button-secondary text-sm">
                        发起询盘
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="brand-card rounded-[2rem] p-12 text-center">
                <Scale className="mx-auto mb-5 h-8 w-8 text-orange-600" />
                <h2 className="text-3xl font-semibold text-gray-950">还没有待对比品牌</h2>
                <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                  从品牌页、收藏页或最近浏览里把品牌加入对比，再回来统一比较地区、评分和标签。
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
