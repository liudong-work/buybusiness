import { StructuredData } from '@/components/seo/StructuredData';
import HomePageClient from '@/components/pages/HomePageClient';
import {
  buildCollectionPageStructuredData,
  buildMetadata,
  buildOrganizationStructuredData,
  buildWebsiteStructuredData,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Global Wholesale Marketplace for Retail Buyers',
  description:
    'Discover wholesale suppliers, browse curated categories, and compare brands built for modern B2B sourcing teams.',
  path: '/',
  keywords: [
    'global wholesale marketplace',
    'retail supplier directory',
    'bulk product sourcing',
    'wholesale brands for retailers',
  ],
});

export default function HomePage() {
  return (
    <>
      <StructuredData data={buildWebsiteStructuredData()} />
      <StructuredData data={buildOrganizationStructuredData()} />
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'BuyBusiness Homepage',
          description:
            'A wholesale marketplace homepage focused on supplier discovery, category exploration, and B2B sourcing flow.',
          path: '/',
        })}
      />
      <HomePageClient />
    </>
  );
}
