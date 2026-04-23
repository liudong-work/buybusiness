'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  Globe2,
  MessageSquare,
  Package,
  ShieldCheck,
} from 'lucide-react';
import { getBrandById, getProductById, getProductsByBrandId } from '@/lib/mockData';
import {
  buildInquiryLineItem,
  createInquiryId,
  getInquirySourceLabel,
  parseInquiryItemsParam,
  prependStoredInquiry,
} from '@/lib/inquiries';
import { type InquirySource } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

const validSources: InquirySource[] = ['product', 'brand', 'cart', 'general'];

type QuoteFormState = {
  buyerName: string;
  email: string;
  company: string;
  role: string;
  destinationCountry: string;
  targetPrice: string;
  message: string;
  needSample: boolean;
};

type RequestQuotePageClientProps = {
  searchParams: {
    source?: string;
    quantity?: string;
    items?: string;
    brandId?: string;
    productId?: string;
  };
};

const sourceContent: Record<
  InquirySource,
  { title: string; description: string; primaryAction: string }
> = {
  product: {
    title: '围绕目标商品快速发起报价请求',
    description: '把采购数量、目标价格、收货国家和补充说明整理成一条更像真实业务动作的询盘。',
    primaryAction: '提交商品询盘',
  },
  brand: {
    title: '先确认品牌合作意向，再推进具体商品报价',
    description: '适合还在判断供应商匹配度、希望先了解合作方式、价格区间和样品支持的采购场景。',
    primaryAction: '提交品牌询盘',
  },
  cart: {
    title: '把购物车里的采购意向一次性打包给平台顾问',
    description: '适合已经整理出一批目标商品，希望集中获取报价、起订建议和供应商响应方案的场景。',
    primaryAction: '提交整单询盘',
  },
  general: {
    title: '先发起通用询盘，再由顾问协助梳理采购方向',
    description: '当你还没有完全锁定供应商和商品时，也可以先把需求范围、品类和市场方向发过来。',
    primaryAction: '提交询盘',
  },
};

export default function RequestQuotePageClient({ searchParams }: RequestQuotePageClientProps) {
  const router = useRouter();
  const sourceParam = searchParams.source;
  const source = validSources.includes(sourceParam as InquirySource)
    ? (sourceParam as InquirySource)
    : 'general';

  const quantityParam = Number(searchParams.quantity ?? '0');
  const cartItemsParam = searchParams.items;
  const brandParamId = searchParams.brandId;
  const productParamId = searchParams.productId;

  const queriedProduct = productParamId ? getProductById(productParamId) : undefined;
  const resolvedBrandId = queriedProduct?.brandId ?? brandParamId ?? '';
  const brand = resolvedBrandId ? getBrandById(resolvedBrandId) : undefined;
  const brandProducts = brand ? getProductsByBrandId(brand.id) : [];

  const selectedItems = useMemo(() => {
    const cartItems = parseInquiryItemsParam(cartItemsParam);

    if (cartItems.length > 0) {
      return cartItems
        .map((item) => {
          const product = getProductById(item.id);
          if (!product) return null;

          const itemBrand = getBrandById(product.brandId);
          if (!itemBrand) return null;

          return buildInquiryLineItem(product, itemBrand, Math.max(product.minOrderQuantity, item.quantity));
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    if (queriedProduct && brand) {
      const quantity = Number.isFinite(quantityParam) && quantityParam > 0
        ? Math.max(queriedProduct.minOrderQuantity, quantityParam)
        : queriedProduct.minOrderQuantity;

      return [buildInquiryLineItem(queriedProduct, brand, quantity)];
    }

    return [];
  }, [brand, cartItemsParam, queriedProduct, quantityParam]);

  const [formData, setFormData] = useState<QuoteFormState>({
    buyerName: '',
    email: '',
    company: '',
    role: '',
    destinationCountry: '',
    targetPrice: '',
    message: '',
    needSample: false,
  });

  const itemCount = selectedItems.length;
  const totalUnits = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedAmount = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const inquiryId = createInquiryId();
    const createdAt = new Date().toISOString();
    prependStoredInquiry({
      id: inquiryId,
      createdAt,
      updatedAt: createdAt,
      status: 'submitted',
      source,
      buyerName: formData.buyerName,
      email: formData.email,
      company: formData.company,
      role: formData.role,
      destinationCountry: formData.destinationCountry,
      targetPrice: formData.targetPrice,
      needSample: formData.needSample,
      message: formData.message,
      brandId: brand?.id,
      brandName: brand?.name,
      productId: queriedProduct?.id,
      productName: queriedProduct?.name,
      items: selectedItems,
      activities: [],
    });

    router.push(`/inquiries?created=${encodeURIComponent(inquiryId)}`);
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/inquiries" />

      <PageHero
        eyebrow="Request Quote"
        title={sourceContent[source].title}
        description={sourceContent[source].description}
        stats={[
          { label: '询盘来源', value: getInquirySourceLabel(source) },
          { label: '目标商品数', value: `${itemCount || brandProducts.length || 1}` },
          { label: '预估采购件数', value: `${totalUnits || '--'}` },
          { label: '默认响应目标', value: '< 24h' },
        ]}
        actions={
          <>
            <Link href="/inquiries" className="brand-button-primary">
              查看我的询盘
            </Link>
            <Link href="/brands" className="brand-button-secondary">
              继续浏览供应商
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8 lg:p-10">
              <div className="mb-8">
                <p className="brand-eyebrow mb-4">Inquiry Form</p>
                <h2 className="text-3xl font-semibold text-gray-950">提交询盘信息</h2>
                <p className="mt-3 max-w-2xl text-gray-600 leading-7">
                  我们先把最关键的字段收集清楚，后续就能接 CRM、邮件通知或顾问工作台，而不是停留在展示层。
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    联系人姓名
                    <input
                      value={formData.buyerName}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, buyerName: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="请输入采购联系人姓名"
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
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
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
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="请输入公司名称"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    您的角色
                    <input
                      value={formData.role}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, role: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="如采购经理 / 创始人 / 选品负责人"
                      required
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    收货国家 / 市场
                    <input
                      value={formData.destinationCountry}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          destinationCountry: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="如 United States / UAE / Germany"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    目标价格区间
                    <input
                      value={formData.targetPrice}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, targetPrice: event.target.value }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      placeholder="如 $18-$22 / 先看报价"
                    />
                  </label>
                </div>

                <label className="block text-sm font-semibold text-gray-700">
                  采购说明
                  <textarea
                    rows={6}
                    value={formData.message}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, message: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    placeholder="请补充采购背景、预期数量、对包装/打样/交期的要求。"
                    required
                  ></textarea>
                </label>

                <label className="inline-flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.needSample}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, needSample: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  本次询盘同时需要样品支持
                </label>

                <div className="flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-sm leading-6 text-gray-500">
                    提交后会先进入“我的询盘”列表。当前先用本地数据打通闭环，后续可继续接后台、邮件和 CRM。
                  </p>
                  <button className="brand-button-primary" type="submit">
                    {sourceContent[source].primaryAction}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={90}>
              <div className="brand-card rounded-[2rem] p-7">
                <div className="mb-6 flex items-center gap-3">
                  <div className="brand-icon-badge h-12 w-12 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
                      Inquiry Snapshot
                    </p>
                    <h3 className="text-2xl font-semibold text-gray-950">询盘摘要</h3>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                    <span>询盘来源</span>
                    <span className="font-semibold text-gray-950">{getInquirySourceLabel(source)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 border border-gray-100">
                    <span>关联供应商</span>
                    <span className="font-semibold text-gray-950">{brand?.name ?? '待顾问匹配'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 border border-gray-100">
                    <span>商品条目</span>
                    <span className="font-semibold text-gray-950">{itemCount || '--'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 border border-gray-100">
                    <span>采购件数</span>
                    <span className="font-semibold text-gray-950">{totalUnits || '--'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 border border-gray-100">
                    <span>参考金额</span>
                    <span className="font-semibold text-gray-950">
                      {estimatedAmount > 0 ? `$${estimatedAmount.toFixed(2)}` : '按实际报价'}
                    </span>
                  </div>
                </div>

                {selectedItems.length > 0 ? (
                  <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
                    {selectedItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.quantity}`}
                        className="rounded-[1.6rem] border border-gray-100 bg-white p-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="brand-icon-badge h-11 w-11 shrink-0 text-white">
                            <Package className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-950">{item.productName}</p>
                            <p className="mt-1 text-sm text-gray-500">{item.brandName}</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>数量 {item.quantity}</span>
                              <span>MOQ {item.minOrderQuantity}</span>
                              <span>单价 ${item.unitPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-[1.6rem] border border-dashed border-gray-200 bg-white p-5 text-sm leading-6 text-gray-600">
                    当前没有锁定具体商品，提交后可由平台顾问按照品牌或品类方向继续协助匹配。
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-7 text-white">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Next Step</p>
                <h3 className="text-2xl font-semibold leading-tight">
                  这一步的目标不是立刻成交，而是把有效采购线索沉淀下来。
                </h3>
                <div className="mt-6 grid gap-3">
                  {[
                    {
                      icon: Building2,
                      text: brand ? `优先围绕 ${brand.name} 进入人工跟进` : '先按供应商或品类做基础匹配',
                    },
                    {
                      icon: Globe2,
                      text: '记录收货国家、价格预期和样品需求，方便后续报价',
                    },
                    {
                      icon: ShieldCheck,
                      text: '后续可平滑接入 CRM、邮件提醒和询盘状态流转',
                    },
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

            <Reveal delay={220}>
              <div className="brand-card rounded-[2rem] p-7">
                <p className="brand-eyebrow mb-4">Related Links</p>
                <div className="flex flex-col gap-4">
                  <Link href="/inquiries" className="brand-button-secondary">
                    查看我的询盘
                  </Link>
                  {queriedProduct ? (
                    <Link href={`/products/${queriedProduct.id}`} className="text-sm font-semibold text-orange-700">
                      返回商品页
                    </Link>
                  ) : null}
                  {!queriedProduct && brand ? (
                    <Link href={`/brands/${brand.id}`} className="text-sm font-semibold text-orange-700">
                      返回品牌页
                    </Link>
                  ) : null}
                  {!brand ? (
                    <Link href="/brands" className="text-sm font-semibold text-orange-700">
                      继续浏览供应商
                    </Link>
                  ) : null}
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
