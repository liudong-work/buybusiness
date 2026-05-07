'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Clock3, MessageSquare, Package2, Scale, Send, Sparkles } from 'lucide-react';
import { createBuyerInquiryFollowUp, fetchBuyerInquiryDetail, subscribeBuyerInquiryUpdates } from '@/lib/buyerApi';
import { getStoredBuyerUser, subscribeBuyerAuthUpdates } from '@/lib/buyerAuth';
import {
  getInquirySourceLabel,
  getInquiryStatusMeta,
  getInquiryTimeline,
} from '@/lib/inquiries';
import { type BuyerUser, type Inquiry, type InquiryActivity } from '@/types';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

interface InquiryDetailPageClientProps {
  inquiryId: string;
}

const quickFollowUpTemplates = [
  '想补充一下目标价格区间和预计首单数量，请帮我一起核对可行性。',
  '请优先确认是否支持样品、打样周期和大货交期。',
  '如果当前商品有相近替代款，也请一并推荐给我做比较。',
];

function getActivityMeta(activity: InquiryActivity) {
  if (activity.author === 'buyer') {
    return {
      label: activity.type === 'created' ? '买家发起' : '买家跟进',
      className: 'bg-orange-50 text-orange-700 border-orange-100',
    };
  }

  if (activity.author === 'advisor') {
    return {
      label: '顾问回复',
      className: 'bg-blue-50 text-blue-700 border-blue-100',
    };
  }

  return {
    label: '系统记录',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  };
}

export default function InquiryDetailPageClient({ inquiryId }: InquiryDetailPageClientProps) {
  const [buyerUser, setBuyerUser] = useState<BuyerUser | null>(null);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadInquiry = async () => {
      const user = getStoredBuyerUser();
      setBuyerUser(user);
      if (!user) {
        setInquiry(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage('');
      try {
        setInquiry(await fetchBuyerInquiryDetail(inquiryId));
      } catch (error) {
        setInquiry(null);
        setErrorMessage(error instanceof Error ? error.message : '询盘详情加载失败，请稍后重试。');
      } finally {
        setLoading(false);
      }
    };

    loadInquiry();

    const unsubscribeInquiry = subscribeBuyerInquiryUpdates(loadInquiry);
    const unsubscribeAuth = subscribeBuyerAuthUpdates(loadInquiry);

    return () => {
      unsubscribeInquiry();
      unsubscribeAuth();
    };
  }, [inquiryId]);

  if (!buyerUser) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/inquiries" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <ClipboardList className="mx-auto mb-5 h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-semibold text-gray-950">请先登录买家账号</h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-7">
              登录后才能查看属于你的真实询盘详情和历史沟通记录。
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={`/login?redirect=/inquiries/${inquiryId}`} className="brand-button-primary">
                去登录
              </Link>
              <Link href={`/signup?redirect=/inquiries/${inquiryId}`} className="brand-button-secondary">
                去注册
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/inquiries" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center text-gray-500">正在加载询盘详情...</div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/inquiries" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <ClipboardList className="mx-auto mb-5 h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-semibold text-gray-950">询盘未找到</h1>
            <p className="mx-auto mt-4 max-w-xl text-gray-600 leading-7">
              {errorMessage || '这条询盘不存在，或者当前账号没有查看权限。'}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/inquiries" className="brand-button-primary">
                返回询盘列表
              </Link>
              <Link href="/account" className="brand-button-secondary">
                返回工作台
              </Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  const statusMeta = getInquiryStatusMeta(inquiry.status);
  const timeline = getInquiryTimeline(inquiry.status);
  const latestActivity = inquiry.activities[inquiry.activities.length - 1];
  const followUpCount = inquiry.activities.filter((activity) => activity.type === 'buyer_follow_up').length;

  const handleFollowUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!followUpMessage.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const updatedInquiry = await createBuyerInquiryFollowUp(inquiry.id, followUpMessage);
      setInquiry(updatedInquiry);
      setFollowUpMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '提交跟进失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/inquiries" />

      <PageHero
        eyebrow="Inquiry Detail"
        title={`询盘 ${inquiry.id}`}
        description="询盘详情页现在不只是查看摘要，还可以继续补充留言、再次跟进，并把沟通记录沉淀为连续的业务上下文。"
        stats={[
          { label: '当前状态', value: statusMeta.label },
          { label: '询盘来源', value: getInquirySourceLabel(inquiry.source) },
          { label: '商品条目', value: `${inquiry.items.length}` },
          { label: '跟进次数', value: `${followUpCount}` },
        ]}
        actions={
          <>
            <Link href="/inquiries" className="brand-button-primary">
              返回询盘列表
            </Link>
            <Link href="/account" className="brand-button-secondary">
              返回工作台
            </Link>
          </>
        }
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-semibold text-gray-950">询盘概览</h2>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">联系人</p>
                  <p className="mt-2 font-semibold text-gray-950">{inquiry.buyerName}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">公司名称</p>
                  <p className="mt-2 font-semibold text-gray-950">{inquiry.company}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">目标市场</p>
                  <p className="mt-2 font-semibold text-gray-950">{inquiry.destinationCountry}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">样品需求</p>
                  <p className="mt-2 font-semibold text-gray-950">{inquiry.needSample ? '需要样品' : '暂不需要样品'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">提交时间</p>
                  <p className="mt-2 font-semibold text-gray-950">
                    {new Date(inquiry.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-sm text-gray-500">最近沟通</p>
                  <p className="mt-2 font-semibold text-gray-950">
                    {latestActivity ? new Date(latestActivity.createdAt).toLocaleString('zh-CN') : '--'}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.8rem] bg-[#fffaf5] p-6 text-sm leading-7 text-gray-600">
                <p className="font-semibold text-gray-950">需求说明</p>
                <p className="mt-2">{inquiry.message}</p>
                {inquiry.targetPrice ? (
                  <>
                    <p className="mt-5 font-semibold text-gray-950">目标价格</p>
                    <p className="mt-2">{inquiry.targetPrice}</p>
                  </>
                ) : null}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div id="follow-up" className="brand-card rounded-[2rem] p-8">
              <div className="mb-6">
                <p className="brand-eyebrow mb-4">Follow Up</p>
                <h2 className="text-3xl font-semibold text-gray-950">补充留言与再次跟进</h2>
              </div>

              <div className="rounded-[1.8rem] bg-[#fffaf5] p-6">
                <div className="flex items-start gap-4">
                  <div className="brand-icon-badge h-12 w-12 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-950">继续补充当前询盘</p>
                    <p className="mt-2 text-sm leading-7 text-gray-600">
                      你可以继续补充价格、打样、包装、交期或替代款诉求。前端会把跟进内容沉淀在这条询盘下，形成连续沟通历史。
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {quickFollowUpTemplates.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setFollowUpMessage(template)}
                      className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
                    >
                      快速填入
                    </button>
                  ))}
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleFollowUpSubmit}>
                  <textarea
                    rows={6}
                    value={followUpMessage}
                    onChange={(event) => setFollowUpMessage(event.target.value)}
                    className="w-full rounded-[1.6rem] border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    placeholder="补充你的最新诉求，例如希望确认样品周期、包装要求、预计首单数量、目标价格区间或替代款建议。"
                  ></textarea>
                  {errorMessage ? (
                    <div className="rounded-[1.4rem] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-gray-500">
                      提交后会直接写入真实询盘记录，并自动追加一条顾问已收到的确认回复。
                    </p>
                    <button className="brand-button-primary disabled:opacity-70" type="submit" disabled={isSubmitting || inquiry.status === 'closed'}>
                      提交跟进留言
                      <Send className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <div className="brand-card rounded-[2rem] p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="brand-eyebrow mb-4">Conversation History</p>
                  <h2 className="text-3xl font-semibold text-gray-950">历史沟通记录</h2>
                </div>
                <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                  共 {inquiry.activities.length} 条记录
                </div>
              </div>

              <div className="space-y-4">
                {inquiry.activities.map((activity) => {
                  const activityMeta = getActivityMeta(activity);

                  return (
                    <div key={activity.id} className="rounded-[1.6rem] border border-gray-100 bg-white p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${activityMeta.className}`}>
                              {activityMeta.label}
                            </span>
                            <p className="text-sm text-gray-400">
                              {new Date(activity.createdAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                          <p className="mt-4 text-lg font-semibold text-gray-950">{activity.title}</p>
                          <p className="mt-2 text-sm leading-7 text-gray-600">{activity.message}</p>
                        </div>
                        {activity.status ? (
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getInquiryStatusMeta(activity.status).className}`}
                          >
                            {getInquiryStatusMeta(activity.status).label}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="brand-card rounded-[2rem] p-8">
                <div className="mb-6">
                  <p className="brand-eyebrow mb-4">Line Items</p>
                  <h2 className="text-3xl font-semibold text-gray-950">关联商品</h2>
                </div>

                {inquiry.items.length > 0 ? (
                  <div className="space-y-4">
                    {inquiry.items.map((item) => (
                      <div
                        key={`${inquiry.id}-${item.productId}`}
                        className="rounded-[1.6rem] border border-gray-100 bg-white p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div className="brand-icon-badge h-11 w-11 text-white">
                              <Package2 className="h-5 w-5" />
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
                ) : (
                  <div className="rounded-[1.6rem] border border-dashed border-gray-200 bg-white p-8 text-center text-gray-600">
                    当前询盘主要围绕品牌或通用采购需求发起，尚未锁定具体商品。
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-8 text-white">
                <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Next Follow Up</p>
                <div className="space-y-4 text-sm leading-7 text-white/80">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-4 w-4 text-orange-300" />
                    <p>补充交期、样品、包装和目标价格后，询盘会更接近真实顾问跟进场景。</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-1 h-4 w-4 text-orange-300" />
                    <p>
                      当前最近一次沟通时间为{' '}
                      {latestActivity ? new Date(latestActivity.createdAt).toLocaleString('zh-CN') : '--'}。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-[#171717] via-[#292524] to-[#7c2d12] p-8 text-white">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/80">Inquiry Timeline</p>
            <div className="grid gap-4 md:grid-cols-4">
              {timeline.map((step) => (
                <div
                  key={step.step}
                  className={`rounded-2xl border p-4 text-sm transition-all ${
                    step.isCurrent
                      ? 'border-orange-300 bg-white/12 text-white'
                      : step.isCompleted
                        ? 'border-white/10 bg-white/8 text-white/90'
                        : 'border-white/8 bg-white/5 text-white/55'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        step.isCurrent ? 'bg-orange-300' : step.isCompleted ? 'bg-emerald-300' : 'bg-white/30'
                      }`}
                    ></div>
                    <span className="font-semibold">{step.label}</span>
                  </div>
                  <p className="leading-6">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-4">
              <Clock3 className="mt-1 h-5 w-5 text-orange-300" />
              <div>
                <p className="font-semibold">{statusMeta.label}</p>
                <p className="mt-2 text-sm leading-7 text-white/75">{statusMeta.description}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            {inquiry.productId ? (
              <Link href={`/products/${inquiry.productId}`} className="brand-button-primary">
                回到商品页
              </Link>
            ) : inquiry.brandId ? (
              <Link href={`/brands/${inquiry.brandId}`} className="brand-button-primary">
                回到品牌页
              </Link>
            ) : null}
            <Link href="/compare" className="brand-button-secondary">
              <Scale className="mr-2 h-4 w-4" />
              去看对比面板
            </Link>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </div>
  );
}
