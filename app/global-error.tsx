'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary: this one replaces the root layout, so it renders its
 * own document and cannot rely on the global stylesheet or the loaded fonts.
 * Everything it needs is inline and self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[root] render failed:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: '#FFF7F1',
          color: '#241A16',
          fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            width: 'min(560px,100%)',
            background: '#fff',
            borderRadius: 36,
            padding: '44px 40px',
            textAlign: 'center',
            boxShadow: '0 26px 54px rgba(196,120,74,.2)',
          }}
        >
          <div style={{ fontSize: 34 }}>🕊️</div>
          <h1 style={{ fontSize: 28, margin: '18px 0 0' }}>Office Pigeon is having a moment.</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(36,26,22,.64)', margin: '12px 0 0' }}>
            Something failed before the page could be built. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 26,
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15.5,
              padding: '15px 26px',
              borderRadius: 999,
              background: 'linear-gradient(180deg,#FF8149,#EF5A1F)',
            }}
          >
            Reload
          </button>
          {error.digest ? (
            <p style={{ marginTop: 20, fontSize: 12, color: 'rgba(36,26,22,.42)' }}>
              Reference {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
