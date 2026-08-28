import { ImageResponse } from 'next/og';

/**
 * The share card every route inherits.
 *
 * Drawn rather than shipped as a file so it stays in step with the brand
 * colours, and so there is no 1200×630 PNG in the repo to go stale. Routes that
 * need their own card publish an `opengraph-image` of their own alongside the
 * page; this one covers the rest of the site.
 */
export const alt = 'Office Pigeon — AI websites, chatbots, calling agents and automations';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 76px',
          background: 'linear-gradient(140deg, #FFF7F1 0%, #FFEDE3 48%, #FFD9C4 100%)',
          color: '#241A16',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Warm bloom behind the type, matching the site's clay ground. */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(255,129,73,.42), rgba(255,129,73,0) 68%)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 86,
              height: 86,
              borderRadius: 999,
              background: 'linear-gradient(140deg, #FFA46A, #FF6B35 55%, #E8480F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 7h.01" />
              <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
              <path d="m20 7 2 .5-2 .5" />
              <path d="M10 18v3" />
              <path d="M14 17.75V21" />
              <path d="M7 18a6 6 0 0 0 3.84-10.61" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -1 }}>Office Pigeon</div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: 4, color: '#C4531F' }}>
              WE AUTOMATE YOUR SUCCESS
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: -2.5, lineHeight: 1.08, maxWidth: 940 }}>
            The AI that answers every call, reply and enquiry for you.
          </div>
          <div style={{ fontSize: 27, color: 'rgba(36,26,22,.66)', maxWidth: 880, lineHeight: 1.45 }}>
            Websites, chatbots, calling agents and automations — built, run and looked after by us.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {['Live in 14 days', 'Flat monthly price', 'Academy in 16 countries'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                color: '#8A3D18',
                background: 'rgba(255,255,255,.72)',
                padding: '14px 24px',
                borderRadius: 999,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
