import type { Metadata } from 'next';

import { ComingSoonView } from '@/components/site/products/ComingSoonView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { comingSoonProduct } from '@/lib/coming-soon';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, softwareApplication, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Menus costed to the portion, supplier shopping lists and prep sheets your kitchen can actually follow. Still in build — tell us how your kitchen plans a week.';

export const metadata: Metadata = pageMeta({
  path: routes.aiRecipes,
  title: 'AI Recipes — coming soon',
  description,
});

const schema = graph(
  webPage({ path: routes.aiRecipes, name: 'AI Recipes — coming soon — Office Pigeon', description }),
  breadcrumbs([
    { name: 'Products', path: routes.products },
    { name: 'AI Recipes', path: routes.aiRecipes },
  ]),
  softwareApplication({
    itemId: 'ai-recipes',
    name: 'AI Recipes',
    description,
    path: routes.aiRecipes,
    category: 'BusinessApplication',
  }),
);

export default function AiRecipesPage() {
  return (
    <Shell active="products">
      <JsonLd data={schema} />
      <ComingSoonView focus={comingSoonProduct('ai-recipes')!} />
    </Shell>
  );
}
