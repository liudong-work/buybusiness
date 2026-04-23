import type { Metadata } from 'next';
import type { Brand, Product } from '@/types';

const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3003';

export const siteConfig = {
  name: 'BuyBusiness',
  shortName: 'BuyBusiness',
  description:
    'Global wholesale marketplace for discovering suppliers, comparing product catalogs, and streamlining B2B sourcing decisions.',
  defaultLocale: 'en-US',
  siteUrl: defaultSiteUrl,
  keywords: [
    'wholesale marketplace',
    'bulk products',
    'business suppliers',
    'global sourcing',
    'B2B marketplace',
    'retail inventory sourcing',
    'wholesale home decor suppliers',
    'bulk beauty products',
  ],
  socialImage: '/og-image.jpg',
};

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.siteUrl).toString();
}

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
};

export function buildMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  image = siteConfig.socialImage,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const mergedKeywords = Array.from(new Set([...siteConfig.keywords, ...keywords]));

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      locale: siteConfig.defaultLocale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function buildWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: 'BuyBusiness Wholesale Marketplace',
    url: absoluteUrl('/'),
    description: siteConfig.description,
    inLanguage: ['en-US', 'zh-CN'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/brands')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/og-image.jpg'),
    description: siteConfig.description,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@faireclone.com',
        availableLanguage: ['English', 'Chinese'],
      },
    ],
  };
}

export function buildBreadcrumbStructuredData(
  items: Array<{ name: string; path: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildCollectionPageStructuredData({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: absoluteUrl('/'),
  };
}

export function buildBrandStructuredData(brand: Brand) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    description: brand.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: brand.location,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: brand.rating,
      reviewCount: Math.max(brand.productCount, 1),
    },
    knowsAbout: [brand.category, ...brand.values],
    url: absoluteUrl(`/brands/${brand.id}`),
  };
}

export function buildProductStructuredData(product: Product, brand: Brand) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    category: product.category,
    image: product.images.map((image) => absoluteUrl(image)),
    brand: {
      '@type': 'Brand',
      name: brand.name,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: absoluteUrl(`/products/${product.id}`),
      seller: {
        '@type': 'Organization',
        name: brand.name,
      },
      eligibleQuantity: {
        '@type': 'QuantitativeValue',
        minValue: product.minOrderQuantity,
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };
}

export function buildFaqStructuredData(
  items: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
