import { StructuredData } from '@/components/seo/StructuredData';
import RecentlyViewedPageClient from '@/components/pages/RecentlyViewedPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Recently Viewed',
  description:
    'Review recently viewed wholesale products and brands so repeat sourcing sessions can resume faster.',
  path: '/recently-viewed',
  keywords: ['recently viewed', 'wholesale history', 'product revisit', 'brand revisit'],
});

export default function RecentlyViewedPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Recently Viewed',
          description: 'A revisit page for recently viewed products and brands.',
          path: '/recently-viewed',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
          { name: 'Recently Viewed', path: '/recently-viewed' },
        ])}
      />
      <RecentlyViewedPageClient />
    </>
  );
}
