import { StructuredData } from '@/components/seo/StructuredData';
import RequestQuotePageClient from '@/components/pages/RequestQuotePageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Request A Wholesale Quote',
  description:
    'Submit a wholesale inquiry with quantity, target market, and sourcing notes so the platform can follow up with supplier matching and pricing.',
  path: '/request-quote',
  keywords: ['request quote', 'wholesale inquiry', 'B2B quote request', 'supplier inquiry'],
});

interface RequestQuotePageProps {
  searchParams?: {
    source?: string;
    quantity?: string;
    items?: string;
    brandId?: string;
    productId?: string;
  };
}

export default function RequestQuotePage({ searchParams = {} }: RequestQuotePageProps) {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Wholesale Quote Request',
          description: 'Submit a sourcing inquiry for products, brands, or a cart shortlist.',
          path: '/request-quote',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Request Quote', path: '/request-quote' },
        ])}
      />
      <RequestQuotePageClient searchParams={searchParams} />
    </>
  );
}
