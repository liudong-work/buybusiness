import { StructuredData } from '@/components/seo/StructuredData';
import ComparePageClient from '@/components/pages/ComparePageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Compare Products And Brands',
  description:
    'Compare shortlisted wholesale products and supplier brands side by side across price, MOQ, ratings, categories, and values.',
  path: '/compare',
  keywords: ['compare products', 'compare brands', 'wholesale comparison', 'supplier comparison'],
});

export default function ComparePage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Compare',
          description: 'A front-end comparison panel for products and brands.',
          path: '/compare',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
          { name: 'Compare', path: '/compare' },
        ])}
      />
      <ComparePageClient />
    </>
  );
}
