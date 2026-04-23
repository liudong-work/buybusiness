import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { StructuredData } from '@/components/seo/StructuredData';
import {
  buildMetadata,
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
  siteConfig,
} from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'BuyBusiness Wholesale Marketplace',
    description: siteConfig.description,
    path: '/',
  }),
  title: {
    default: 'BuyBusiness Wholesale Marketplace',
    template: '%s | BuyBusiness',
  },
  authors: [{ name: 'BuyBusiness Team' }],
  creator: '外贸批发平台',
  publisher: 'BuyBusiness',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.siteUrl),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
      'en-US': '/',
    },
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
        <StructuredData data={buildWebsiteStructuredData()} />
        <StructuredData data={buildOrganizationStructuredData()} />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
