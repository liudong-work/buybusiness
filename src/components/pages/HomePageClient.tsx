'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mockBrands } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`animated-${delay}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      id={`animated-${delay}`}
      className={`transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const isZh = language === 'zh';

  return (
    <button
      type="button"
      onClick={() => setLanguage(isZh ? 'en' : 'zh')}
      className="flex items-center space-x-1 rounded-full border border-white/30 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-white/10"
    >
      <span className="text-base">{isZh ? '🇺🇸' : '🇨🇳'}</span>
      <span>{isZh ? 'EN' : '中文'}</span>
    </button>
  );
}

export default function HomePageClient() {
  const { t, language, setLanguage } = useLanguage();
  const isZh = language === 'zh';
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    {
      name: isZh ? '家居装饰' : 'Home Decor',
      subtitle: 'Home Decor',
      icon: '🏠',
      count: '12.5K',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: isZh ? '食品饮料' : 'Food & Drink',
      subtitle: 'Food & Drink',
      icon: '🍽️',
      count: '8.9K',
      color: 'from-orange-500 to-red-500',
    },
    {
      name: isZh ? '女装服饰' : 'Women',
      subtitle: 'Women',
      icon: '👗',
      count: '23.4K',
      color: 'from-pink-500 to-rose-500',
    },
    {
      name: isZh ? '美妆个护' : 'Beauty & Wellness',
      subtitle: 'Beauty & Wellness',
      icon: '💄',
      count: '15.6K',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      name: isZh ? '珠宝配饰' : 'Jewelry',
      subtitle: 'Jewelry',
      icon: '💎',
      count: '7.8K',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      name: isZh ? '母婴儿童' : 'Kids & Baby',
      subtitle: 'Kids & Baby',
      icon: '👶',
      count: '11.2K',
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: isZh ? '宠物用品' : 'Pets',
      subtitle: 'Pets',
      icon: '🐾',
      count: '5.6K',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      name: isZh ? '纸品文创' : 'Paper & Novelty',
      subtitle: 'Paper & Novelty',
      icon: '📝',
      count: '9.3K',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  const stats = [
    { number: '100K+', label: t('statSuppliers') },
    { number: '500万+', label: t('statProducts') },
    { number: '30万+', label: t('statRetailers') },
    { number: '50+', label: t('statCountries') },
  ];

  const values = [
    { icon: '🌱', label: t('valueSustainable'), count: '2.3K' },
    { icon: '🤝', label: t('valueFairTrade'), count: '1.8K' },
    { icon: '👩', label: t('valueWomenOwned'), count: '3.1K' },
    { icon: '🏠', label: t('valueLocalMade'), count: '4.5K' },
    { icon: '♻️', label: t('valueRecycled'), count: '1.2K' },
    { icon: '🌍', label: t('valueCarbonNeutral'), count: '890' },
    { icon: '🐾', label: t('valueCrueltyFree'), count: '1.5K' },
    { icon: '📦', label: t('valueOrganic'), count: '2.1K' },
    { icon: '🎨', label: t('valueHandmade'), count: '5.6K' },
    { icon: '💡', label: t('valueInnovative'), count: '3.8K' },
  ];

  const testimonials = [
    {
      quote: isZh
        ? '我们对社区、强大女性、加州美丽景观以及来自世界各地的美茶的热爱，都是我们品牌的灵感来源。'
        : "Our love for community, strong women, California's beautiful landscape, and beautiful teas from around the world inspire our brand.",
      name: 'Flowerhead Tea',
      role: isZh ? '茶叶品牌' : 'Tea Brand',
      location: isZh ? '洛杉矶，加利福尼亚' : 'Los Angeles, CA',
      avatar: '👩',
    },
    {
      quote: isZh
        ? '我们更容易发现新产品，并与能让店铺脱颖而出的品牌建立联系。外贸批发平台是我们业务增长的重要伙伴。'
        : 'We make it easier to discover new products and connect with brands that make the store stand out. Global Wholesale is a key partner in our growth.',
      name: 'Ivan Martinez & Christan Summers',
      role: isZh ? 'Tula House 联合创始人' : 'Co-founders, Tula House',
      location: isZh ? '布鲁克林，纽约' : 'Brooklyn, NY',
      avatar: '👨‍👩‍👧',
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <nav
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-white/95 shadow-lg backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500 transition-transform duration-300 group-hover:rotate-12">
                <span className="text-lg font-bold text-white">外</span>
              </div>
              <span className={`text-xl font-bold transition-colors ${scrollY > 50 ? 'text-gray-900' : 'text-white'}`}>
                {t('siteName')}
              </span>
            </Link>

            <div className="hidden items-center space-x-8 md:flex">
              {[
                { name: t('navHome'), href: '/' },
                { name: t('navBrands'), href: '/brands' },
                { name: t('navCategories'), href: '/categories' },
                { name: t('navAbout'), href: '/about' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-medium group ${
                    scrollY > 50 ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}

              <LanguageSwitcher />

              <Link
                href="/signup-simple"
                className="rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {t('signup')}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="rounded-lg p-2 md:hidden"
              aria-label="Open menu"
            >
              <div className="flex h-5 w-6 flex-col justify-between">
                {[0, 1, 2].map((line) => (
                  <span key={line} className={`h-0.5 w-full transition-all ${scrollY > 50 ? 'bg-gray-900' : 'bg-white'}`}></span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t bg-white md:hidden">
            <div className="space-y-3 px-4 py-4">
              {[
                { name: t('navHome'), href: '/' },
                { name: t('navBrands'), href: '/brands' },
                { name: t('navCategories'), href: '/categories' },
                { name: t('navAbout'), href: '/about' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 font-medium text-gray-700 hover:text-red-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-700">{isZh ? '语言' : 'Language'}</span>
                <button
                  type="button"
                  onClick={() => setLanguage(isZh ? 'en' : 'zh')}
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  <span>{isZh ? '🇺🇸' : '🇨🇳'}</span>
                  <span>{isZh ? 'EN' : '中文'}</span>
                </button>
              </div>

              <Link
                href="/signup-simple"
                className="block w-full rounded-lg bg-red-600 py-3 text-center font-semibold text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('signup')}
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-20 top-20 h-72 w-72 rounded-full bg-red-500 blur-3xl"></div>
            <div className="absolute right-20 top-40 h-72 w-72 rounded-full bg-orange-500 blur-3xl"></div>
            <div className="absolute bottom-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500 blur-3xl"></div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
              <span className="text-sm font-medium text-white/90">{t('heroBadge')}</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl">
              {t('heroTitle1')}
              <span className="block bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                {t('heroTitle2')}
              </span>
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-white/80 md:text-2xl">
              {t('heroSubtitle1')}
              <br />
              <span className="text-white/60">{t('heroSubtitle2')}</span>
            </p>

            <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup-simple"
                className="group flex items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {t('heroCta1')}
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/brands"
                className="group flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
              >
                {t('heroCta2')}
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="mb-2 text-3xl font-bold text-white md:text-4xl">{stat.number}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-red-600">{t('hotCategories')}</span>
              <h2 className="mt-2 mb-4 text-4xl font-bold text-gray-900 md:text-5xl">{t('categoriesTitle')}</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">{t('categoriesSubtitle')}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories.map((category, index) => (
              <AnimatedSection key={category.subtitle} delay={index * 100}>
                <Link
                  href={`/brands?category=${encodeURIComponent(category.subtitle)}`}
                  className="group relative block overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}></div>
                  <div
                    className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} text-3xl shadow-lg transition-all duration-300 group-hover:rotate-6 group-hover:scale-110`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="mb-1 text-center text-lg font-bold text-gray-900 transition-all group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-orange-500 group-hover:bg-clip-text group-hover:text-transparent">
                    {category.name}
                  </h3>
                  <p className="text-center text-sm text-gray-500">{category.subtitle}</p>
                  <p className="mt-2 text-center text-xs text-gray-400">
                    {category.count} {isZh ? '产品' : 'Products'}
                  </p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-red-600">{t('selectedSuppliers')}</span>
              <h2 className="mt-2 mb-4 text-4xl font-bold text-gray-900 md:text-5xl">{t('featuredBrands')}</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">{t('featuredBrandsSubtitle')}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {mockBrands.map((brand, index) => (
              <AnimatedSection key={brand.id} delay={index * 150}>
                <Link
                  href={`/brands/${brand.id}`}
                  className="group block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl transition-transform duration-500 group-hover:scale-125">🏭</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">{t('qualitySupplier')}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex items-center">
                      <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-orange-100 shadow-sm">
                        <span className="text-xl">🏢</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-red-600">{brand.name}</h3>
                        <p className="text-sm text-gray-500">{brand.location}</p>
                      </div>
                    </div>

                    <p className="mb-4 line-clamp-2 text-gray-600">{brand.description}</p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {brand.values.map((value) => (
                        <span
                          key={value}
                          className="rounded-full border border-red-100 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-1 text-xs font-medium text-red-700"
                        >
                          {value}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center">
                        <span className="mr-1 text-yellow-500">⭐</span>
                        <span className="font-semibold text-gray-900">{brand.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {brand.productCount} {isZh ? '产品' : 'Products'}
                      </span>
                      <span className="text-sm font-semibold text-red-600 transition-transform group-hover:translate-x-1">
                        {t('viewDetails')} →
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <div className="mt-12 text-center">
              <Link
                href="/brands"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {t('viewAllBrands')}
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-24 text-white">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">{t('valuesTitle')}</h2>
              <p className="mx-auto max-w-2xl text-xl text-white/70">{t('valuesSubtitle')}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {values.map((value, index) => (
              <AnimatedSection key={value.label} delay={index * 50}>
                <Link
                  href="/brands"
                  className="group block rounded-2xl border border-white/10 bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/20"
                >
                  <div className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110">{value.icon}</div>
                  <p className="mb-1 font-semibold text-white">{value.label}</p>
                  <p className="text-sm text-white/50">
                    {value.count} {t('suppliers')}
                  </p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="mb-16 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-red-600">{t('customerReviews')}</span>
              <h2 className="mt-2 mb-4 text-4xl font-bold text-gray-900 md:text-5xl">{t('testimonialsTitle')}</h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-600">{t('testimonialsSubtitle')}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((item, index) => (
              <AnimatedSection key={item.name} delay={index * 150}>
                <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-2xl">
                  <div className="absolute right-4 top-4 text-6xl font-serif text-gray-100">&quot;</div>
                  <p className="relative z-10 mb-6 italic leading-relaxed text-gray-600">{item.quote}</p>
                  <div className="flex items-center">
                    <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 shadow-lg">
                      <span className="text-2xl">{item.avatar}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.role}</p>
                      <p className="text-xs text-gray-400">{item.location}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-red-600 to-orange-500 py-24">
        <div className="max-w-7xl mx-auto px-4 text-center sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">{t('ctaTitle')}</h2>
            <p className="mx-auto mb-12 max-w-2xl text-xl text-white/90">{t('ctaSubtitle')}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/signup-simple"
                className="group rounded-full bg-white px-10 py-4 text-lg font-semibold text-red-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                {t('ctaButton')}
                <svg className="ml-2 inline-block h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/30 bg-white/20 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30"
              >
                {t('ctaContact')}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="bg-gray-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
                  <span className="text-lg font-bold text-white">外</span>
                </div>
                <span className="text-xl font-bold">{t('siteName')}</span>
              </div>
              <p className="mb-6 max-w-sm text-gray-400">{t('footerDescription')}</p>
              <div className="flex space-x-4">
                {['微信', '微博', '抖音'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-red-600"
                  >
                    <span className="text-sm">{item[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {[
              {
                title: t('footerBuyers'),
                links: [t('footerFreeSignup'), t('footerBrowseBrands'), t('footerBuyingGuide'), t('footerFAQ')],
              },
              {
                title: t('footerSuppliers'),
                links: [t('footerApply'), t('footerSupplierPortal'), t('footerOperationsGuide'), t('footerSuccessStories')],
              },
              {
                title: t('footerAbout'),
                links: [t('footerCompany'), t('footerContact'), t('footerJoinUs'), t('footerPrivacy')],
              },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="mb-4 font-semibold">{group.title}</h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
            <p className="text-sm text-gray-400">
              © 2024 {t('siteName')}. {t('footerRights')}.
            </p>
            <div className="mt-4 flex items-center space-x-6 md:mt-0">
              <span className="text-sm text-gray-400">{t('footerPaymentMethods')}：</span>
              <div className="flex space-x-3">
                {[t('alipay'), t('wechat'), t('unionpay')].map((item) => (
                  <span key={item} className="rounded bg-gray-800 px-3 py-1 text-xs text-gray-400">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
