'use client';

import Link from 'next/link';
import { ArrowRight, Building2, HelpCircle, Mail, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitch } from '@/components/site/LanguageSwitch';

export function SiteFooter() {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const footerGroups = [
    {
      title: isZh ? '采购商' : 'For Buyers',
      links: [
        { name: isZh ? '免费注册' : 'Sign Up Free', href: '/signup-simple' },
        { name: isZh ? '浏览供应商' : 'Browse Brands', href: '/brands' },
        { name: isZh ? '常见问题' : 'FAQ', href: '/faq' },
      ],
    },
    {
      title: isZh ? '平台支持' : 'Support',
      links: [
        { name: isZh ? '联系我们' : 'Contact', href: '/contact' },
        { name: isZh ? '服务协议' : 'Terms', href: '/terms' },
        { name: isZh ? '隐私政策' : 'Privacy', href: '/privacy' },
      ],
    },
    {
      title: isZh ? '探索内容' : 'Explore',
      links: [
        { name: isZh ? '品牌故事' : 'About', href: '/about' },
        { name: isZh ? '商品分类' : 'Categories', href: '/categories' },
        { name: isZh ? '登录账号' : 'Login', href: '/login' },
      ],
    },
  ];

  const trustPoints = [
    { icon: Building2, label: isZh ? '优质供应商网络' : 'Verified supplier network' },
    { icon: ShieldCheck, label: isZh ? '采购与支付保障' : 'Trade and payment protection' },
    { icon: HelpCircle, label: isZh ? '人工顾问支持' : 'Human sourcing support' },
    { icon: Mail, label: isZh ? '订单与通知邮件' : 'Order and workflow email updates' },
  ];

  return (
    <footer className="mt-20 border-t border-white/60 bg-[#171717] text-white">
      <div className="brand-section py-16">
        <div className="mb-12 grid gap-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-orange-200/70">
              {isZh ? 'Wholesale Platform' : 'Global Sourcing Platform'}
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
              {isZh
                ? '把供应商发现、商品筛选和后续采购流程放进同一条体验里。'
                : 'Bring supplier discovery, assortment review and sourcing workflow into one experience.'}
            </h2>
            <p className="max-w-2xl text-white/65 leading-7">
              {isZh
                ? '当前版本已经覆盖品牌浏览、商品详情、注册登录和购物车入口。后续继续接入真实 API 后，这套视觉骨架也能稳定支撑更复杂的交易流程。'
                : 'The current version already covers brand discovery, product detail, account entry and cart flow. Once real APIs are connected, this visual system can support a much deeper transaction experience.'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {trustPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <Icon className="mb-4 h-5 w-5 text-orange-300" />
                  <p className="text-sm font-medium text-white/80">{point.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-orange-300 text-white">
                <span className="text-lg font-bold">外</span>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-orange-200/70">
                  {isZh ? 'Global Wholesale' : 'Cross-Border Sourcing'}
                </p>
                <p className="text-lg font-semibold">{isZh ? '外贸批发平台' : 'Global Wholesale'}</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/60">
              {isZh
                ? '一个面向跨境批发业务的现代化平台原型，强调品牌发现、类目浏览和清晰的采购决策体验。'
                : 'A modern wholesale prototype built for cross-border sourcing, with stronger brand discovery, category browsing and clearer buying decisions.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/signup-simple" className="brand-button-primary text-sm">
                {isZh ? '免费注册' : 'Sign Up Free'}
              </Link>
              <Link href="/contact" className="brand-button-secondary text-sm bg-white/10 text-white border-white/12 hover:bg-white/15">
                {isZh ? '联系顾问' : 'Contact Advisor'}
              </Link>
              <LanguageSwitch theme="dark" />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/40">{group.title}</h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="group inline-flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white">
                        <span>{link.name}</span>
                        <ArrowRight className="h-3.5 w-3.5 translate-x-0 opacity-0 text-orange-300 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/45 md:flex-row md:items-center md:justify-between">
          <p>{isZh ? '© 2026 外贸批发平台. 保留所有权利。' : '© 2026 Global Wholesale. All rights reserved.'}</p>
          <p>
            {isZh
              ? '为供应商发现、商品采购与更清晰的批发流程而设计。'
              : 'Designed for supplier discovery, product sourcing and cleaner wholesale workflows.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
