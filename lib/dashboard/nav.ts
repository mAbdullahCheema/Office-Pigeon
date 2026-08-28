import type { RailGroup } from '@/components/site/dashboard/DashboardRail';

import { resources } from './resources';

/**
 * The dashboard's sections, in one list.
 *
 * A customer and an admin get the same shell; the only difference is how far
 * down the list they can see. Building both from one function is what stops
 * the two roles drifting into two separate products.
 */

const customerLinks = [
  { href: '/dashboard', label: 'Overview', icon: '🏠', dot: '#FFEDE3' },
  { href: '/dashboard/notifications', label: 'Notifications', icon: '🔔', dot: '#FFF4D8' },
  { href: '/dashboard/orders', label: 'Orders', icon: '🧾', dot: '#FFEDE3' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳', dot: '#FFF4D8' },
  { href: '/dashboard/classes', label: 'Classes', icon: '📚', dot: '#EEEBFE' },
  { href: '/dashboard/messages', label: 'Messages', icon: '💬', dot: '#E9FBF3' },
  { href: '/dashboard/files', label: 'Files', icon: '📁', dot: '#FFF0E7' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', dot: '#F1EFE8' },
];

/** Screens that are not a plain table and so are not in the resource registry. */
const extraAdminLinks: Record<string, { href: string; label: string; icon: string; dot: string }[]> = {
  Content: [{ href: '/dashboard/manage/media', label: 'Media library', icon: '🖼️', dot: '#FFF0E7' }],
  System: [
    { href: '/dashboard/manage/team', label: 'Team', icon: '👥', dot: '#EEEBFE' },
    { href: '/dashboard/manage/audit', label: 'Audit log', icon: '📜', dot: '#F1EFE8' },
  ],
};

export function railGroups(role: 'admin' | 'customer', unread = 0): RailGroup[] {
  const groups: RailGroup[] = [
    {
      heading: '',
      links: customerLinks.map((link) =>
        link.href === '/dashboard/notifications' ? { ...link, count: unread } : link,
      ),
    },
  ];
  if (role !== 'admin') return groups;

  for (const heading of ['Work', 'Money', 'People', 'Content', 'System'] as const) {
    const links = resources
      .filter((resource) => resource.group === heading)
      .map((resource) => ({
        href: `/dashboard/manage/${resource.id}`,
        label: resource.label,
        icon: resource.icon,
        dot: resource.tint,
      }))
      .concat(extraAdminLinks[heading] ?? []);

    if (links.length) groups.push({ heading, links });
  }

  return groups;
}
