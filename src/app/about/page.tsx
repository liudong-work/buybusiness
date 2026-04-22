'use client';

import { Globe2, Lightbulb, ShieldCheck, Users2 } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

const values = [
  { icon: Users2, title: '可信协作', description: '让供应商和采购商之间的第一步就建立起清晰、专业且可信的印象。' },
  { icon: Lightbulb, title: '体验优先', description: '不是先堆功能，而是先把信息架构、视觉层级和关键动作做清楚。' },
  { icon: Globe2, title: '跨境视角', description: '页面表达既要对中国供应商友好，也要对海外采购商清晰。' },
  { icon: ShieldCheck, title: '长期可扩展', description: '从现在的原型开始，就为后续 API、订单和认证能力留好空间。' },
];

export default function AboutPage() {
  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/about" />

      <PageHero
        eyebrow="About The Platform"
        title="连接全球零售商与优质供应商的批发采购平台"
        description="围绕供应商发现、类目浏览和采购决策，建立一个更容易理解、更方便继续扩展的 B2B 平台原型。"
        stats={[
          { label: '目标角色', value: 'Retailers' },
          { label: '服务对象', value: 'Suppliers' },
          { label: '核心主题', value: 'B2B' },
          { label: '品牌语气', value: 'Professional' },
        ]}
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <div className="brand-card rounded-[2rem] p-8 lg:p-10">
              <p className="brand-eyebrow mb-5">Mission</p>
              <h2 className="text-3xl font-semibold text-gray-950">让供应商发现、商品筛选与采购决策变得更清晰</h2>
              <div className="mt-6 space-y-4 text-gray-600 leading-8">
                <p>
                  当前项目希望先把首页、类目、供应商目录、注册登录和购物车这些核心路径做清楚，再逐步承接真实的询盘、订单和支付能力。
                </p>
                <p>
                  对跨境批发场景来说，页面不仅要能展示信息，也要让采购商更快判断品牌是否匹配、商品是否值得继续了解。
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#14213d] to-[#1e3a8a] p-8 text-white lg:p-10">
              <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80 mb-5">Platform Vision</p>
              <h2 className="text-3xl font-semibold leading-tight">建立一个从品牌发现到下单转化都足够专业的批发体验骨架。</h2>
              <p className="mt-6 text-white/65 leading-8">
                后续继续接入注册登录、购物车、询盘、结算、订单和后台系统时，前端结构也能继续自然扩展。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="brand-section pb-4">
        <Reveal>
          <div className="brand-card rounded-[2rem] p-8 lg:p-10">
            <div className="mb-8">
              <p className="brand-eyebrow mb-4">Core Values</p>
              <h2 className="text-3xl font-semibold text-gray-950">四个决定我们视觉和产品取向的原则</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-[1.6rem] border border-gray-100 bg-white p-6 shadow-[0_14px_26px_rgba(15,23,42,0.04)]">
                    <Icon className="mb-5 h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-950">{value.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{value.description}</p>
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
