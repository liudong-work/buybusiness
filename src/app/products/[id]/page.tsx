'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeDollarSign, Heart, Package, ShieldCheck, Star, Truck } from 'lucide-react';
import { getBrandById, getProductById } from '@/lib/mockData';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);
  const brand = product ? getBrandById(product.brandId) : null;
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(product?.minOrderQuantity ?? 1);

  const savingsHint = useMemo(() => {
    if (!product) return '';
    return quantity >= product.minOrderQuantity * 3 ? '已达到批量采购建议区间' : '增加采购数量可进一步争取优惠报价';
  }, [product, quantity]);

  if (!product || !brand) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/brands" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <h1 className="text-3xl font-semibold text-gray-950">商品未找到</h1>
            <p className="mt-4 text-gray-600">当前链接没有命中有效商品，你可以先回到供应商目录或品牌详情继续浏览。</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/brands" className="brand-button-primary">浏览供应商</Link>
              <Link href="/" className="brand-button-secondary">返回首页</Link>
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

      <section className="border-b border-blue-100 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_20%),linear-gradient(180deg,_#f8fbff_0%,_#fff_100%)] pt-28 pb-10">
        <div className="brand-section">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-700">首页</Link>
            <span>/</span>
            <Link href="/brands" className="hover:text-blue-700">供应商</Link>
            <span>/</span>
            <Link href={`/brands/${brand.id}`} className="hover:text-blue-700">{brand.name}</Link>
            <span>/</span>
            <span className="font-semibold text-gray-900">{product.name}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <Reveal>
              <div className="brand-card rounded-[2rem] p-8">
                <div className="relative flex min-h-[360px] items-center justify-center rounded-[1.6rem] bg-[linear-gradient(135deg,_#eff6ff_0%,_#fff_55%,_#f8fafc_100%)]">
                  <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700">
                    MOQ {product.minOrderQuantity}
                  </div>
                  <button
                    onClick={() => setIsFavorite((prev) => !prev)}
                    className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/88 text-gray-600 transition-colors hover:text-blue-700"
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-blue-500 text-blue-500' : ''}`} />
                  </button>
                  <Package className="h-24 w-24 text-blue-600" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="brand-card rounded-[2rem] p-8">
                <p className="brand-eyebrow mb-5">Product Detail</p>
                <Link href={`/brands/${brand.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                  {brand.name} <span className="text-gray-400">·</span> {brand.location}
                </Link>
                <h1 className="mt-4 text-4xl font-semibold leading-tight text-gray-950">{product.name}</h1>
                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Star className="h-4 w-4 fill-blue-400 text-blue-400" />
                    <span className="font-semibold text-gray-900">{product.rating}</span>
                    <span>({product.reviewCount} 条评价)</span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    {product.inStock ? '当前有货' : '暂时缺货'}
                  </span>
                </div>

                <div className="mt-7 rounded-[1.5rem] bg-[#eff6ff] p-6">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="text-4xl font-semibold text-gray-950">${product.price}</div>
                    <div className="pb-1 text-sm text-gray-500">/ 件</div>
                  </div>
                  <p className="mt-3 text-sm text-blue-700">{savingsHint}</p>
                </div>

                <p className="mt-6 text-gray-600 leading-8">{product.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[#f8f5f0] px-3 py-1 text-xs font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-[auto_1fr] md:items-center">
                  <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-white">
                    <button
                      onClick={() => setQuantity((value) => Math.max(product.minOrderQuantity, value - 1))}
                      className="px-4 py-3 text-gray-500 transition-colors hover:text-gray-900"
                    >
                      -
                    </button>
                    <span className="min-w-[70px] px-3 text-center font-semibold text-gray-950">{quantity}</span>
                    <button
                      onClick={() => setQuantity((value) => value + 1)}
                      className="px-4 py-3 text-gray-500 transition-colors hover:text-gray-900"
                    >
                      +
                    </button>
                  </div>
                  <button className="brand-button-primary w-full" disabled={!product.inStock}>
                    {product.inStock ? '加入购物车' : '暂时缺货'}
                  </button>
                </div>

                <div className="mt-8 grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <Truck className="mb-3 h-4 w-4 text-blue-600" />
                    满 $250 免运费
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <BadgeDollarSign className="mb-3 h-4 w-4 text-blue-600" />
                    支持 Net 60
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <ShieldCheck className="mb-3 h-4 w-4 text-blue-600" />
                    60 天退货
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="brand-section py-10">
        <Reveal>
          <div className="rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#14213d] to-[#1e3a8a] p-8 text-white lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80 mb-4">About The Supplier</p>
                <h2 className="text-3xl font-semibold mb-4">继续回到供应商详情，看更完整的品牌信息和其他在售商品。</h2>
                <p className="text-white/65 leading-7">
                  商品页更适合完成单品判断，品牌页则适合继续了解供应商背景和其他在售商品。
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link href={`/brands/${brand.id}`} className="brand-button-primary">
                  查看供应商详情
                </Link>
                <Link href="/cart" className="brand-button-secondary bg-white/10 text-white border-white/12 hover:bg-white/15">
                  查看购物车
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
