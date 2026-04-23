import { StructuredData } from '@/components/seo/StructuredData';
import BrandsPageClient from '@/components/pages/BrandsPageClient';
import { mockBrands } from '@/lib/mockData';
import {
  buildCollectionPageStructuredData,
  buildMetadata,
  buildBreadcrumbStructuredData,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Supplier Directory for Wholesale Buyers',
  description:
    'Browse featured wholesale suppliers, filter by category and values, and move from supplier discovery to product evaluation faster.',
  path: '/brands',
  keywords: [
    'supplier directory',
    'wholesale suppliers',
    'B2B supplier marketplace',
    'brand discovery',
  ],
});

export default function BrandsPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Wholesale Supplier Directory',
          description: `Browse ${mockBrands.length} featured supplier profiles for category-led wholesale discovery.`,
          path: '/brands',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Supplier Directory', path: '/brands' },
        ])}
      />
      <BrandsPageClient />
    </>
  );
}
