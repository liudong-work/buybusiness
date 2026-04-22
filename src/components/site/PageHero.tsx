import { ReactNode } from 'react';

interface HeroStat {
  label: string;
  value: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  stats?: HeroStat[];
  actions?: ReactNode;
}

export function PageHero({ eyebrow, title, description, stats = [], actions }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-orange-100 bg-[linear-gradient(135deg,_#fff7ed_0%,_#fffaf5_34%,_#ffffff_68%,_#fafaf9_100%)] pt-28 pb-14 md:pt-32 md:pb-16">
      <div className="absolute inset-0 opacity-90">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(251,146,60,0.08)_0%,transparent_26%,transparent_70%,rgba(194,65,12,0.08)_100%)]"></div>
        <div className="absolute left-[6%] top-10 h-24 w-24 rounded-[2rem] border border-orange-200/70 bg-orange-100/55"></div>
        <div className="absolute right-[8%] top-12 h-32 w-32 rounded-[2.4rem] border border-orange-100 bg-white/75"></div>
        <div className="absolute bottom-[-3rem] right-[18%] h-40 w-40 rounded-full bg-orange-200/40 blur-3xl"></div>
        <div className="absolute inset-y-0 left-[62%] hidden w-px bg-orange-100/80 lg:block"></div>
      </div>

      <div className="brand-section relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            {eyebrow ? <span className="brand-eyebrow mb-5">{eyebrow}</span> : null}
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-gray-950 md:text-5xl xl:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
              {description}
            </p>
            {actions ? <div className="mt-8 flex flex-wrap gap-4">{actions}</div> : null}
          </div>

          {stats.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="brand-card rounded-3xl p-5">
                  <div className="text-2xl font-semibold text-gray-950 md:text-3xl">{stat.value}</div>
                  <div className="mt-2 text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
