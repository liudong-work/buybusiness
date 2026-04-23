import { StructuredData } from '@/components/seo/StructuredData';
import FavoritesPageClient from '@/components/pages/FavoritesPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Saved Products And Brands',
  description:
    'Review favorited products and brands from a unified buyer favorites page designed for repeat sourcing decisions.',
  path: '/favorites',
  keywords: ['favorites', 'saved brands', 'saved products', 'wholesale shortlist'],
});

export default function FavoritesPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Favorites',
          description: 'A saved list of shortlisted products and brands for buyer revisit flows.',
          path: '/favorites',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
          { name: 'Favorites', path: '/favorites' },
        ])}
      />
      <FavoritesPageClient />
    </>
  );
}
