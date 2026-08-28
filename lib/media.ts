/**
 * Published media, keyed by the slot name an `ImageSlot` renders against.
 * A slot with no entry here falls back to its captioned placeholder panel.
 */
export const slotMedia: Record<string, string> = {
  // Home
  'home-academy': '/images/home-academy.webp',

  // Academy
  'academy-world': '/images/academy-world.webp',
  'home-a-ai': '/images/course-ai-hero.webp',

  // Academy — professional track
  'course-applied-ai': '/images/course-ai-wide.webp',
  'course-mentor': '/images/course-mentor.webp',
  'course-ai-hero': '/images/course-ai-building.webp',
  'course-ai-journey': '/images/course-ai-journey.webp',

  // Examples — case study cards
  'ex-auto': '/images/ex-auto.webp',
  'ex-clean': '/images/ex-clean.webp',
  'ex-spa': '/images/ex-spa.webp',
  'ex-school': '/images/ex-school.webp',
  'ex-finance': '/images/ex-finance.webp',
  'ex-academy': '/images/ex-academy.webp',
  'ex-realty': '/images/ex-realty.webp',
  'ex-gym': '/images/ex-gym.webp',
  'ex-admissions': '/images/ex-admissions.webp',
  'examples-collage': '/images/examples-collage.webp',

  // Services
  'web-hero': '/images/web-hero.webp',
  'web-gallery': '/images/web-gallery.webp',
  'chat-gallery': '/images/chat-gallery.webp',
  'call-gallery': '/images/call-gallery.webp',
  'auto-gallery': '/images/auto-gallery.webp',
};
