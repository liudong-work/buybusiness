'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitch } from '@/components/site/LanguageSwitch';

export default function SimpleSignupPage() {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    businessType: '',
    agreeTerms: false,
  });
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
      return () => window.clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      setCountdown(60);
      alert(isZh ? `验证码已发送到您的邮箱：${formData.email}` : `Verification code sent to ${formData.email}`);
      setStep(2);
      return;
    }

    alert(
      isZh
        ? `注册成功！欢迎使用外贸批发平台，账号邮箱为 ${formData.email}`
        : `Registration complete. Welcome aboard. Your account email is ${formData.email}`
    );
  };

  const handleResendCode = () => {
    setCountdown(60);
    alert(isZh ? `验证码已重新发送到您的邮箱：${formData.email}` : `Verification code resent to ${formData.email}`);
  };

  const benefitCards = isZh
    ? [
        { icon: '✉️', title: '邮箱即账号', desc: '适合跨团队共享和后续询盘沟通' },
        { icon: '🏢', title: '100,000+ 供应商', desc: '优质制造商和品牌快速触达' },
        { icon: '🚚', title: '全球物流', desc: '从选品到配送一站式跟进' },
        { icon: '🛡️', title: '交易保障', desc: '验证、支付和售后流程更安心' },
      ]
    : [
        { icon: '✉️', title: 'Email as account', desc: 'Better for teamwork and follow-up sourcing communication' },
        { icon: '🏢', title: '100,000+ suppliers', desc: 'Reach verified manufacturers and brands faster' },
        { icon: '🚚', title: 'Global logistics', desc: 'Track the flow from product selection to delivery' },
        { icon: '🛡️', title: 'Trade protection', desc: 'A calmer path for verification, payment and after-sales' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-red-500 opacity-20 blur-3xl"></div>
        <div className="absolute right-20 top-40 h-72 w-72 rounded-full bg-orange-500 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 transition-transform duration-300 group-hover:rotate-12">
                <span className="text-lg font-bold text-white">外</span>
              </div>
              <span className="text-xl font-bold text-white">{isZh ? '外贸批发平台' : 'Global Wholesale'}</span>
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/" className="hidden text-white/80 transition-colors hover:text-white sm:inline-flex">
                {isZh ? '首页' : 'Home'}
              </Link>
              <Link href="/brands" className="hidden text-white/80 transition-colors hover:text-white sm:inline-flex">
                {isZh ? '供应商' : 'Brands'}
              </Link>
              <LanguageSwitch theme="dark" />
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="text-white">
            <div className="mb-4 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
              {isZh ? 'Business Account Setup' : 'Business Account Setup'}
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl xl:text-5xl">
              {isZh ? '开启您的' : 'Create your'}
              <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {isZh ? '批发采购之旅' : 'sourcing account by email'}
              </span>
            </h1>

            <p className="mb-6 text-base leading-7 text-white/80 md:text-lg">
              {isZh
                ? '使用邮箱完成注册，更适合后续接收报价、订单提醒和平台通知。'
                : 'Use email registration for quotes, order updates and platform notifications in one place.'}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {benefitCards.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
                >
                  <div className="mb-2 text-3xl">{item.icon}</div>
                  <h3 className="mb-1 text-base font-bold">{item.title}</h3>
                  <p className="text-xs leading-5 text-white/60">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">
                {isZh ? 'Why Email First' : 'Why Email First'}
              </p>
              <p className="text-sm leading-6 text-white/80">
                {isZh
                  ? '采购沟通、样品确认、对账单和活动通知都会集中发送到注册邮箱。建议直接使用常用商务邮箱，方便后续协作。'
                  : 'Sampling updates, invoices and sourcing notifications all stay in the registered mailbox, which makes follow-up collaboration simpler.'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-2xl lg:p-7">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 lg:text-3xl">
                {step === 1 ? (isZh ? '邮箱注册' : 'Email Signup') : isZh ? '验证邮箱' : 'Verify Email'}
              </h2>
              <p className="text-sm text-gray-600 lg:text-base">
                {step === 1
                  ? isZh
                    ? '使用邮箱快速创建采购账号'
                    : 'Create your sourcing account with email first'
                  : isZh
                    ? '请输入发送到邮箱的验证码'
                    : 'Enter the verification code sent to your email'}
              </p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              {[
                {
                  stepNumber: '1',
                  title: isZh ? '填写邮箱' : 'Enter Email',
                  subtitle: isZh ? '账号信息' : 'Account Info',
                },
                {
                  stepNumber: '2',
                  title: isZh ? '验证邮箱' : 'Verify Email',
                  subtitle: isZh ? '完成注册' : 'Complete Signup',
                },
              ].map((item, index) => {
                const isActive = step >= index + 1;

                return (
                  <div
                    key={item.stepNumber}
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      isActive ? 'border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-sm' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                            : 'border border-gray-200 bg-white text-gray-400'
                        }`}
                      >
                        {item.stepNumber}
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-red-600' : 'text-gray-400'}`}>
                        {isActive ? (isZh ? '当前' : 'Current') : isZh ? '待处理' : 'Pending'}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{item.title}</p>
                    <p className={`mt-1 text-xs ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>{item.subtitle}</p>
                  </div>
                );
              })}
            </div>

            {step === 2 ? (
              <div className="mb-5 rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 p-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-sm font-semibold text-red-700">
                      {isZh ? '验证邮件已发送' : 'Verification email sent'}
                    </p>
                    <p className="break-all text-sm text-gray-700">{formData.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-500"
                  >
                    {isZh ? '修改邮箱' : 'Change email'}
                  </button>
                </div>
              </div>
            ) : null}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                      {isZh ? '邮箱地址 *' : 'Email Address *'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">✉️</span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={isZh ? '请输入您的邮箱，如 buyer@example.com' : 'Enter your email, such as buyer@example.com'}
                        className="w-full rounded-xl border border-gray-300 py-3.5 pl-12 pr-4 text-base focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      {isZh
                        ? '我们会向该邮箱发送 6 位验证码，用于完成注册验证。'
                        : 'We will send a 6-digit verification code to this email address.'}
                    </p>
                  </div>

                  <div>
                    <label htmlFor="businessType" className="mb-2 block text-sm font-semibold text-gray-700">
                      {isZh ? '您是？ *' : 'Your Role *'}
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      value={formData.businessType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">{isZh ? '请选择您的身份' : 'Select your business role'}</option>
                      <option value="retailer">{isZh ? '零售商/采购商' : 'Retailer/Buyer'}</option>
                      <option value="supplier">{isZh ? '供应商/厂家' : 'Supplier/Manufacturer'}</option>
                      <option value="both">{isZh ? '既是采购商也是供应商' : 'Both buyer and supplier'}</option>
                    </select>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-0.5 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="agreeTerms" className="ml-3 block text-xs leading-6 text-gray-700">
                      {isZh ? '我已阅读并同意' : 'I have read and agree to'}{' '}
                      <Link href="/terms" className="font-medium text-red-600 hover:text-red-500">
                        {isZh ? '服务协议' : 'Terms'}
                      </Link>{' '}
                      {isZh ? '和' : 'and'}{' '}
                      <Link href="/privacy" className="font-medium text-red-600 hover:text-red-500">
                        {isZh ? '隐私政策' : 'Privacy Policy'}
                      </Link>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="verificationCode" className="mb-2 block text-sm font-semibold text-gray-700">
                      {isZh ? '验证码 *' : 'Verification Code *'}
                    </label>

                    <div className="mb-4 grid grid-cols-6 gap-2">
                      {Array.from({ length: 6 }).map((_, index) => {
                        const digit = formData.verificationCode[index] ?? '';

                        return (
                          <div
                            key={index}
                            className={`flex h-12 items-center justify-center rounded-xl border text-base font-bold transition-all ${
                              digit ? 'border-red-300 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-gray-300'
                            }`}
                          >
                            {digit || '•'}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex space-x-3">
                      <input
                        id="verificationCode"
                        name="verificationCode"
                        type="text"
                        required
                        maxLength={6}
                        value={formData.verificationCode}
                        onChange={handleChange}
                        placeholder={isZh ? '请输入6位验证码' : 'Enter 6-digit code'}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base tracking-[0.25em] focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={handleResendCode}
                        className="whitespace-nowrap rounded-xl border-2 border-red-600 px-6 py-3 font-semibold text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {countdown > 0 ? `${countdown}s` : isZh ? '重新发送' : 'Resend'}
                      </button>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                      {isZh ? `验证码已发送至 ${formData.email}` : `Code sent to ${formData.email}`}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3.5 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                {step === 1 ? (isZh ? '发送邮箱验证码' : 'Send Verification Code') : isZh ? '完成注册' : 'Complete Signup'}
              </button>

              {step === 1 ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {isZh ? '已有账号？' : 'Already have an account?'}{' '}
                    <Link href="/login" className="font-semibold text-red-600 hover:text-red-500">
                      {isZh ? '立即登录' : 'Log in now'}
                    </Link>
                  </p>
                </div>
              ) : null}
            </form>

            <p className="mt-6 text-center text-[11px] leading-5 text-gray-400">
              {isZh
                ? '继续注册即表示您同意平台发送与账号安全、订单进展和供应商动态相关的邮件通知。'
                : 'Continuing means you agree to receive email notifications related to account security, order progress and supplier updates.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
