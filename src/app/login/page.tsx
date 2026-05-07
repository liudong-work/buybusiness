'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BadgeCheck, KeyRound, Mail } from 'lucide-react';
import { loginBuyer } from '@/lib/buyerApi';
import { getStoredBuyerUser } from '@/lib/buyerAuth';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

function detectDeviceName() {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone Safari';
  if (/iPad/i.test(ua)) return 'iPad Safari';
  if (/Macintosh/i.test(ua)) return 'Mac Browser';
  if (/Windows/i.test(ua) && /Edg/i.test(ua)) return 'Windows Edge';
  if (/Windows/i.test(ua)) return 'Windows Browser';
  if (/Android/i.test(ua)) return 'Android Browser';
  return 'Web Browser';
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (getStoredBuyerUser()) {
      router.replace(redirectPath);
    }
  }, [redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await loginBuyer({
        email: formData.email.trim(),
        password: formData.password,
        deviceName: detectDeviceName(),
      });
      router.push(redirectPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav />

      <PageHero
        eyebrow="Account Access"
        title="登录账号，继续管理采购清单与供应商收藏"
        description="买家账号现在已经接入真实后端，会保留你的询盘记录，并支持从登录后继续回到刚才的业务页面。"
        stats={[
          { label: '认证方式', value: 'Email + Password' },
          { label: '登录状态', value: 'Backend Ready' },
          { label: '已接入', value: 'Buyer Auth' },
          { label: '适配场景', value: 'B2B' },
        ]}
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
          <Reveal>
            <div className="rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#14213d] to-[#1e3a8a] p-8 text-white lg:p-10">
              <p className="mb-5 text-xs uppercase tracking-[0.24em] text-blue-200/80">Returning Users</p>
              <h2 className="text-3xl font-semibold">登录后继续查看询盘进度、收藏供应商和采购动作。</h2>
              <div className="mt-8 grid gap-4">
                {[
                  '继续回看已提交的询盘和后续沟通记录',
                  '把买家工作台和浏览行为串成同一条路径',
                  '后续可以继续扩展订单提醒和复购入口',
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
                <h2 className="text-3xl font-semibold text-gray-950">登录买家账号</h2>
                <p className="mt-3 text-gray-600">输入注册邮箱和密码即可继续访问你的询盘、收藏和买家工作台。</p>
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
                    需要协助？
                  </Link>
                </div>

                {errorMessage ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                ) : null}

                <button className="brand-button-primary w-full disabled:opacity-70" type="submit" disabled={submitting}>
                  {submitting ? '登录中...' : '登录账号'}
                </button>
              </form>

              <div className="mt-8 rounded-[1.6rem] border border-gray-100 bg-white p-5">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BadgeCheck className="h-4 w-4 text-blue-600" />
                  登录成功后会直接恢复你的买家身份和询盘数据。
                </div>
              </div>

              <p className="mt-6 text-sm text-gray-600">
                还没有账号？
                <Link href="/signup" className="ml-2 font-semibold text-blue-700">
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
