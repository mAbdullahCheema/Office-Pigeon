'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Fx } from '@/components/ui/Fx';
import { routes } from '@/lib/routes';

import { tone } from './styles';

export type RailLink = {
  href: string;
  label: string;
  icon: string;
  dot: string;
  /** Unread count. Rendered as a bubble; omitted or 0 shows nothing. */
  count?: number;
};
export type RailGroup = { heading: string; links: RailLink[] };

/**
 * The dashboard's navigation.
 *
 * One rail serves both roles: a customer sees their own sections, an admin sees
 * the same ones plus the management groups underneath. Rendering it on the
 * client is what lets the active item come from the URL, so the rail and the
 * page can never disagree about where you are.
 */
export function DashboardRail({
  groups,
  name,
  email,
  avatarUrl,
  role,
  signOut,
}: {
  groups: RailGroup[];
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'admin' | 'customer';
  signOut: () => void | Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const initials =
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'OP';

  const isActive = (href: string) =>
    href === routes.dashboard ? pathname === href : pathname.startsWith(href);

  const activeLabel =
    groups.flatMap((group) => group.links).find((link) => isActive(link.href))?.label ?? 'Dashboard';

  return (
    <Fx className="rail" s="display:flex;flex-direction:column;gap:8px;position:sticky;top:110px">
      <Fx
        s={`background:#fff;border-radius:28px;padding:18px 20px;box-shadow:0 14px 30px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);flex:none;min-width:min(210px, 100%)`}
      >
        <Fx s="display:flex;align-items:center;gap:11px">
          {avatarUrl ? (
            <Fx
              as="img"
              src={avatarUrl}
              alt=""
              width={42}
              height={42}
              s="width:42px;height:42px;flex:none;border-radius:50%;object-fit:cover;box-shadow:0 6px 14px rgba(196,120,74,.2)"
            />
          ) : (
            <Fx
              as="span"
              className="tt"
              s="width:42px;height:42px;flex:none;border-radius:50%;background:linear-gradient(150deg,#FFA46A,#EF5A1F);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px"
            >
              {initials}
            </Fx>
          )}
          <Fx as="span" s="line-height:1.3;min-width:0">
            <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:14.5px;overflow:hidden;text-overflow:ellipsis">
              {name}
            </Fx>
            <Fx
              as="span"
              s={`display:block;font-size:11.5px;color:${tone.muted};overflow:hidden;text-overflow:ellipsis`}
            >
              {role === 'admin' ? 'Owner · Office Pigeon' : email}
            </Fx>
          </Fx>
        </Fx>
      </Fx>

      {/* On a phone the rail becomes one button that opens the section list. */}
      <Fx
        as="button"
        type="button"
        className="rail-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        s="display:none;align-items:center;gap:10px;border:0;cursor:pointer;font-family:inherit;font-weight:800;font-size:14.5px;text-align:left;padding:14px 18px;border-radius:20px;background:#fff;color:#241A16;box-shadow:0 10px 22px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)"
      >
        <Fx as="span" s="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          {activeLabel}
        </Fx>
        <Fx as="span" s={`font-size:12px;color:${tone.accent};transform:rotate(${open ? 180 : 0}deg);transition:transform .3s`}>
          ▾
        </Fx>
      </Fx>

      <Fx className={open ? 'rail-links rail-open' : 'rail-links'} s="display:flex;flex-direction:column;gap:8px">
        {groups.map((group) => (
          <Fx key={group.heading} s="display:flex;flex-direction:column;gap:6px">
            {group.heading ? (
              <Fx
                s={`font-size:10.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:${tone.faint};padding:12px 16px 2px`}
              >
                {group.heading}
              </Fx>
            ) : null}
            {group.links.map((link) => {
              const active = isActive(link.href);
              return (
                <Fx
                  key={link.href}
                  as={Link}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  s={`display:flex;align-items:center;gap:11px;text-decoration:none;font-family:inherit;font-weight:700;font-size:14px;padding:13px 16px;border-radius:20px;background:${
                    active ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : '#fff'
                  };color:${active ? '#fff' : '#241A16'};box-shadow:${
                    active
                      ? '0 14px 26px rgba(226,78,23,.32), inset 0 2px 3px rgba(255,255,255,.4)'
                      : '0 10px 22px rgba(196,120,74,.12), inset 0 2px 3px rgba(255,255,255,.9)'
                  };transition:background .3s, color .3s, transform .3s cubic-bezier(.34,1.4,.64,1);flex:none`}
                  hover="transform:translateX(3px)"
                >
                  <Fx
                    as="span"
                    s={`width:30px;height:30px;flex:none;border-radius:50%;background:${
                      active ? 'rgba(255,255,255,.24)' : link.dot
                    };display:flex;align-items:center;justify-content:center;font-size:14px`}
                  >
                    {link.icon}
                  </Fx>
                  <Fx as="span" s="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                    {link.label}
                  </Fx>
                  {link.count ? (
                    <Fx
                      as="span"
                      aria-label={`${link.count} unread`}
                      s={`flex:none;min-width:20px;height:20px;padding:0 6px;border-radius:999px;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;background:${
                        active ? 'rgba(255,255,255,.28)' : '#EF5A1F'
                      };color:#fff`}
                    >
                      {link.count > 99 ? '99+' : link.count}
                    </Fx>
                  ) : null}
                </Fx>
              );
            })}
          </Fx>
        ))}

        <Fx
          as={Link}
          href={routes.order}
          s="display:flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;color:#fff;font-weight:700;font-size:14px;padding:14px 16px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34);margin-top:6px;flex:none"
          hover="transform:translateY(-3px)"
        >
          New order
        </Fx>

        <Fx as="form" action={signOut}>
          <Fx
            as="button"
            type="submit"
            s={`width:100%;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:13px 16px;border-radius:999px;background:#FFF0E7;color:${tone.muted};box-shadow:inset 0 2px 3px rgba(255,255,255,.9);flex:none`}
          >
            Sign out
          </Fx>
        </Fx>
      </Fx>
    </Fx>
  );
}
