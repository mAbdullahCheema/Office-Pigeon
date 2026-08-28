import type { Metadata } from 'next';

import { Notice } from '@/components/site/dashboard/Notice';
import { Badge, Card, SectionHead, tone } from '@/components/site/dashboard/ui';
import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { controls } from '@/components/site/dashboard/styles';
import { formatDateTime } from '@/lib/dashboard/format';
import { listThreadMessages, listThreads } from '@/lib/data';
import { contactPoints, mailtoLink, whatsappLink } from '@/lib/routes';

import { postThreadMessageAction } from '../actions';

export const metadata: Metadata = { title: 'Messages' };

const statusTint: Record<string, { bg: string; fg: string }> = {
  open: { bg: '#E9FBF3', fg: '#0F9C6E' },
  pending: { bg: '#FFF4D8', fg: '#B07C00' },
  resolved: { bg: '#EEEBFE', fg: '#5A48D6' },
  closed: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const threads = await listThreads({ userId: viewer.id }).catch(() => []);
  const selectedId = first(params.thread) ?? threads[0]?.id ?? '';
  const thread = threads.find((entry) => entry.id === selectedId) ?? threads[0] ?? null;
  const messages = thread ? await listThreadMessages(thread.id) : [];

  return (
    <>
      {first(params.error) ? <Notice tone="bad">{first(params.error)}</Notice> : null}

      {threads.length > 1 ? (
        <Card>
          <SectionHead title="Your conversations" />
          <Fx s="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            {threads.map((entry) => {
              const active = entry.id === thread?.id;
              return (
                <Fx
                  key={entry.id}
                  as="a"
                  href={`?thread=${entry.id}`}
                  s={`display:flex;align-items:center;gap:9px;text-decoration:none;font-weight:700;font-size:13px;padding:11px 16px;border-radius:999px;background:${
                    active ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : '#FFF0E7'
                  };color:${active ? '#fff' : '#241A16'};box-shadow:${
                    active ? '0 12px 22px rgba(226,78,23,.3)' : 'inset 0 2px 3px rgba(255,255,255,.9)'
                  }`}
                >
                  {entry.subject}
                  {entry.unread_for_customer ? (
                    <Fx as="span" s="width:8px;height:8px;border-radius:50%;background:#0F9C6E" />
                  ) : null}
                </Fx>
              );
            })}
          </Fx>
        </Card>
      ) : null}

      <Card>
        <SectionHead
          title={thread?.subject ?? 'Message us'}
          note={
            thread
              ? 'Support goes to someone who knows your setup — not a queue.'
              : 'Start a conversation and it stays here, with everything we have said before.'
          }
          action={
            thread ? (
              <Badge {...(statusTint[thread.status] ?? statusTint.open)}>{thread.status}</Badge>
            ) : null
          }
        />

        {messages.length ? (
          <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:22px">
            {messages.map((message) => {
              const mine = message.role === 'customer';
              return (
                <Fx
                  key={message.id}
                  s={`align-self:${mine ? 'flex-end' : 'flex-start'};max-width:min(74%, 560px);background:${
                    mine ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : '#FFF6F1'
                  };color:${mine ? '#fff' : '#241A16'};border-radius:${
                    mine ? '26px 26px 8px 26px' : '26px 26px 26px 8px'
                  };padding:14px 18px;box-shadow:${
                    mine ? '0 12px 24px rgba(226,78,23,.28)' : 'inset 0 2px 5px rgba(196,120,74,.12)'
                  }`}
                >
                  <Fx s="font-size:11.5px;font-weight:800;letter-spacing:.04em;opacity:.65">
                    {mine ? 'You' : message.author_name || 'Office Pigeon'} · {formatDateTime(message.created_at)}
                  </Fx>
                  <Fx as="p" s="font-size:14.5px;line-height:1.6;margin:6px 0 0;text-wrap:pretty;white-space:pre-wrap">
                    {message.body}
                  </Fx>
                </Fx>
              );
            })}
          </Fx>
        ) : null}

        <Fx as="form" action={postThreadMessageAction} s="margin-top:20px">
          {thread ? <input type="hidden" name="threadId" value={thread.id} /> : null}

          {!thread ? (
            <Fx s="margin-bottom:12px">
              <Fx as="label" htmlFor="thread-subject" s={controls.label}>
                What is it about
              </Fx>
              <Fx
                as="input"
                id="thread-subject"
                name="subject"
                placeholder="e.g. Question about my website build"
                s={controls.input}
              />
            </Fx>
          ) : null}

          <Fx as="label" htmlFor="thread-body" s={controls.label}>
            Your message
          </Fx>
          <Fx
            as="textarea"
            id="thread-body"
            name="body"
            rows={4}
            required
            placeholder="Write a message…"
            s={`${controls.input};resize:vertical`}
          />
          <Fx s="margin-top:14px">
            <ConfirmSubmit variant="primary">Send</ConfirmSubmit>
          </Fx>
        </Fx>
      </Card>

      <Card>
        <SectionHead
          title="Other ways to reach us"
          note="Business hours are 9:00–19:00 ET Monday to Friday, and our own calling agent picks up outside them."
        />
        <Fx s="display:flex;flex-direction:column;gap:12px;margin-top:20px">
          {[
            {
              icon: '💬',
              tint: '#E9FBF3',
              label: 'WhatsApp',
              value: contactPoints.phone,
              href: whatsappLink('Hi Office Pigeon — I have a question about my account.'),
            },
            {
              icon: '✉️',
              tint: '#FFF0E7',
              label: 'Email',
              value: contactPoints.email,
              href: mailtoLink('Account question'),
            },
            {
              icon: '📅',
              tint: '#EEEBFE',
              label: 'Book time with us',
              value: 'cal.com/office-pigeon',
              href: contactPoints.demoCall,
            },
          ].map((entry) => (
            <Fx
              key={entry.label}
              as="a"
              href={entry.href}
              s="display:flex;align-items:center;gap:14px;text-decoration:none;color:#241A16;background:#FFF6F1;border-radius:26px;padding:16px 20px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12);transition:transform .3s cubic-bezier(.34,1.4,.64,1)"
              hover="transform:translateX(5px)"
            >
              <Fx
                as="span"
                s={`width:44px;height:44px;flex:none;border-radius:50%;background:${entry.tint};display:flex;align-items:center;justify-content:center;font-size:20px`}
              >
                {entry.icon}
              </Fx>
              <Fx as="span" s="line-height:1.4;min-width:0">
                <Fx
                  as="span"
                  s={`display:block;font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${tone.faint}`}
                >
                  {entry.label}
                </Fx>
                <Fx as="span" s="display:block;font-weight:700;font-size:15px;margin-top:4px;word-break:break-word">
                  {entry.value}
                </Fx>
              </Fx>
            </Fx>
          ))}
        </Fx>
      </Card>
    </>
  );
}
