import { routes } from './routes';

/**
 * The four products while they are being finished. Nothing about them is for
 * sale yet, so the site says one line each and no more — the products page,
 * the four product routes, the homepage strip and the pricing tab all read
 * this list rather than the sellable catalog.
 */

export type ComingSoonProduct = {
  itemId: string;
  name: string;
  icon: string;
  tint: string;
  accent: string;
  audience: string;
  line: string;
  page: string;
};

export const comingSoonProducts: ComingSoonProduct[] = [
  {
    itemId: 'smart-school-os',
    name: 'Smart School OS',
    icon: '🎓',
    tint: '#EEEBFE',
    accent: '#5A48D6',
    audience: 'Schools & academies',
    line: 'Admissions, attendance, fees and report cards in one system.',
    page: routes.smartSchool,
  },
  {
    itemId: 'ai-finance',
    name: 'AI Finance',
    icon: '📊',
    tint: '#E9FBF3',
    accent: '#0F9C6E',
    audience: 'Owners & accountants',
    line: 'Books that reconcile themselves and answer cash-flow questions.',
    page: routes.aiFinance,
  },
  {
    itemId: 'ai-whiteboard',
    name: 'AI Whiteboard',
    icon: '🖍️',
    tint: '#FFF4D8',
    accent: '#E8A100',
    audience: 'Teachers & trainers',
    line: 'A teaching canvas that draws, explains and saves the lesson.',
    page: routes.whiteboard,
  },
  {
    itemId: 'ai-recipes',
    name: 'AI Recipes',
    icon: '🍳',
    tint: '#FFEDE3',
    accent: '#E8480F',
    audience: 'Kitchens & cafés',
    line: 'Menus, portion costs and supplier shopping lists.',
    page: routes.aiRecipes,
  },
];

export function comingSoonProduct(itemId: string): ComingSoonProduct | null {
  return comingSoonProducts.find((product) => product.itemId === itemId) ?? null;
}
