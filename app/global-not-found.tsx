import type { Metadata } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';

import { NotFoundCard } from '@/components/site/NotFoundCard';

import './globals.css';

/**
 * The 404 for a URL that matches no route at all.
 *
 * `not-found.tsx` renders inside the root layout, which means it inherits that
 * layout's `<title>` — so every mistyped URL was answering with the homepage's
 * title. This file is routed to before any layout renders, which is what lets
 * it carry a title of its own. The trade is that it composes no layout, so the
 * stylesheet and the two faces have to be requested here by name.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Page not found — Office Pigeon',
  description: 'That page has moved or the link is wrong. Every main section is one click away.',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${bricolage.variable} ${jakarta.variable}`}>
      <body>
        <NotFoundCard />
      </body>
    </html>
  );
}
