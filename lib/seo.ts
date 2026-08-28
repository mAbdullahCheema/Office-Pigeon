import type { Metadata } from 'next';

import { siteUrl } from '@/lib/supabase/config';

/**
 * Page-level metadata, in one shape.
 *
 * Every route needs the same four things and they all derive from the same
 * three inputs, so writing them out per page is how one page ends up without a
 * canonical or with an Open Graph title that no longer matches its heading.
 *
 * The share card is named explicitly rather than left to inheritance: a page
 * that declares `openGraph` at all replaces its parent's whole `openGraph`
 * block, so the image `app/opengraph-image.tsx` contributes at the root is
 * dropped the moment a page sets an Open Graph title. Pointing at the same
 * generated route by path puts it back.
 */
const card = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Office Pigeon — AI websites, chatbots, calling agents and automations',
};
export function pageMeta({
  path,
  title,
  description,
  socialTitle,
  absoluteTitle = false,
}: {
  /** Absolute path on this site, leading slash included. */
  path: string;
  title: string;
  description: string;
  /** Share-card title, when the tab title is too terse to stand alone. */
  socialTitle?: string;
  /** Skip the `%s — Office Pigeon` template, for a title that already names it. */
  absoluteTitle?: boolean;
}): Metadata {
  const url = `${siteUrl}${path === '/' ? '' : path}`;
  const social = socialTitle ?? `${title} — Office Pigeon`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Office Pigeon',
      url,
      title: social,
      description,
      images: [card],
    },
    twitter: {
      card: 'summary_large_image',
      title: social,
      description,
      images: [{ url: '/twitter-image', alt: card.alt }],
    },
  };
}
