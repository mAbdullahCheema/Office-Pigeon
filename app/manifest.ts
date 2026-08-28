import type { MetadataRoute } from 'next';

/**
 * Installable-app metadata. Android reads `icons` for the home-screen tile and
 * `theme_color` for the status bar; without it a saved site gets a screenshot
 * of the page as its icon.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Office Pigeon',
    short_name: 'Office Pigeon',
    description:
      'AI websites, chatbots, calling agents and automations — built, run and looked after for you.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF7F1',
    theme_color: '#E8480F',
    icons: [
      { src: '/pigeon-clay.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
