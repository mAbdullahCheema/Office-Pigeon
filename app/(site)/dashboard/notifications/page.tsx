import type { Metadata } from 'next';

import Link from 'next/link';

import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { Badge, Card, Empty, Row, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { formatDateTime } from '@/lib/dashboard/format';
import { listNotifications } from '@/lib/data';

import { markNotificationsReadAction } from '../actions';

export const metadata: Metadata = { title: 'Notifications' };

const look: Record<string, { icon: string; tint: string }> = {
  lead: { icon: '🎯', tint: '#EEEBFE' },
  payment: { icon: '🪙', tint: '#E9FBF3' },
  booking: { icon: '📅', tint: '#E9FBF3' },
  contact: { icon: '✉️', tint: '#FFF0E7' },
  message: { icon: '💬', tint: '#E9FBF3' },
  digest: { icon: '📊', tint: '#FFF4D8' },
  system: { icon: '🔔', tint: '#F1EFE8' },
};

export default async function NotificationsPage() {
  const viewer = await requireViewer();
  const isStaff = viewer.role === 'admin';

  const notifications = await listNotifications({ id: viewer.id, isStaff }).catch(() => []);
  const unread = notifications.filter((entry) => !entry.read_at).length;

  return (
    <Card flush>
      <SectionHead
        flush
        title="Notifications"
        note={
          isStaff
            ? 'Everything the site has raised for the team.'
            : 'Updates on your orders, payments and classes.'
        }
        action={
          unread ? (
            <Fx as="form" action={markNotificationsReadAction}>
              <ConfirmSubmit variant="soft">Mark all read</ConfirmSubmit>
            </Fx>
          ) : null
        }
      />

      {notifications.map((entry) => {
        const style = look[entry.kind] ?? look.system;
        const title = entry.read_at ? entry.title : `${entry.title} ·`;

        return (
          <Row
            key={entry.id}
            icon={style.icon}
            tint={style.tint}
            title={title}
            meta={[entry.body, formatDateTime(entry.created_at)].filter(Boolean).join(' · ')}
            trailing={
              entry.read_at ? null : (
                <Badge bg="#FFEDE3" fg="#E8480F">
                  New
                </Badge>
              )
            }
            action={
              entry.href ? (
                <Fx
                  as={Link}
                  href={entry.href}
                  s="text-decoration:none;font-size:12.5px;font-weight:800;color:#E8480F;white-space:nowrap"
                >
                  Open →
                </Fx>
              ) : null
            }
          />
        );
      })}

      {notifications.length === 0 ? (
        <Empty
          title="Nothing yet"
          body={
            isStaff
              ? 'New leads, payments and messages appear here the moment they land.'
              : 'We will tell you here when an order moves or a payment clears.'
          }
        />
      ) : null}

      <Fx s={`padding:14px 20px;font-size:12.5px;color:${tone.muted}`}>
        These arrive without email. The page updates itself as they land.
      </Fx>
    </Card>
  );
}
