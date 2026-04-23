import { StructuredData } from '@/components/seo/StructuredData';
import InquiriesPageClient from '@/components/pages/InquiriesPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'My Wholesale Inquiries',
  description:
    'Review submitted wholesale inquiries, track sourcing requests, and continue the follow-up flow from product discovery to quote management.',
  path: '/inquiries',
  keywords: ['my inquiries', 'wholesale quote list', 'RFQ tracking', 'B2B inquiry management'],
});

interface InquiriesPageProps {
  searchParams?: {
    created?: string;
  };
}

export default function InquiriesPage({ searchParams = {} }: InquiriesPageProps) {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Wholesale Inquiry List',
          description: 'Review submitted inquiries and continue the supplier follow-up process.',
          path: '/inquiries',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'My Inquiries', path: '/inquiries' },
        ])}
      />
      <InquiriesPageClient createdId={searchParams.created} />
    </>
  );
}
