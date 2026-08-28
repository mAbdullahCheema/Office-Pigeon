import type { ReactNode } from 'react';

import { Fx } from '@/components/ui/Fx';

const tones = {
  good: { bg: '#E9FBF3', fg: '#0B6B4D', icon: '✓' },
  bad: { bg: '#FFEDE3', fg: '#B4230C', icon: '!' },
  info: { bg: '#EEEBFE', fg: '#4436B4', icon: 'i' },
} as const;

/**
 * The banner every dashboard action redirects back to.
 *
 * Server actions cannot hand a message to a plain `<form action>`, so results
 * travel as a query parameter and land here.
 */
export function Notice({ tone = 'info', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  const style = tones[tone];

  return (
    <Fx
      role={tone === 'bad' ? 'alert' : 'status'}
      s={`display:flex;align-items:flex-start;gap:12px;background:${style.bg};color:${style.fg};border-radius:26px;padding:16px 20px;box-shadow:inset 0 2px 4px rgba(255,255,255,.7);animation:pop .35s cubic-bezier(.34,1.4,.64,1) both`}
    >
      <Fx
        as="span"
        s={`width:26px;height:26px;flex:none;border-radius:50%;background:rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px`}
      >
        {style.icon}
      </Fx>
      <Fx as="span" s="font-size:14px;line-height:1.6;font-weight:600;text-wrap:pretty">
        {children}
      </Fx>
    </Fx>
  );
}
