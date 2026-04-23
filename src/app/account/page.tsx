import { StructuredData } from '@/components/seo/StructuredData';
import AccountDashboardPageClient from '@/components/pages/AccountDashboardPageClient';
import {
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildMetadata,
} from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Buyer Workspace',
  description:
    'Review orders, inquiries, favorites, and cart activity from a unified buyer dashboard built for repeat wholesale workflows.',
  path: '/account',
  keywords: ['buyer dashboard', 'wholesale workspace', 'orders and inquiries', 'saved products'],
});

export default function AccountPage() {
  return (
    <>
      <StructuredData
        data={buildCollectionPageStructuredData({
          title: 'Buyer Workspace',
          description: 'A unified dashboard for orders, inquiries, favorites, and cart activity.',
          path: '/account',
        })}
      />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Buyer Workspace', path: '/account' },
        ])}
      />
      <AccountDashboardPageClient />
    </>
  );
}
