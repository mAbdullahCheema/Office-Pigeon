import type { Metadata } from 'next';

import { FaqView } from '@/components/site/faq/FaqView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { faqCategories } from '@/lib/page-content';
import { getFaqs } from '@/lib/site-content';
import { routes } from '@/lib/routes';
import { breadcrumbs, faqPage, graph } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'The things everyone asks us first — getting started, products, the Academy, money and support.';

export const metadata: Metadata = pageMeta({
  path: routes.faq,
  title: 'FAQ',
  description,
});

export default async function FaqPage() {
  const faqs = await getFaqs();
  const seen = faqs.map((faq) => faq.category);
  const categories = faqCategories.filter((category) => seen.includes(category));

  /**
   * Built from the same rows the page renders, so an answer engine is quoting
   * the answer a visitor can see rather than a second copy that has drifted.
   */
  const schema = graph(
    faqPage({ name: 'FAQ — Office Pigeon', description, items: faqs }),
    breadcrumbs([{ name: 'FAQ', path: routes.faq }]),
  );

  return (
    <Shell active="faq">
      <JsonLd data={schema} />
      <FaqView faqs={faqs} categories={categories.length > 0 ? categories : faqCategories} />
    </Shell>
  );
}
