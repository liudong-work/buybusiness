import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: {
    default: '外贸批发平台 - 连接中国供应商与全球零售商',
    template: '%s | 外贸批发平台'
  },
  description: '发现优质中国供应商，一站式批发采购。支持支付宝、微信支付，提供中文客服和便捷物流。连接全球零售商与中国制造。',
  keywords: '外贸批发,中国供应商,跨境电商,批发采购,阿里巴巴替代,中国制造,外贸平台',
  authors: [{ name: '外贸批发平台团队' }],
  creator: '外贸批发平台',
  publisher: '外贸批发平台',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://china-wholesale.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh-CN',
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://faire-clone.com',
    siteName: 'Faire Clone',
    title: 'Faire Clone - Global Wholesale Marketplace',
    description: 'Connect with wholesale suppliers worldwide for your retail business',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Faire Clone - Global Wholesale Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Faire Clone - Global Wholesale Marketplace',
    description: 'Connect with wholesale suppliers worldwide',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
