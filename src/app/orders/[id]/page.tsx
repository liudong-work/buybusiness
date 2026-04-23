import { StructuredData } from '@/components/seo/StructuredData';
import OrderDetailPageClient from '@/components/pages/OrderDetailPageClient';
import { buildBreadcrumbStructuredData, buildMetadata } from '@/lib/seo';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata = buildMetadata({
  title: 'Order Detail',
  description:
    'Review the details, items, and follow-up context for a submitted wholesale order from the buyer workspace.',
  path: '/orders',
  keywords: ['order detail', 'wholesale order item list', 'buyer order detail'],
});

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
          { name: 'Orders', path: '/orders' },
          { name: params.id, path: `/orders/${params.id}` },
        ])}
      />
      <OrderDetailPageClient orderId={params.id} />
    </>
  );
}
