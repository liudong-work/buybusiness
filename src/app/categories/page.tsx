'use client';

import Link from 'next/link';
import { ArrowRight, Boxes, Compass, Gem, Leaf, PackageSearch, Sparkles } from 'lucide-react';
import { mockBrands, mockCategories } from '@/lib/mockData';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

const discoveryModes = [
  { name: '新品目录', description: '优先探索最近上新的商品和品牌', icon: Sparkles },
  { name: '热门爆款', description: '快速定位高关注度的采购方向', icon: Compass },
  { name: '可持续品类', description: '聚焦环保和长期价值标签', icon: Leaf },
  { name: '高客单商品', description: '适合陈列和精品零售策略', icon: Gem },
];

export default function CategoriesPage() {
  const categoryStats = mockCategories.map((category) => ({
    ...category,
    brandCount: mockBrands.filter((brand) => brand.category === category.name).length,
  }));

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/categories" />

      <PageHero
        eyebrow="Category Explorer"
        title="按类目浏览市场方向，快速找到适合自己的供应链入口"
        description="先从类目理解市场，再进入供应商和商品详情，会更适合批发采购场景里的浏览与比较。"
        stats={[
          { label: '当前类目', value: `${mockCategories.length}` },
          { label: '已接入品牌', value: `${mockBrands.length}` },
          { label: '覆盖商品数', value: '87K+' },
          { label: '适合采购场景', value: 'B2B' },
        ]}
      />

      <section className="brand-section py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {categoryStats.map((category, index) => (
            <Reveal key={category.id} delay={index * 70}>
              <Link href={`/brands?category=${encodeURIComponent(category.name)}`} className="brand-card group block rounded-[2rem] p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)]">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div className="rounded-full bg-[#f8f5f0] px-3 py-1 text-xs font-semibold text-gray-600">
                    {category.productCount} 商品
                  </div>
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-gray-950 transition-colors group-hover:text-blue-700">
                  {category.name}
                </h2>

                <p className="mt-3 text-gray-600 leading-7">
                  适合从该类目切入，继续查看相关供应商、品牌定位和商品陈列方向。
                </p>

                <div className="mt-5 flex items-center gap-5 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-blue-600" />
                    {category.brandCount} 品牌
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <PackageSearch className="h-4 w-4 text-blue-600" />
                    {category.productCount} 商品
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                  <span className="text-sm font-semibold text-blue-700">查看该类目供应商</span>
                  <ArrowRight className="h-4 w-4 text-blue-700 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="brand-section pb-4">
        <Reveal>
          <div className="brand-card rounded-[2rem] p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="brand-eyebrow mb-4">Discovery Modes</p>
                <h2 className="text-3xl font-semibold text-gray-950">除了按类目，还可以这样开始采购探索</h2>
              </div>
              <Link href="/brands" className="text-sm font-semibold text-blue-700">
                返回全部供应商 →
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {discoveryModes.map((mode) => {
                const Icon = mode.icon;

                return (
                  <div key={mode.name} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                    <Icon className="mb-5 h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-950">{mode.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{mode.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
