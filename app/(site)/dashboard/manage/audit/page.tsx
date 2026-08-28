import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { Card, Empty, Row, SectionHead } from '@/components/site/dashboard/ui';
import { requireViewer } from '@/lib/auth';
import { formatDateTime } from '@/lib/dashboard/format';
import { listAuditLog } from '@/lib/data';
import type { AuditLogRow } from '@/lib/supabase/types';

export const metadata: Metadata = { title: 'Audit log' };

export default async function AuditPage() {
  const viewer = await requireViewer();
  if (viewer.role !== 'admin') notFound();

  const entries = (await listAuditLog(200).catch(() => [])) as AuditLogRow[];

  return (
    <Card flush>
      <SectionHead
        flush
        title="Audit log"
        note="Every change made from these sections, newest first. Read-only by design."
      />

      {entries.map((entry) => (
        <Row
          key={entry.id}
          icon="📜"
          tint="#F1EFE8"
          title={entry.action}
          meta={`${entry.actor_name ?? 'system'} · ${formatDateTime(entry.created_at)}${
            entry.target ? ` · ${entry.target}` : ''
          }${entry.detail ? ` · ${entry.detail}` : ''}`}
        />
      ))}

      {entries.length === 0 ? (
        <Empty title="Nothing logged yet" body="Changes made from the management sections appear here." />
      ) : null}
    </Card>
  );
}
