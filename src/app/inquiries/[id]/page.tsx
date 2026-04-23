import { StructuredData } from '@/components/seo/StructuredData';
import InquiryDetailPageClient from '@/components/pages/InquiryDetailPageClient';
import { buildBreadcrumbStructuredData, buildMetadata } from '@/lib/seo';

interface InquiryDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata = buildMetadata({
  title: 'Inquiry Detail',
  description:
    'Review the details, line items, and status timeline for a submitted wholesale inquiry.',
  path: '/inquiries',
  keywords: ['inquiry detail', 'RFQ detail', 'wholesale inquiry tracking'],
});

export default function InquiryDetailPage({ params }: InquiryDetailPageProps) {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
          { name: 'Inquiries', path: '/inquiries' },
          { name: params.id, path: `/inquiries/${params.id}` },
        ])}
      />
      <InquiryDetailPageClient inquiryId={params.id} />
    </>
  );
}
