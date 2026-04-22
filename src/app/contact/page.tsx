'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Mail, MessageSquare, Phone, Send, Timer } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

type FormData = {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  inquiryType: string;
};

const contactMethods = [
  { icon: Mail, title: '邮件支持', value: 'support@faireclone.com', description: '适合报价、订单与平台问题' },
  { icon: Phone, title: '电话咨询', value: '+86 400-888-9999', description: '适合紧急沟通与商务介绍' },
  { icon: MessageSquare, title: '在线协助', value: '联系平台顾问', description: '适合前期采购方向沟通' },
  { icon: Building2, title: '办公地点', value: '上海 · 旧金山 · 伦敦', description: '支持跨时区业务协作' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });
      window.setTimeout(() => setSubmitSuccess(false), 4000);
    }, 1000);
  };

  return (
    <div className="site-shell min-h-screen">
      <SiteNav activePath="/contact" />

      <PageHero
        eyebrow="Contact & Support"
        title="联系我们，获取采购支持与平台帮助"
        description="把核心联系方式和表单入口放在一起，方便继续承接报价咨询、合作沟通和平台支持。"
        stats={[
          { label: '支持方式', value: '4' },
          { label: '工作时区', value: 'CN / US / UK' },
          { label: '典型回复', value: '< 24h' },
          { label: '适合场景', value: 'B2B' },
        ]}
      />

      <section className="brand-section py-10">
        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="space-y-6">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Reveal key={method.title} delay={index * 60}>
                  <div className="brand-card rounded-[2rem] p-6">
                    <Icon className="mb-4 h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-950">{method.title}</h2>
                    <p className="mt-2 text-sm font-semibold text-blue-700">{method.value}</p>
                    <p className="mt-3 text-sm leading-6 text-gray-600">{method.description}</p>
                  </div>
                </Reveal>
              );
            })}

            <Reveal delay={260}>
              <div className="rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#14213d] to-[#1e3a8a] p-6 text-white">
                <Timer className="mb-4 h-6 w-6 text-blue-300" />
                <h2 className="text-xl font-semibold">工作时间</h2>
                <p className="mt-3 text-white/65 leading-7">
                  周一至周五 9:00 - 18:00。当前是演示版本，后续接入真实系统时可以扩展为工单、邮件通知和在线会话。
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <div className="brand-card rounded-[2rem] p-8 lg:p-10">
              <div className="mb-8">
                <p className="brand-eyebrow mb-4">Send A Message</p>
                <h2 className="text-3xl font-semibold text-gray-950">发送消息</h2>
                <p className="mt-3 text-gray-600">保留最核心的沟通字段，方便后续继续接入邮件、工单或 CRM 系统。</p>
              </div>

              {submitSuccess ? (
                <div className="rounded-[1.6rem] border border-blue-100 bg-blue-50 p-5 text-blue-700">
                  消息已提交成功。当前为演示模式，后续可以直接把这里接到邮件、工单或 CRM 系统。
                </div>
              ) : null}

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="text-sm font-semibold text-gray-700">
                    姓名
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      placeholder="请输入您的姓名"
                      required
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    邮箱
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
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
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                      placeholder="请输入公司名称"
                    />
                  </label>
                  <label className="text-sm font-semibold text-gray-700">
                    咨询类型
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="general">一般咨询</option>
                      <option value="retailer">采购支持</option>
                      <option value="supplier">供应商合作</option>
                      <option value="technical">技术支持</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-semibold text-gray-700">
                  主题
                  <input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="请简要说明需求"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  详细消息
                  <textarea
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 font-normal text-gray-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                    placeholder="描述您的采购问题、合作需求或希望了解的内容"
                    required
                  ></textarea>
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-500">提交后我们会通过邮箱回复，后续也适合直接接入工单系统。</p>
                  <button className="brand-button-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '发送中...' : '发送消息'}
                    <Send className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
