import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

const faqItems = [
  {
    question: '平台现在能直接下单吗？',
    answer: '当前仍以前端原型和主流程体验验证为主，购物车、登录、注册和商品详情等都已经具备产品骨架，接下来再逐步接入真实交易能力。',
  },
  {
    question: '怎么从分类页找到同类供应商？',
    answer: '分类页已经和供应商页打通，进入某个类目后会自动带上对应 category 筛选条件，适合继续往品牌详情和商品详情深入。',
  },
  {
    question: '为什么有些数据看起来像示例？',
    answer: '当前供应商、商品和评价数据主要来自本地 mock 数据。这是为了先把信息架构、视觉系统和交互链路稳定下来，后续再切换到 API。',
  },
];

export default function FAQPage() {
  return (
    <div className="site-shell min-h-screen">
      <SiteNav />
      <PageHero
        eyebrow="FAQ"
        title="常见问题解答"
        description="集中查看平台当前能力、浏览方式和演示数据说明，方便更快理解整个采购流程。"
      />
      <section className="brand-section py-10">
        <div className="space-y-5">
          {faqItems.map((item, index) => (
            <Reveal key={item.question} delay={index * 60}>
              <div className="brand-card rounded-[2rem] p-8">
                <h2 className="text-2xl font-semibold text-gray-950">{item.question}</h2>
                <p className="mt-4 text-gray-600 leading-8">{item.answer}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
