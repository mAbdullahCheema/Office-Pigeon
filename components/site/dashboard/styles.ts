/**
 * Style strings shared by the dashboard's server and client components.
 *
 * Kept free of JSX so a client component can pull in the button styles without
 * dragging the server-rendered card components into its bundle.
 */

export const tone = {
  ink: '#241A16',
  muted: 'rgba(36,26,22,.55)',
  faint: 'rgba(36,26,22,.42)',
  accent: '#E8480F',
  line: '#F6E7DC',
  wash: '#FFF6F1',
} as const;

export const surfaces = {
  card:
    'background:#fff;border-radius:38px;padding:26px 28px 28px;box-shadow:0 18px 40px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9)',
  cardFlush:
    'background:#fff;border-radius:38px;padding:14px;box-shadow:0 18px 40px rgba(196,120,74,.16), inset 0 2px 3px rgba(255,255,255,.9)',
  tile:
    'background:#fff;border-radius:26px;padding:22px 24px;box-shadow:0 14px 30px rgba(196,120,74,.13), inset 0 2px 3px rgba(255,255,255,.9)',
  inset:
    'background:#FFF6F1;border-radius:22px;padding:15px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)',
} as const;

export const controls = {
  input:
    'width:100%;box-sizing:border-box;margin-top:7px;font-family:inherit;font-size:15px;color:#241A16;background:#FFF9F5;border:0;border-radius:18px;padding:13px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.14);outline:none',
  label:
    'display:block;font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.45)',
  primary:
    'border:0;font-family:inherit;font-weight:700;font-size:15px;color:#fff;padding:14px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34);transition:transform .3s cubic-bezier(.34,1.56,.64,1);text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:9px',
  soft:
    'border:0;font-family:inherit;font-weight:700;font-size:14px;color:#241A16;padding:12px 20px;border-radius:999px;background:#FFF0E7;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1);text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px',
  danger:
    'border:0;font-family:inherit;font-weight:700;font-size:13.5px;color:#B4230C;padding:11px 18px;border-radius:999px;background:#FFEDE3;box-shadow:inset 0 2px 3px rgba(255,255,255,.8);transition:transform .3s cubic-bezier(.34,1.56,.64,1);text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px',
} as const;
