import { BRAND } from '@/src/config';
import type { FAQItem, Package } from '@/src/types';
import { SITE_URL } from '@/lib/site/routes';

/**
 * JSON-LD structured-data builders (SEO-04). Plain-object generators, sourced
 * from the single content source (`src/config.ts`). Render with
 * <script type="application/ld+json"> (see app components). Phase 3.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const LOGO_URL = `${SITE_URL}/logos/office-pigeon-icon.svg`;

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: BRAND.name,
    url: SITE_URL,
    logo: LOGO_URL,
    slogan: BRAND.slogan,
    email: BRAND.email,
    telephone: BRAND.phone,
    sameAs: [
      'https://www.linkedin.com/company/office-pigeon/',
      BRAND.instagramUrl,
    ],
  };
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#business`,
    name: BRAND.name,
    url: SITE_URL,
    image: LOGO_URL,
    logo: LOGO_URL,
    email: BRAND.email,
    telephone: BRAND.phone,
    description: BRAND.footerWording,
    priceRange: '$$',
    areaServed: 'Worldwide',
    parentOrganization: { '@id': ORG_ID },
  };
}

export function faqPageJsonLd(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

/**
 * Service + nested Offers for a service page, sourced from config Packages.
 * Prices in config are human strings (e.g. "$500", "Starting at $1,400"); we
 * pass them through as offer descriptions rather than fabricating numeric
 * price/priceCurrency we can't guarantee.
 */
export function serviceJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  packages: Package[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: opts.name,
    provider: { '@id': ORG_ID },
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: opts.name,
      itemListElement: opts.packages.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        description: `${p.bestFor} — ${p.price}`,
      })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === '/' ? '' : it.path}`,
    })),
  };
}
