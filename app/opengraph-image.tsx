import { ImageResponse } from 'next/og';

/**
 * Branded 1200×630 social share image (SEO-02). File-based: Next auto-adds the
 * resulting og:image (+ twitter image) to every page's metadata. Generated with
 * next/og (no external fonts → no build-time fetch).
 */
export const runtime = 'nodejs';
export const alt = 'Office Pigeon — AI Websites, Chatbots, Calling Agents & Automations';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0c0d0e',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f97316, #f43f5e, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
            }}
          >
            🕊️
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>
              Office Pigeon
            </div>
            <div style={{ fontSize: 20, color: '#f97316', fontWeight: 700, letterSpacing: 2 }}>
              WE AUTOMATE YOUR SUCCESS
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: '#fff', lineHeight: 1.1, maxWidth: 980 }}>
            AI systems that capture leads and reply instantly.
          </div>
          <div style={{ fontSize: 30, color: '#a1a1aa' }}>
            Websites · Smart Chatbots · AI Calling Agents · Workflow Automations
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#71717a' }}>officepigeon.com</div>
      </div>
    ),
    size,
  );
}
