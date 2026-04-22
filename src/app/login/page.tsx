'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, KeyRound, Mail } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('当前为演示登录页，后续可以直接接入真实认证 API。');
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav />

      <PageHero
        eyebrow="Account Access"
        title="登录账号，继续管理采购清单与供应商收藏"
        description="保持轻量、清爽和直接的登录体验，方便后续继续接入真实认证、找回密码和登录态管理。"
        stats={[
          { label: '认证方式', value: 'Email' },
          { label: '登录状态', value: 'Demo' },
          { label: '下一步', value: 'API Ready' },
          { label: '适配场景', value: 'B2B' },
        ]}
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <Reveal>
            <div className="rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#14213d] to-[#1e3a8a] p-8 text-white lg:p-10">
              <p className="text-xs uppercase tracking-[0.24em] text-blue-200/80 mb-5">Returning Users</p>
              <h2 className="text-3xl font-semibold">登录后继续管理采购清单、供应商收藏和后续询盘流程。</h2>
              <div className="mt-8 grid gap-4">
                {[
                  '继续查看购物车与待采购商品',
                  '回到已关注的供应商和类目',
                  '后续承接询盘、报价和订单提醒',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="brand-card rounded-[2rem] p-8 lg:p-10">
              <div className="mb-8">
                <p className="brand-eyebrow mb-4">Sign In</p>
                <h2 className="text-3xl font-semibold text-gray-950">登录账号</h2>
                <p className="mt-3 text-gray-600">当前为邮箱登录演示页，后续可以继续接密码重置、验证码登录和真实认证接口。</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-gray-700">
                  邮箱
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      placeholder="buyer@example.com"
                      required
                    />
                  </div>
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  密码
                  <div className="relative mt-2">
                    <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      placeholder="请输入密码"
                      required
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.remember}
                      onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    保持登录状态
                  </label>
                  <Link href="/contact" className="font-semibold text-blue-700">
                    忘记密码？
                  </Link>
                </div>

                <button className="brand-button-primary w-full" type="submit">
                  登录账号
                </button>
              </form>

              <div className="mt-8 rounded-[1.6rem] border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BadgeCheck className="h-4 w-4 text-blue-600" />
                  当前为演示登录入口，适合继续接入真实认证与登录态管理。
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-600">
                还没有账号？
                <Link href="/signup-simple" className="ml-2 font-semibold text-blue-700">
                  立即注册
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
