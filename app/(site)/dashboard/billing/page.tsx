import type { Metadata } from 'next';

import { Badge, Card, Empty, Row, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { money } from '@/lib/catalog';
import { formatDate } from '@/lib/dashboard/format';
import { listInvoices, listPayments } from '@/lib/data';

export const metadata: Metadata = { title: 'Billing' };

const invoiceTint: Record<string, { bg: string; fg: string }> = {
  paid: { bg: '#E9FBF3', fg: '#0F9C6E' },
  sent: { bg: '#FFF4D8', fg: '#B07C00' },
  overdue: { bg: '#FFEDE3', fg: '#B4230C' },
  draft: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
  void: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.45)' },
};

export default async function BillingPage() {
  const viewer = await requireViewer();

  const [invoices, payments] = await Promise.all([
    listInvoices({ userId: viewer.id, limit: 100 }).catch(() => []),
    listPayments({ userId: viewer.id, limit: 100 }).catch(() => []),
  ]);

  // A draft is our working copy, not a bill — the customer should never see it.
  const visible = invoices.filter((invoice) => invoice.status !== 'draft');
  const outstanding = visible
    .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <>
      <Card flush>
        <SectionHead
          flush
          title="Invoices"
          note={
            outstanding > 0
              ? `${money(outstanding)} outstanding across ${visible.length} invoices`
              : 'Everything issued to your account'
          }
        />

        {visible.map((invoice) => {
          const tint = invoiceTint[invoice.status] ?? invoiceTint.draft;
          return (
            <Row
              key={invoice.id}
              icon="🧾"
              tint="#FFF4D8"
              title={invoice.title || `Invoice ${invoice.number}`}
              meta={`${invoice.number}${invoice.order_ref ? ` · order ${invoice.order_ref}` : ''} · ${
                invoice.status === 'paid'
                  ? `paid ${formatDate(invoice.paid_at ?? invoice.issued_at)}`
                  : invoice.due_at
                    ? `due ${formatDate(invoice.due_at)}`
                    : `issued ${formatDate(invoice.issued_at ?? invoice.created_at)}`
              }`}
              trailing={
                <Fx
                  as="span"
                  s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:18px;color:#E8480F;white-space:nowrap"
                >
                  {money(invoice.total, invoice.currency)}
                </Fx>
              }
              action={
                <Badge bg={tint.bg} fg={tint.fg}>
                  {invoice.status}
                </Badge>
              }
            />
          );
        })}

        {visible.length === 0 ? (
          <Empty
            title="No invoices yet"
            body="We invoice only what we have confirmed with you in writing. Anything issued appears here."
          />
        ) : null}
      </Card>

      {payments.length ? (
        <Card flush>
          <SectionHead flush title="Payment history" note="Every transfer you have told us about." />
          {payments.map((payment) => (
            <Row
              key={payment.id}
              icon="🪙"
              tint="#E9FBF3"
              title={`${money(payment.amount, payment.currency)} · ${payment.method_label ?? payment.method}`}
              meta={`${payment.ref}${payment.order_ref ? ` · order ${payment.order_ref}` : ''} · ${formatDate(
                payment.created_at,
              )}`}
              trailing={
                <Badge
                  bg={payment.status === 'verified' ? '#E9FBF3' : payment.status === 'rejected' ? '#FFEDE3' : '#EEEBFE'}
                  fg={payment.status === 'verified' ? '#0F9C6E' : payment.status === 'rejected' ? '#B4230C' : '#5A48D6'}
                >
                  {payment.status === 'submitted' ? 'Checking' : payment.status}
                </Badge>
              }
              action={
                payment.proof_path ? (
                  <Fx
                    as="a"
                    href={`/api/files/proof/${payment.id}`}
                    target="_blank"
                    rel="noreferrer"
                    s={`text-decoration:none;font-weight:700;font-size:12.5px;color:${tone.muted};white-space:nowrap`}
                  >
                    Receipt
                  </Fx>
                ) : null
              }
            />
          ))}
        </Card>
      ) : null}

      <Fx s="background:#FFF4D8;border-radius:30px;padding:24px 28px;box-shadow:inset 0 2px 4px rgba(255,255,255,.8)">
        <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:18px">
          About these amounts
        </Fx>
        <Fx as="p" s={`font-size:14px;line-height:1.62;color:rgba(36,26,22,.66);margin:9px 0 0;max-width:62ch;text-wrap:pretty`}>
          Amounts reflect the quote we confirmed with you. Prices can vary with region, currency and scope, so we always
          confirm in writing before invoicing. Questions on a line item? Message us from the Messages tab and we will
          explain it.
        </Fx>
      </Fx>
    </>
  );
}
