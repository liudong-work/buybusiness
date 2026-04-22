'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitchProps {
  theme?: 'light' | 'dark';
}

export function LanguageSwitch({ theme = 'light' }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage();
  const isDark = theme === 'dark';
  const isZh = language === 'zh';

  return (
    <button
      type="button"
      onClick={() => setLanguage(isZh ? 'en' : 'zh')}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
        isDark
          ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
          : 'border-orange-200 bg-white/88 text-gray-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] hover:border-orange-300 hover:bg-white'
      }`}
      aria-label={isZh ? 'Switch to English' : '切换到中文'}
    >
      <span className="text-base">{isZh ? '🇺🇸' : '🇨🇳'}</span>
      <span>{isZh ? 'EN' : '中文'}</span>
    </button>
  );
}
