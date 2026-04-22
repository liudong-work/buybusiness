'use client';

import Link from 'next/link';
import { ArrowRight, BadgeCheck, Building2, MapPin, Package, Star, Tags } from 'lucide-react';
import { getBrandById, getProductsByBrandId } from '@/lib/mockData';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

interface BrandPageProps {
  params: {
    id: string;
  };
}

export default function BrandDetailPage({ params }: BrandPageProps) {
  const brand = getBrandById(params.id);
  const brandProducts = getProductsByBrandId(params.id);

  if (!brand) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/brands" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-950">供应商未找到</h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-7">
              当前供应商可能已下线，或者这个链接还没有映射到真实数据。可以先返回目录页继续浏览其他品牌。
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/brands" className="brand-button-primary">
                返回供应商列表
              </Link>
              <Link href="/" className="brand-button-secondary">
                返回首页
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
      <SiteNav activePath="/brands" />

      <PageHero
        eyebrow="Supplier Profile"
        title={brand.name}
        description={`${brand.description} 通过更干净的供应商详情布局，把品牌价值、主营类目和商品入口整合到同一层级里。`}
        stats={[
          { label: '品牌评分', value: brand.rating.toFixed(1) },
          { label: '展示商品', value: `${brandProducts.length}` },
          { label: '品类', value: brand.category },
          { label: '地区', value: brand.location.split(',')[0] ?? brand.location },
        ]}
        actions={
          <>
            <Link href="/contact" className="brand-button-primary">
              联系平台顾问
            </Link>
            <Link href={`/brands?category=${encodeURIComponent(brand.category)}`} className="brand-button-secondary">
              查看同类供应商
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                <BadgeCheck className="h-4 w-4" />
                Verified Supplier
              </div>
              <div className="space-y-4 text-gray-600 leading-7">
                <p>
                  在这里可以快速看到供应商的主营品类、地区、评分和代表商品，方便先完成品牌层面的判断。
                </p>
                <p>
                  对采购商来说，最重要的是快速知道这家供应商做什么、靠不靠谱、有什么商品，以及是否值得继续联系。
                </p>
              </div>

              <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {brand.location}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Tags className="h-4 w-4 text-blue-600" />
                  主营品类：{brand.category}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                  平均评分：{brand.rating}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {brand.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="brand-eyebrow mb-4">Live Catalog</p>
                  <h2 className="text-3xl font-semibold text-gray-950">在售商品</h2>
                </div>
                <Link href="/cart" className="text-sm font-semibold text-blue-700">
                  查看采购清单 →
                </Link>
              </div>

              {brandProducts.length > 0 ? (
                <div className="space-y-4">
                  {brandProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group flex flex-col gap-5 rounded-[1.6rem] border border-gray-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(15,23,42,0.06)] md:flex-row md:items-center"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white">
                        <Package className="h-8 w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h3 className="text-lg font-semibold text-gray-950 transition-colors group-hover:text-blue-700">
                            {product.name}
                          </h3>
                          <span className="text-sm font-semibold text-blue-700">MOQ {product.minOrderQuantity}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-600">{product.description}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-gray-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:block md:text-right">
                        <div className="text-xl font-semibold text-gray-950">${product.price}</div>
                        <div className="mt-1 text-sm text-gray-500">查看商品详情</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-gray-200 bg-white p-10 text-center">
                  <p className="text-lg font-semibold text-gray-950">该供应商暂未展示商品</p>
                  <p className="mt-3 text-gray-600">后续接入真实数据后，这里可以继续扩展成完整的品牌商品目录页。</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="brand-section pb-4">
        <Reveal>
          <div className="rounded-[2rem] bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] p-8 text-white lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80 mb-4">Next Step</p>
                <h2 className="text-3xl font-semibold">如果这家供应商风格匹配，可以继续进入商品页查看起订和价格。</h2>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                {brandProducts[0] ? (
                  <Link href={`/products/${brandProducts[0].id}`} className="brand-button-primary">
                    查看代表商品 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                ) : null}
                <Link href="/brands" className="brand-button-secondary bg-white/10 text-white border-white/12 hover:bg-white/15">
                  返回供应商列表
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
