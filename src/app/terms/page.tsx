import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

const sections = [
  {
    title: '服务范围',
    content: '平台目前覆盖供应商浏览、商品展示、注册登录、联系咨询和采购清单等核心入口。后续逐步接入真实 API 后，可继续扩展为询盘、支付与订单履约系统。',
  },
  {
    title: '账户责任',
    content: '用户在注册和登录后需要妥善管理自己的账号凭证，并对账号下发生的行为负责。正式上线时，建议同步补充验证码、异常登录提醒和安全审计说明。',
  },
  {
    title: '内容说明',
    content: '当前部分品牌、商品和评价信息仍属于示意数据，主要用于视觉与交互验证。接入真实数据后，需要同步完善内容审核和纠错机制。',
  },
];

export default function TermsPage() {
  return (
    <div className="site-shell min-h-screen">
      <SiteNav />
      <PageHero
        eyebrow="Terms Of Service"
        title="服务协议"
        description="这里先保留平台范围、账户责任和内容说明等基础条款，后续可以继续补充正式法务内容。"
      />
      <section className="brand-section py-10">
        <div className="space-y-5">
          {sections.map((section, index) => (
            <Reveal key={section.title} delay={index * 60}>
              <div className="brand-card rounded-[2rem] p-8">
                <h2 className="text-2xl font-semibold text-gray-950">{section.title}</h2>
                <p className="mt-4 text-gray-600 leading-8">{section.content}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
