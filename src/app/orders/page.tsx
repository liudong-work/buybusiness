import { StructuredData } from '@/components/seo/StructuredData';
import OrdersPageClient from '@/components/pages/OrdersPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'My Orders',
  description:
    'Track submitted wholesale orders, review order states, and revisit detailed order information from the buyer dashboard.',
  path: '/orders',
  keywords: ['my orders', 'wholesale order list', 'buyer order tracking', 'purchase history'],
});

export default function OrdersPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Wholesale Orders',
          description: 'A front-end order list for repeat buyer workflows.',
          path: '/orders',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
          { name: 'Orders', path: '/orders' },
        ])}
      />
      <OrdersPageClient />
    </>
  );
}
