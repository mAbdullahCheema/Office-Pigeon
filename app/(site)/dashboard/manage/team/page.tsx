import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { Notice } from '@/components/site/dashboard/Notice';
import { controls } from '@/components/site/dashboard/styles';
import { Badge, Card, Empty, Row, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { formatDate } from '@/lib/dashboard/format';
import { admin } from '@/lib/supabase/admin';

import { inviteStaffAction, removeStaffAction, sendTestAlertAction } from '../../actions';

export const metadata: Metadata = { title: 'Team' };

type Member = {
  user_id: string;
  role: string;
  created_at: string;
  profiles: { name: string | null; email: string | null } | null;
};

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  if (viewer.role !== 'admin') notFound();

  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  // Only an owner or admin may change the team, so an editor sees it read-only
  // rather than a set of buttons that would be refused.
  const canManage = viewer.staffRole === 'owner' || viewer.staffRole === 'admin';

  const { data } = await admin()
    .from('staff')
    .select('user_id, role, created_at, profiles(name, email)')
    .order('created_at', { ascending: true });

  const members = (data ?? []) as unknown as Member[];

  return (
    <>
      {first(params.saved) ? <Notice tone="good">Done.</Notice> : null}
      {first(params.error) ? <Notice tone="bad">{first(params.error)}</Notice> : null}

      {canManage ? (
        <Card>
          <SectionHead
            title="Invite someone"
            note="They get an email invitation. Owners and admins can manage the team; editors can change content and records."
          />

          <Fx as="form" action={inviteStaffAction} s="margin-top:16px">
            <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <Fx>
                <Fx as="label" htmlFor="invite-email" s={controls.label}>
                  Email
                </Fx>
                <Fx
                  as="input"
                  id="invite-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  s={controls.input}
                />
              </Fx>
              <Fx>
                <Fx as="label" htmlFor="invite-name" s={controls.label}>
                  Name
                </Fx>
                <Fx as="input" id="invite-name" name="name" s={controls.input} />
              </Fx>
              <Fx>
                <Fx as="label" htmlFor="invite-role" s={controls.label}>
                  Role
                </Fx>
                <Fx as="select" id="invite-role" name="role" defaultValue="editor" s={controls.input}>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </Fx>
              </Fx>
            </Fx>
            <Fx s="margin-top:18px">
              <ConfirmSubmit variant="primary">Send invitation</ConfirmSubmit>
            </Fx>
          </Fx>
        </Card>
      ) : null}

      <Card flush>
        <SectionHead flush title="Staff" note={`${members.length} on the team`} />

        {members.map((member) => {
          const email = member.profiles?.email ?? member.user_id;
          const name = member.profiles?.name || email;

          return (
            <Row
              key={member.user_id}
              icon="👤"
              tint="#EEEBFE"
              title={name}
              meta={`${email} · joined ${formatDate(member.created_at)}`}
              trailing={
                <Badge bg="#FFF6F1" fg={tone.muted}>
                  {member.role}
                </Badge>
              }
              action={
                canManage && member.user_id !== viewer.id ? (
                  <Fx as="form" action={removeStaffAction}>
                    <input type="hidden" name="userId" value={member.user_id} />
                    <ConfirmSubmit variant="danger" confirmLabel={`Remove ${name} from the team?`}>
                      Remove
                    </ConfirmSubmit>
                  </Fx>
                ) : null
              }
            />
          );
        })}

        {members.length === 0 ? (
          <Empty title="No staff yet" body="Invite someone above to give them access to these sections." />
        ) : null}
      </Card>

      {canManage ? (
        <Card>
          <SectionHead title="Notifications" note="Sends a test message to the team's notification address." />
          <Fx as="form" action={sendTestAlertAction} s="margin-top:14px">
            <ConfirmSubmit variant="soft">Send a test alert</ConfirmSubmit>
          </Fx>
        </Card>
      ) : null}
    </>
  );
}
