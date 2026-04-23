import type { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import ProductPageClient from '@/components/pages/ProductPageClient';
import { getBrandById, getProductById } from '@/lib/mockData';
import {
  buildBreadcrumbStructuredData,
  buildMetadata,
  buildProductStructuredData,
} from '@/lib/seo';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNav } from '@/components/site/SiteNav';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductById(params.id);
  const brand = product ? getBrandById(product.brandId) : null;

  if (!product || !brand) {
    return buildMetadata({
      title: 'Product Not Found',
      description: 'The requested wholesale product could not be found in the current catalog.',
      path: `/products/${params.id}`,
    });
  }

  return buildMetadata({
    title: `${product.name} | ${brand.name}`,
    description: `${product.description} Review MOQ, supplier details, price, and sourcing context before adding this wholesale item to your cart.`,
    path: `/products/${product.id}`,
    keywords: [product.category, brand.name, ...product.tags],
  });
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductById(params.id);
  const brand = product ? getBrandById(product.brandId) : null;

  if (!product || !brand) {
    return (
      <div className="site-shell min-h-screen">
        <SiteNav activePath="/brands" />
        <section className="brand-section flex min-h-[70vh] items-center justify-center pt-28">
          <div className="brand-card rounded-[2rem] p-12 text-center">
            <h1 className="text-3xl font-semibold text-gray-950">商品未找到</h1>
            <p className="mt-4 text-gray-600">当前链接没有命中有效商品，你可以先回到供应商目录或品牌详情继续浏览。</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/brands" className="brand-button-primary">浏览供应商</Link>
              <Link href="/" className="brand-button-secondary">返回首页</Link>
            </div>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <>
      <StructuredData data={buildProductStructuredData(product, brand)} />
      <StructuredData
        data={buildBreadcrumbStructuredData([
          { name: 'Home', path: '/' },
          { name: 'Supplier Directory', path: '/brands' },
          { name: brand.name, path: `/brands/${brand.id}` },
          { name: product.name, path: `/products/${product.id}` },
        ])}
      />
      <ProductPageClient product={product} brand={brand} />
    </>
  );
}
