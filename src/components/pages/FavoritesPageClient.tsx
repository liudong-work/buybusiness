'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Heart, Package, Scale, Trash2 } from 'lucide-react';
import { toggleBrandCompare, toggleProductCompare } from '@/lib/compare';
import { getBrandById, getProductById } from '@/lib/mockData';
import { loadStoredFavorites, subscribeFavoriteUpdates, toggleBrandFavorite, toggleProductFavorite } from '@/lib/favorites';
import { type Brand, type FavoriteState, type Product } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type FavoriteTab = 'products' | 'brands';

export default function FavoritesPageClient() {
  const [favorites, setFavorites] = useState<FavoriteState>({ productIds: [], brandIds: [] });
  const [activeTab, setActiveTab] = useState<FavoriteTab>('products');

  useEffect(() => {
    const syncFavorites = () => setFavorites(loadStoredFavorites());
    syncFavorites();
    return subscribeFavoriteUpdates(syncFavorites);
  }, []);

  const favoriteProducts = useMemo(
    () =>
      favorites.productIds
        .map((productId) => getProductById(productId))
        .filter((product): product is Product => product !== undefined),
    [favorites.productIds]
  );

  const favoriteBrands = useMemo(
    () =>
      favorites.brandIds
        .map((brandId) => getBrandById(brandId))
        .filter((brand): brand is Brand => brand !== undefined),
    [favorites.brandIds]
  );

  const productCount = favoriteProducts.length;
  const brandCount = favoriteBrands.length;

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/account" />

      <PageHero
        eyebrow="Saved Items"
        title="把感兴趣的商品和品牌沉淀成可回访的收藏夹"
        description="收藏能力一旦补上，用户就不需要每次重新搜索和判断，更接近持续采购型平台的使用方式。"
        stats={[
          { label: '收藏商品', value: `${productCount}` },
          { label: '收藏品牌', value: `${brandCount}` },
          { label: '收藏总数', value: `${productCount + brandCount}` },
          { label: '返回入口', value: 'Buyer Workspace' },
        ]}
        actions={
          <>
            <Link href="/account" className="brand-button-primary">
              返回工作台
            </Link>
            <Link href="/brands" className="brand-button-secondary">
              继续浏览供应商
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <Reveal>
          <div className="brand-card rounded-[2rem] p-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'products', label: `商品 (${productCount})` },
                { key: 'brands', label: `品牌 (${brandCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as FavoriteTab)}
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

        <div className="mt-8 space-y-5">
          {activeTab === 'products' ? (
            favoriteProducts.length > 0 ? (
              favoriteProducts.map((product, index) => {
                const brand = getBrandById(product.brandId);
                if (!brand) return null;

                return (
                  <Reveal key={product.id} delay={index * 60}>
                    <div className="brand-card rounded-[2rem] p-6">
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="brand-icon-badge h-12 w-12 text-white">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-950">{product.name}</h2>
                            <p className="mt-2 text-sm text-gray-500">{brand.name}</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>MOQ {product.minOrderQuantity}</span>
                              <span>${product.price}</span>
                              <span>{product.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Link href={`/products/${product.id}`} className="brand-button-primary text-sm">
                            查看商品
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleProductCompare(product.id)}
                            className="brand-button-secondary text-sm"
                          >
                            <Scale className="mr-2 h-4 w-4" />
                            加入对比
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProductFavorite(product.id)}
                            className="brand-button-secondary text-sm"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            取消收藏
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })
            ) : (
              <Reveal>
                <div className="brand-card rounded-[2rem] p-12 text-center">
                  <Heart className="mx-auto mb-5 h-8 w-8 text-orange-600" />
                  <h2 className="text-3xl font-semibold text-gray-950">还没有收藏商品</h2>
                  <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                    现在商品页右上角的心形按钮已经是真正的收藏入口，收藏后会沉淀到这里，方便回访继续下单或发询盘。
                  </p>
                </div>
              </Reveal>
            )
          ) : favoriteBrands.length > 0 ? (
            favoriteBrands.map((brand, index) => (
              <Reveal key={brand.id} delay={index * 60}>
                <div className="brand-card rounded-[2rem] p-6">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="brand-icon-badge h-12 w-12 text-white">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-950">{brand.name}</h2>
                        <p className="mt-2 text-sm text-gray-500">{brand.location}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                          <span>{brand.category}</span>
                          <span>{brand.productCount} Products</span>
                          <span>{brand.rating} Rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Link href={`/brands/${brand.id}`} className="brand-button-primary text-sm">
                        查看品牌
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleBrandCompare(brand.id)}
                        className="brand-button-secondary text-sm"
                      >
                        <Scale className="mr-2 h-4 w-4" />
                        加入对比
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBrandFavorite(brand.id)}
                        className="brand-button-secondary text-sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        取消收藏
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))
          ) : (
            <Reveal>
              <div className="brand-card rounded-[2rem] p-12 text-center">
                <Heart className="mx-auto mb-5 h-8 w-8 text-orange-600" />
                <h2 className="text-3xl font-semibold text-gray-950">还没有收藏品牌</h2>
                <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                  现在品牌页已经支持收藏动作。把想继续观察的供应商先放进收藏夹，再回头做对比会更顺手。
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
