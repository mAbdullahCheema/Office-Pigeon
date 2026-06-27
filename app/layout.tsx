import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import './globals.css';
import JsonLd from './_components/JsonLd';
import { localBusinessJsonLd, organizationJsonLd } from '@/lib/seo/jsonld';

/**
 * Root layout (Phase 2 foundation).
 *
 * Self-hosted fonts via next/font (replaces the render-blocking Google Fonts
 * <link> from index.html on the Next path — no layout shift, no extra round
 * trip; PERF-03 done properly). Exposes CSS variables consumed by globals.css.
 */
const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Canonical = apex (no www); locked decision. og:image + per-page metadata land in Phase 3.
export const metadata: Metadata = {
  metadataBase: new URL('https://officepigeon.com'),
  title: {
    default: 'Office Pigeon | AI Websites, Chatbots, Calling Agents & Automations',
    template: '%s | Office Pigeon',
  },
  description:
    'Office Pigeon builds premium websites, smart chatbots, workflow automations, and AI Calling Agents for growing businesses.',
  alternates: { canonical: '/' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        <JsonLd data={[organizationJsonLd(), localBusinessJsonLd()]} />
        {children}
      </body>
    </html>
  );
}
