import { StructuredData } from '@/components/seo/StructuredData';
import CheckoutSuccessPageClient from '@/components/pages/CheckoutSuccessPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Order Submitted',
  description:
    'Review the submitted wholesale order confirmation and continue from checkout into follow-up, inquiries, and supplier discovery.',
  path: '/checkout/success',
  keywords: ['order success', 'wholesale order submitted', 'checkout confirmation'],
});

interface CheckoutSuccessPageProps {
  searchParams?: {
    order?: string;
  };
}

export default function CheckoutSuccessPage({
  searchParams = {},
}: CheckoutSuccessPageProps) {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Order Success',
          description: 'Confirmation page for the front-end wholesale checkout flow.',
          path: '/checkout/success',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Cart', path: '/cart' },
          { name: 'Checkout', path: '/checkout' },
          { name: 'Success', path: '/checkout/success' },
        ])}
      />
      <CheckoutSuccessPageClient
        orderId={searchParams.order}
      />
    </>
  );
}
