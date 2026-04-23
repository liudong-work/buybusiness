'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Search, SlidersHorizontal, Sparkles, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { mockBrands, valueTags } from '@/lib/mockData';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

export default function BrandsPageClient() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') ?? '');
  }, [searchParams]);

  const categories = Array.from(new Set(mockBrands.map((brand) => brand.category)));

  const filteredBrands = mockBrands.filter((brand) => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || brand.category === selectedCategory;
    const matchesValues =
      selectedValues.length === 0 || selectedValues.some((value) => brand.values.includes(value));

    return matchesSearch && matchesCategory && matchesValues;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedValues([]);
  };

  const toggleValue = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/brands" />

      <PageHero
        eyebrow="Supplier Directory"
        title="浏览供应商目录，按品类与价值标签快速筛选"
        description="从供应商名称、主营品类、价值标签和品牌简介出发，更快找到适合自己店铺方向的合作伙伴。"
        stats={[
          { label: '当前展示供应商', value: `${mockBrands.length}` },
          { label: '价值标签', value: `${valueTags.length}` },
          { label: '可筛选品类', value: `${categories.length}` },
          { label: '精选推荐', value: `${mockBrands.filter((brand) => brand.isFeatured).length}` },
        ]}
      />

      <section className="brand-section py-10">
        <Reveal>
          <div className="brand-card rounded-[2rem] p-6 lg:p-8">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                  <Search className="h-3.5 w-3.5" />
                  Find Suppliers
                </p>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索供应商名称、简介或关键词"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-14 py-4 text-base text-gray-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Category
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-gray-900 outline-none"
                  >
                    <option value="">全部分类</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={clearFilters}
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-blue-200 hover:text-blue-700"
                >
                  清空条件
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {valueTags.map((value) => (
                <button
                  key={value}
                  onClick={() => toggleValue(value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedValues.includes(value)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)]'
                      : 'bg-[#eef4ff] text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
              <p className="text-sm text-gray-500">
                当前找到 <span className="font-semibold text-gray-900">{filteredBrands.length}</span> 家供应商
              </p>
              <p className="inline-flex items-center gap-2 text-sm text-blue-700">
                <Sparkles className="h-4 w-4" />
                继续深入品牌详情与商品目录
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="brand-section pb-6">
        {filteredBrands.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredBrands.map((brand, index) => (
              <Reveal key={brand.id} delay={index * 80}>
                <Link href={`/brands/${brand.id}`} className="brand-card group block overflow-hidden rounded-[2rem]">
                  <div className="relative border-b border-gray-100 bg-[linear-gradient(135deg,_#eff6ff_0%,_#fff_55%,_#f9fafb_100%)] p-7">
                    <div className="absolute right-6 top-6 rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">
                      精选供应商
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-[0_12px_24px_rgba(37,99,235,0.2)]">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-gray-950 transition-colors group-hover:text-blue-700">
                          {brand.name}
                        </h3>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {brand.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-7">
                    <p className="leading-7 text-gray-600">{brand.description}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {brand.values.map((value) => (
                        <span
                          key={value}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {value}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                        <span className="font-semibold text-gray-900">{brand.rating}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{brand.productCount} 产品</div>
                        <div className="text-sm text-blue-700 transition-transform group-hover:translate-x-1">
                          查看详情 →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="brand-card rounded-[2rem] p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Search className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-semibold text-gray-950">没有找到符合条件的供应商</h2>
              <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                可以先清空筛选条件，再从品类或价值标签重新开始浏览。
              </p>
              <button onClick={clearFilters} className="brand-button-primary mt-8">
                清空筛选
              </button>
            </div>
          </Reveal>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
