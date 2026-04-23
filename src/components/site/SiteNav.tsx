'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCartItemCount, subscribeCartUpdates } from '@/lib/cart';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitch } from '@/components/site/LanguageSwitch';

interface SiteNavProps {
  activePath?: string;
}

const navItems = [
  { zh: '首页', en: 'Home', href: '/' },
  { zh: '供应商', en: 'Brands', href: '/brands' },
  { zh: '分类', en: 'Categories', href: '/categories' },
  { zh: '买家工作台', en: 'Workspace', href: '/account' },
  { zh: '我的询盘', en: 'Inquiries', href: '/inquiries' },
  { zh: '关于我们', en: 'About', href: '/about' },
  { zh: '联系我们', en: 'Contact', href: '/contact' },
];

export function SiteNav({ activePath = '' }: SiteNavProps) {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [scrollY, setScrollY] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncCartCount = () => setCartCount(getCartItemCount());
    syncCartCount();
    return subscribeCartUpdates(syncCartCount);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b border-white/40 transition-all duration-300 ${
        scrollY > 24
          ? 'bg-white/86 backdrop-blur-xl shadow-[0_14px_45px_rgba(15,23,42,0.08)]'
          : 'bg-white/62 backdrop-blur-lg'
      }`}
    >
      <div className="brand-section">
        <div className="flex h-18 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 via-red-600 to-orange-400 text-white shadow-[0_14px_26px_rgba(194,65,12,0.25)] transition-transform duration-300 group-hover:rotate-6">
              <span className="text-lg font-bold">外</span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-orange-700/75">
                {isZh ? 'Global Wholesale' : 'Cross-Border Sourcing'}
              </p>
              <p className="text-base font-semibold text-gray-900">{isZh ? '外贸批发平台' : 'Global Wholesale'}</p>
            </div>
          </Link>

          <div className="flex items-center gap-3 lg:gap-5">
            <div className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => {
                const isActive = activePath === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-sm font-semibold transition-colors ${
                      isActive ? 'text-orange-700' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {isZh ? item.zh : item.en}
                    <span
                      className={`absolute -bottom-2 left-0 h-0.5 rounded-full bg-orange-600 transition-all ${
                        isActive ? 'w-full' : 'w-0'
                      }`}
                    ></span>
                  </Link>
                );
              })}
              <Link href="/cart" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                {isZh ? '购物车' : 'Cart'}{cartCount > 0 ? ` (${cartCount})` : ''}
              </Link>
            </div>

            <LanguageSwitch />

            <Link href="/signup-simple" className="hidden brand-button-primary px-5 py-2.5 text-sm sm:inline-flex">
              {isZh ? '免费注册' : 'Sign Up Free'}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
