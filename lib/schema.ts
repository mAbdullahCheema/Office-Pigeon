import { catalog } from './catalog';
import { contactPoints, routes } from './routes';
import { siteUrl } from './supabase/config';

/**
 * Structured data, in one place.
 *
 * Two audiences read this and they want different things. A search engine wants
 * the entity graph — who publishes the page, what it sells, where it sits in the
 * site. An answer engine wants the same facts flat enough to quote: a price with
 * a currency next to it, a question with its answer attached, a service with the
 * plans that make it up.
 *
 * Both are served by emitting one `@graph` per page rather than a pile of
 * disconnected blocks, and by never stating here anything the page does not say
 * out loud. Every price below is read from `lib/catalog.ts`, the same source the
 * pricing table renders from, so the two cannot drift apart.
 */

export const ORG_ID = `${siteUrl}/#organization`;
export const SITE_ID = `${siteUrl}/#website`;

/** A site-absolute URL, without the trailing slash the root would otherwise gain. */
export function abs(path: string): string {
  return `${siteUrl}${path === '/' ? '' : path}`;
}

type Node = Record<string, unknown>;

/** Wraps the nodes a page contributes into the single graph it embeds. */
export function graph(...nodes: (Node | null | undefined)[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes.filter(Boolean),
  };
}

/**
 * The publisher. Referenced by `@id` from every other node rather than repeated,
 * which is what lets a crawler merge the pages into one entity instead of
 * treating each page's organization as a separate company.
 */
export function organization(): Node {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Office Pigeon',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon-512.png`,
      width: 512,
      height: 512,
    },
    image: `${siteUrl}/opengraph-image`,
    slogan: 'We automate your success',
    description:
      'Websites, chatbots, AI calling agents and automations, built and run for small businesses, plus an academy teaching students in sixteen countries.',
    email: contactPoints.email,
    telephone: contactPoints.phone,
    areaServed: 'Worldwide',
    knowsAbout: [
      'AI chatbots',
      'Retrieval augmented generation',
      'AI voice agents',
      'Business process automation',
      'Web development',
      'AI engineering education',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: contactPoints.phone,
        email: contactPoints.email,
        url: abs(routes.contact),
        availableLanguage: ['English', 'Urdu'],
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        url: contactPoints.demoCall,
        availableLanguage: ['English', 'Urdu'],
      },
    ],
  };
}

export function website(): Node {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: siteUrl,
    name: 'Office Pigeon',
    description:
      'Done-for-you AI websites, chatbots, calling agents and automations, four AI products, and a global academy.',
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };
}

/**
 * The page itself, tied back to the site.
 *
 * An answer engine that quotes a fact wants a URL to attribute it to, and a
 * `WebPage` node with `isPartOf` is what turns "this text" into "this text, on
 * this page, published by this organization".
 */
export function webPage({
  path,
  name,
  description,
  type = 'WebPage',
}: {
  path: string;
  name: string;
  description: string;
  /** `FAQPage`, `ContactPage`, `AboutPage`, `CollectionPage` where one fits. */
  type?: string;
}): Node {
  return {
    '@type': type,
    '@id': `${abs(path)}#webpage`,
    url: abs(path),
    name,
    description,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    primaryImageOfPage: `${siteUrl}/opengraph-image`,
  };
}

/**
 * The trail from the homepage down to this page.
 *
 * The site has no visible breadcrumb bar; this is the machine-readable version,
 * and it is what puts a path rather than a bare URL under a search result.
 */
export function breadcrumbs(trail: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: routes.home }, ...trail].map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

/**
 * Turns a catalog entry's plans into offers.
 *
 * `price` is the number the plan leads with and `unit` is the rest of the
 * sentence — "one-time + $49/mo" — so the unit goes into the offer description
 * rather than being folded into the number, where it would claim a monthly
 * service costs $500 once.
 */
function offersFor(itemId: string): Node | undefined {
  const item = catalog.find((entry) => entry.id === itemId);
  if (!item || item.plans.length === 0) return undefined;

  const prices = item.plans.map((plan) => plan.price);

  /**
   * The four products are still in build and `/order` filters them out, so
   * they are pre-order rather than in stock and there is no order URL to send
   * a buyer to. Services and Academy places are orderable today.
   */
  const preOrder = item.group === 'Products';

  return {
    '@type': 'AggregateOffer',
    priceCurrency: 'USD',
    lowPrice: Math.min(...prices),
    highPrice: Math.max(...prices),
    offerCount: item.plans.length,
    availability: preOrder ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    offers: item.plans.map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.price,
      priceCurrency: 'USD',
      description: `${plan.unit} — ${plan.note}`,
      availability: preOrder ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
      url: preOrder ? abs(routes.products) : abs(routes.order),
      seller: { '@id': ORG_ID },
    })),
  };
}

/** One of the four done-for-you services. */
export function service({
  itemId,
  name,
  description,
  path,
  serviceType,
}: {
  /** Id in `lib/catalog.ts`, so the offers stay the ones the site charges. */
  itemId: string;
  name: string;
  description: string;
  path: string;
  serviceType: string;
}): Node {
  return {
    '@type': 'Service',
    '@id': `${abs(path)}#service`,
    name,
    description,
    serviceType,
    url: abs(path),
    provider: { '@id': ORG_ID },
    areaServed: 'Worldwide',
    offers: offersFor(itemId),
  };
}

/**
 * One of the four products.
 *
 * All four are still in build, so `sellable` defaults to false and the offers
 * are left off: a price marked `InStock` for something nobody can buy yet is
 * the kind of claim that costs a site its rich results, and it would not be
 * true. Flip it on for a product the moment the page can take an order.
 */
export function softwareApplication({
  itemId,
  name,
  description,
  path,
  category = 'BusinessApplication',
  sellable = false,
}: {
  itemId: string;
  name: string;
  description: string;
  path: string;
  category?: string;
  sellable?: boolean;
}): Node {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${abs(path)}#app`,
    name,
    description,
    url: abs(path),
    applicationCategory: category,
    operatingSystem: 'Web browser',
    publisher: { '@id': ORG_ID },
    offers: sellable ? offersFor(itemId) : undefined,
  };
}

/**
 * The question-and-answer pairs a page already renders.
 *
 * This is the single highest-leverage block for answer engines: it is the one
 * schema type that hands them a quotable answer with its question attached,
 * rather than a paragraph they have to infer the question for.
 */
export function faqPage({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: { question: string; answer: string }[];
}): Node {
  // One node, not two: an `FAQPage` carrying the questions *and* a `WebPage`
  // describing the same URL would be two competing descriptions of one page,
  // and a parser picking either one is a parser picking at random.
  return {
    ...webPage({ path: routes.faq, name, description, type: 'FAQPage' }),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** The whole catalog as one list, for the pricing page. */
export function offerCatalog(): Node {
  return {
    '@type': 'OfferCatalog',
    '@id': `${abs(routes.pricing)}#catalog`,
    name: 'Office Pigeon pricing',
    url: abs(routes.pricing),
    numberOfItems: catalog.length,
    itemListElement: catalog.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: item.name,
        description: item.blurb,
        category: item.group,
        brand: { '@id': ORG_ID },
        offers: offersFor(item.id),
      },
    })),
  };
}

/** The Academy, which is a school rather than a product line. */
export function educationalOrganization(): Node {
  return {
    '@type': 'EducationalOrganization',
    '@id': `${abs(routes.academy)}#academy`,
    name: 'Office Pigeon Academy',
    url: abs(routes.academy),
    description:
      'Live online classes for school students and a professional Applied AI Engineering track, taught one-to-one and in groups of up to six.',
    parentOrganization: { '@id': ORG_ID },
    email: contactPoints.email,
    telephone: contactPoints.phone,
  };
}
