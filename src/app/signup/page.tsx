'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerBuyer } from '@/lib/buyerApi';
import { getStoredBuyerUser } from '@/lib/buyerAuth';
import { SiteNav } from '@/components/site/SiteNav';
import { SiteFooter } from '@/components/site/SiteFooter';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    contactName: '',
    email: '',
    password: '',
    businessName: '',
    businessType: '',
    phoneNumber: '',
    country: '',
    agreeTerms: false,
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
    if (!formData.agreeTerms) {
      setErrorMessage('请先同意服务条款和隐私政策。');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await registerBuyer({
        contactName: formData.contactName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        businessName: formData.businessName.trim(),
        businessType: formData.businessType,
        phoneNumber: formData.phoneNumber.trim(),
        country: formData.country,
      });
      router.push(redirectPath);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '注册失败，请稍后重试。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav />

      <div className="brand-section py-28">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#9a3412] p-8 text-white lg:p-10">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-amber-200/80">Buyer Signup</p>
            <h1 className="text-4xl font-semibold leading-tight">创建买家账号，把询盘和采购动作沉淀下来。</h1>
            <p className="mt-5 text-sm leading-7 text-white/80">
              注册完成后会自动登录，并把后续提交的询盘写进真实后端，方便你回看进度，也方便卖家后台直接跟进。
            </p>

            <div className="mt-8 grid gap-4">
              {[
                '注册后自动进入买家工作台',
                '询盘列表和详情不再依赖浏览器本地演示数据',
                '后续可以继续平滑扩展订单、通知和账号设置',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="brand-card rounded-[2rem] p-8 lg:p-10">
            <div className="mb-8">
              <p className="brand-eyebrow mb-4">Create Account</p>
              <h2 className="text-3xl font-semibold text-gray-950">注册买家账号</h2>
              <p className="mt-3 text-gray-600">填写基础商务信息后即可开始保存询盘记录和采购进度。</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  联系人姓名
                  <input
                    name="contactName"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  商务邮箱
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  公司名称
                  <input
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  登录密码
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-semibold text-gray-700">
                  业务类型
                  <select
                    name="businessType"
                    required
                    value={formData.businessType}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">请选择业务类型</option>
                    <option value="boutique">精品零售</option>
                    <option value="distributor">经销批发</option>
                    <option value="brand">品牌采购</option>
                    <option value="ecommerce">跨境电商</option>
                    <option value="other">其他</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  联系电话
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-gray-700">
                所在国家 / 市场
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">请选择国家 / 市场</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-600">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>
                  我已阅读并同意
                  <Link href="/terms" className="mx-1 font-semibold text-orange-700">
                    服务条款
                  </Link>
                  和
                  <Link href="/privacy" className="ml-1 font-semibold text-orange-700">
                    隐私政策
                  </Link>
                </span>
              </label>

              {errorMessage ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="brand-button-primary w-full disabled:opacity-70"
              >
                {submitting ? '注册中...' : '创建账号'}
              </button>

              <div className="text-center text-sm text-gray-600">
                已经有账号？
                <Link href="/login" className="ml-2 font-semibold text-orange-700">
                  立即登录
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
