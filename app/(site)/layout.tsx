import SiteChrome from './SiteChrome';

/**
 * Layout for all public marketing pages (Phase 3). Wraps them in the shared
 * navbar/footer/widgets chrome + actions context. The root app/layout.tsx
 * still provides <html>/<body>, fonts, and site-wide JSON-LD.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
