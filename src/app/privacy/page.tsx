import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

const sections = [
  {
    title: '信息收集范围',
    content: '当前原型站点主要展示注册、联系、登录等表单入口。后续若接入真实后端，平台将围绕账户资料、联系方式、公司信息和采购行为建立正式的数据收集说明。',
  },
  {
    title: '信息使用方式',
    content: '信息会用于账号认证、采购沟通、订单提醒、平台通知和售后支持。后续一旦接入真实数据层，应同步把用途和保留周期写得更完整。',
  },
  {
    title: '安全建议',
    content: '正式上线前建议补充 HTTPS、敏感字段脱敏、权限控制、日志审计和删除流程。当前这一页主要用于先把产品链路中的协议入口承接起来。',
  },
];

export default function PrivacyPage() {
  return (
    <div className="site-shell min-h-screen">
      <SiteNav />
      <PageHero
        eyebrow="Privacy Policy"
        title="隐私说明也应该属于同一套产品视觉体系"
        description="这页现在不再像临时补的协议页，而是和站点保持一致的层级、留白和信息表达，后续也方便继续扩写正式法务内容。"
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
