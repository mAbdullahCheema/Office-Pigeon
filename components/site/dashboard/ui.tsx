import type { ReactNode } from 'react';

import { Fx } from '@/components/ui/Fx';

import { controls, surfaces, tone } from './styles';

/**
 * The dashboard's building blocks, in the site's own clay design language.
 *
 * Both halves of the dashboard — what a customer sees and what an admin sees —
 * are assembled from these, which is what keeps one unified surface from
 * drifting back into two different-looking apps.
 */

export { controls, surfaces, tone };

export function Card({
  children,
  flush = false,
  s = '',
  className,
}: {
  children: ReactNode;
  /** Flush cards hold full-bleed rows and supply their own row padding. */
  flush?: boolean;
  s?: string;
  className?: string;
}) {
  return (
    <Fx className={className} s={`${flush ? surfaces.cardFlush : surfaces.card};${s}`}>
      {children}
    </Fx>
  );
}

export function SectionHead({
  title,
  note,
  action,
  flush = false,
}: {
  title: string;
  note?: ReactNode;
  action?: ReactNode;
  flush?: boolean;
}) {
  return (
    <Fx
      s={`display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap${
        flush ? ';padding:18px 20px 14px' : ''
      }`}
    >
      <Fx s="min-width:0">
        <Fx as="h2" s="font-size:21px;margin:0">
          {title}
        </Fx>
        {note ? (
          <Fx as="p" s={`font-size:13px;color:${tone.muted};margin:5px 0 0;text-wrap:pretty`}>
            {note}
          </Fx>
        ) : null}
      </Fx>
      {action ? <Fx s="display:flex;gap:8px;flex-wrap:wrap">{action}</Fx> : null}
    </Fx>
  );
}

export function Badge({ bg, fg, children }: { bg: string; fg: string; children: ReactNode }) {
  return (
    <Fx
      as="span"
      s={`font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:${bg};color:${fg};padding:8px 14px;border-radius:999px;white-space:nowrap;display:inline-block`}
    >
      {children}
    </Fx>
  );
}

/**
 * One line in a list card.
 *
 * `rowstack` is the existing responsive class that collapses the four-column
 * grid to two on narrow screens, so these rows stay readable on a phone.
 */
export function Row({
  icon,
  tint = '#FFF0E7',
  title,
  meta,
  trailing,
  action,
}: {
  icon: ReactNode;
  tint?: string;
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Fx
      className="rowstack"
      s="display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;gap:16px;align-items:center;padding:16px 20px;border-radius:26px;transition:background .3s"
      hover="background:#FFF6F1"
    >
      <Fx
        as="span"
        s={`width:46px;height:46px;flex:none;border-radius:50%;background:${tint};display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
      >
        {icon}
      </Fx>
      <Fx as="span" s="line-height:1.45;min-width:0">
        <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:15px;word-break:break-word">
          {title}
        </Fx>
        {meta ? (
          <Fx as="span" s={`display:block;font-size:12.5px;color:${tone.muted};margin-top:3px;word-break:break-word`}>
            {meta}
          </Fx>
        ) : null}
      </Fx>
      <Fx s="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end">
        {trailing}
      </Fx>
      <Fx s="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end">
        {action}
      </Fx>
    </Fx>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <Fx s="padding:34px 20px 38px;text-align:center">
      <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17px">
        {title}
      </Fx>
      <Fx as="p" s={`font-size:14.5px;line-height:1.65;color:${tone.muted};margin:8px auto 0;max-width:42ch`}>
        {body}
      </Fx>
      {action ? <Fx s="margin-top:18px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap">{action}</Fx> : null}
    </Fx>
  );
}

export function Stat({
  label,
  value,
  note,
  color = tone.accent,
}: {
  label: string;
  value: string;
  note?: string;
  color?: string;
}) {
  return (
    <Fx className="clay" s={surfaces.tile}>
      <Fx s={`font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${tone.faint}`}>
        {label}
      </Fx>
      <Fx
        s={`font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:28px;color:${color};margin-top:8px;word-break:break-word`}
      >
        {value}
      </Fx>
      {note ? <Fx s={`font-size:12.5px;color:${tone.muted};margin-top:3px`}>{note}</Fx> : null}
    </Fx>
  );
}

export function Grid({
  min = 240,
  gap = 14,
  children,
  className,
}: {
  min?: number;
  gap?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Fx
      className={className}
      s={`display:grid;grid-template-columns:repeat(auto-fit,minmax(min(${min}px,100%),1fr));gap:${gap}px`}
    >
      {children}
    </Fx>
  );
}
