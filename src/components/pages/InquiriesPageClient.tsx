'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Clock3, MessageSquare, Package2 } from 'lucide-react';
import {
  getInquirySourceLabel,
  getInquiryStatusMeta,
  loadStoredInquiries,
  subscribeInquiryUpdates,
} from '@/lib/inquiries';
import { type Inquiry, type InquiryStatus } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type InquiryFilter = 'all' | InquiryStatus;

const filters: Array<{ key: InquiryFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'submitted', label: '已提交' },
  { key: 'reviewing', label: '处理中' },
  { key: 'quoted', label: '已报价' },
  { key: 'closed', label: '已关闭' },
];

type InquiriesPageClientProps = {
  createdId?: string;
};

export default function InquiriesPageClient({ createdId }: InquiriesPageClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activeFilter, setActiveFilter] = useState<InquiryFilter>('all');

  useEffect(() => {
    const syncInquiries = () => setInquiries(loadStoredInquiries());
    syncInquiries();
    return subscribeInquiryUpdates(syncInquiries);
  }, []);

  const filteredInquiries = useMemo(() => {
    if (activeFilter === 'all') return inquiries;
    return inquiries.filter((inquiry) => inquiry.status === activeFilter);
  }, [activeFilter, inquiries]);

  const submittedCount = inquiries.filter((inquiry) => inquiry.status === 'submitted').length;
  const quotedCount = inquiries.filter((inquiry) => inquiry.status === 'quoted').length;
  const itemCount = inquiries.reduce((sum, inquiry) => sum + inquiry.items.length, 0);

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/inquiries" />

      <PageHero
        eyebrow="My Inquiries"
        title="把采购意向沉淀成可持续跟进的询盘列表"
        description="这一步让询盘不再只是一次性弹窗，而是进入可查看、可回溯、可继续扩展状态流转的业务对象。"
        stats={[
          { label: '累计询盘', value: `${inquiries.length}` },
          { label: '待确认', value: `${submittedCount}` },
          { label: '已报价', value: `${quotedCount}` },
          { label: '关联商品条目', value: `${itemCount}` },
        ]}
        actions={
          <>
            <Link href="/request-quote" className="brand-button-primary">
              发起新询盘
            </Link>
            <Link href="/brands" className="brand-button-secondary">
              浏览更多供应商
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        {createdId ? (
          <Reveal>
            <div className="mb-6 rounded-[1.8rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-700">
              询盘已提交成功，编号为 <span className="font-semibold">{createdId}</span>。当前为本地演示闭环，后续可直接接入真实后台与顾问分配流程。
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={60}>
          <div className="brand-card rounded-[2rem] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="brand-eyebrow mb-4">Pipeline View</p>
                <h2 className="text-3xl font-semibold text-gray-950">询盘看板</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      activeFilter === filter.key
                        ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white shadow-[0_12px_24px_rgba(194,65,12,0.2)]'
                        : 'bg-[#fff7ed] text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 space-y-5">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry, index) => {
              const statusMeta = getInquiryStatusMeta(inquiry.status);
              const latestActivity = inquiry.activities[inquiry.activities.length - 1];
              const followUpCount = inquiry.activities.filter((activity) => activity.type === 'buyer_follow_up').length;

              return (
                <Reveal key={inquiry.id} delay={index * 60}>
                  <div className="brand-card rounded-[2rem] p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="brand-icon-badge h-12 w-12 text-white">
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-2xl font-semibold text-gray-950">{inquiry.company}</h3>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              询盘编号 {inquiry.id} · {getInquirySourceLabel(inquiry.source)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">联系人</div>
                            <div className="mt-2 font-semibold text-gray-950">{inquiry.buyerName}</div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">目的市场</div>
                            <div className="mt-2 font-semibold text-gray-950">{inquiry.destinationCountry}</div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">样品需求</div>
                            <div className="mt-2 font-semibold text-gray-950">
                              {inquiry.needSample ? '需要样品' : '暂不需要'}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-gray-100 bg-white p-4">
                            <div className="text-sm text-gray-500">提交时间</div>
                            <div className="mt-2 font-semibold text-gray-950">
                              {new Date(inquiry.createdAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-[1.6rem] bg-[#fffaf5] p-5 text-sm leading-7 text-gray-600">
                          <p className="font-semibold text-gray-950">需求说明</p>
                          <p className="mt-2">{inquiry.message}</p>
                          <p className="mt-3 text-orange-700">{statusMeta.description}</p>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5">
                            <p className="text-sm text-gray-500">最近沟通</p>
                            <p className="mt-2 line-clamp-2 text-sm leading-7 text-gray-700">
                              {latestActivity?.message ?? '当前还没有新的跟进记录'}
                            </p>
                            <p className="mt-3 text-xs text-gray-400">
                              {latestActivity
                                ? new Date(latestActivity.createdAt).toLocaleString('zh-CN')
                                : '等待首次沟通'}
                            </p>
                          </div>
                          <div className="rounded-[1.6rem] border border-gray-100 bg-white p-5">
                            <p className="text-sm text-gray-500">买家跟进次数</p>
                            <p className="mt-2 text-2xl font-semibold text-gray-950">{followUpCount}</p>
                            <p className="mt-3 text-sm text-gray-500">
                              可继续在详情页补充留言、确认样品需求或催进度
                            </p>
                          </div>
                        </div>

                        {inquiry.items.length > 0 ? (
                          <div className="mt-6 space-y-3">
                            {inquiry.items.map((item) => (
                              <div
                                key={`${inquiry.id}-${item.productId}`}
                                className="rounded-[1.6rem] border border-gray-100 bg-white p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div className="flex items-start gap-4">
                                    <div className="brand-icon-badge h-10 w-10 text-white">
                                      <Package2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-950">{item.productName}</p>
                                      <p className="mt-1 text-sm text-gray-500">{item.brandName}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                    <span>数量 {item.quantity}</span>
                                    <span>MOQ {item.minOrderQuantity}</span>
                                    <span>单价 ${item.unitPrice}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : inquiry.brandName ? (
                          <div className="mt-6 rounded-[1.6rem] border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600">
                            当前询盘围绕品牌 <span className="font-semibold text-gray-950">{inquiry.brandName}</span>{' '}
                            发起，尚未锁定具体商品。
                          </div>
                        ) : null}
                      </div>

                      <div className="w-full lg:max-w-[280px]">
                        <div className="rounded-[1.8rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-5 text-white">
                          <p className="text-xs uppercase tracking-[0.24em] text-orange-200/80">Follow Up</p>
                          <div className="mt-4 space-y-4 text-sm text-white/75">
                            <div className="flex items-center gap-3">
                              <Clock3 className="h-4 w-4 text-orange-300" />
                              <span>建议 24 小时内完成首次人工联系</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <ClipboardList className="h-4 w-4 text-orange-300" />
                              <span>
                                {inquiry.targetPrice
                                  ? `目标价格：${inquiry.targetPrice}`
                                  : '当前未填写明确目标价格'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-3">
                            <Link href={`/inquiries/${inquiry.id}`} className="brand-button-primary text-sm">
                              查看询盘详情
                            </Link>
                            <Link href={`/inquiries/${inquiry.id}#follow-up`} className="brand-button-secondary text-sm">
                              补充跟进留言
                            </Link>
                            {inquiry.productId ? (
                              <Link href={`/products/${inquiry.productId}`} className="brand-button-secondary text-sm">
                                回到商品页
                              </Link>
                            ) : inquiry.brandId ? (
                              <Link href={`/brands/${inquiry.brandId}`} className="brand-button-secondary text-sm">
                                回到品牌页
                              </Link>
                            ) : (
                              <Link href="/brands" className="brand-button-secondary text-sm">
                                浏览供应商
                              </Link>
                            )}
                            <Link href="/request-quote" className="brand-button-secondary text-sm bg-white/10 text-white border-white/12 hover:bg-white/15">
                              再发起一条询盘 <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })
          ) : (
            <Reveal>
              <div className="brand-card rounded-[2rem] p-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-semibold text-gray-950">还没有询盘记录</h2>
                <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-7">
                  现在已经有完整的询盘闭环了。你可以从商品页、品牌页或购物车发起报价请求，再回到这里查看沉淀下来的线索。
                </p>
                <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link href="/request-quote" className="brand-button-primary">
                    先发起一条询盘
                  </Link>
                  <Link href="/brands" className="brand-button-secondary">
                    去浏览供应商
                  </Link>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
