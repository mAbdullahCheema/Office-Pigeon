import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { DashboardRail } from '@/components/site/dashboard/DashboardRail';
import { LiveRefresh } from '@/components/site/dashboard/LiveRefresh';
import { Shell } from '@/components/site/Shell';
import { Fx } from '@/components/ui/Fx';
import { currentViewer } from '@/lib/auth';
import { railGroups } from '@/lib/dashboard/nav';
import { unreadNotificationCount } from '@/lib/data';
import { routes } from '@/lib/routes';

import { signOutCustomer } from '../login/actions';

export const metadata: Metadata = {
  // Every section below names itself in the tab, so a visitor with the orders
  // page and the billing page open can tell them apart.
  title: { default: 'Dashboard', template: '%s — Dashboard — Office Pigeon' },
  description: 'Your orders, billing, classes, files and the thread you have with us.',
  robots: { index: false, follow: false },
};

/** Everything below depends on the session cookie. */
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const viewer = await currentViewer();
  if (!viewer) redirect(`${routes.login}?next=${encodeURIComponent(routes.dashboard)}`);

  const unread = await unreadNotificationCount({
    id: viewer.id,
    isStaff: viewer.role === 'admin',
  });

  return (
    <Shell active="dashboard">
      <LiveRefresh userId={viewer.id} isStaff={viewer.role === 'admin'} />
      <Fx as="section" s="position:relative;z-index:1;padding:32px 20px 96px;overflow:hidden">
        <Fx
          className="shell"
          s="max-width:1260px;margin:0 auto;position:relative;display:grid;grid-template-columns:236px minmax(0,1fr);gap:20px;align-items:start"
        >
          <DashboardRail
            groups={railGroups(viewer.role, unread)}
            name={viewer.name}
            email={viewer.email}
            avatarUrl={viewer.avatarUrl}
            role={viewer.role}
            signOut={signOutCustomer}
          />

          <Fx s="display:flex;flex-direction:column;gap:18px;min-width:0">{children}</Fx>
        </Fx>
      </Fx>
    </Shell>
  );
}
