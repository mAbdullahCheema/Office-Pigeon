import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from 'next/font/google';

import { cspMeta } from '@/lib/csp.mjs';
import { siteUrl } from '@/lib/supabase/config';

import './globals.css';

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
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Office Pigeon — AI products, done-for-you services & a global academy',
    template: '%s — Office Pigeon',
  },
  description:
    'We build and run the AI that answers every call, reply and enquiry for you — website, chatbot, calling agent and automations. Live in 14 days, handled end to end.',
  applicationName: 'Office Pigeon',
  // `app/icon.svg`, `app/favicon.ico` and `app/apple-icon.png` are picked up by
  // file convention; only the pinned-tab colour has to be declared.
  openGraph: {
    type: 'website',
    siteName: 'Office Pigeon',
    url: siteUrl,
    title: 'Office Pigeon — done-for-you AI services & a global academy',
    description:
      'Services we build and run for you, an academy teaching students in sixteen countries, and four AI products on the way.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Office Pigeon — done-for-you AI services & a global academy',
    description:
      'Services we build and run for you, an academy teaching students in sixteen countries, and four AI products on the way.',
  },
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: true, address: false, email: true },
};

/**
 * `themeColor` tints the browser chrome on Android and the status bar on iOS.
 * `maximumScale` is deliberately absent: capping it is what stops a visitor
 * pinch-zooming a page they cannot read.
 */
export const viewport: Viewport = {
  themeColor: '#FFF7F1',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // `globals.css` sets `scroll-behavior: smooth` for in-page anchors. Next 16 no
  // longer works around that on its own, so a route change would glide up the
  // outgoing page instead of landing at the top. `data-scroll-behavior` asks
  // Next to switch the property to `auto` for the duration of a navigation.
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${jakarta.variable}`}
    >
      {/*
        The same policy the `Content-Security-Policy` response header carries.
        Hostinger's edge replaces that header with its own, so without this the
        live site would run with no policy worth the name; a document-delivered
        one the edge never sees closes that gap.
      */}
      <meta httpEquiv="Content-Security-Policy" content={cspMeta} />
      <body>{children}</body>
    </html>
  );
}
