import { StructuredData } from '@/components/seo/StructuredData';
import CheckoutPageClient from '@/components/pages/CheckoutPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Wholesale Checkout',
  description:
    'Review your wholesale cart, complete checkout information, and submit a front-end order flow for sourcing and buying decisions.',
  path: '/checkout',
  keywords: ['wholesale checkout', 'B2B cart checkout', 'submit order', 'bulk purchase flow'],
});

export default function CheckoutPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Wholesale Checkout',
          description: 'Complete the final step of the front-end wholesale order flow.',
          path: '/checkout',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Cart', path: '/cart' },
          { name: 'Checkout', path: '/checkout' },
        ])}
      />
      <CheckoutPageClient />
    </>
  );
}
