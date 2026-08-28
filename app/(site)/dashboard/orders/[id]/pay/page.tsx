import type { Metadata } from 'next';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Notice } from '@/components/site/dashboard/Notice';
import { PaymentForm } from '@/components/site/dashboard/PaymentForm';
import { Badge, Card, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { owns, requireViewer } from '@/lib/auth';
import { money, paymentTint, statusTint } from '@/lib/catalog';
import { formatDate } from '@/lib/dashboard/format';
import { getOrder, listPaymentMethods, listPayments } from '@/lib/data';
import { awaitingPayment, PAYMENT_STATUS_LABELS } from '@/lib/order-status';
import { routes } from '@/lib/routes';
import { lineItems } from '@/lib/supabase/types';

import { submitPaymentAction } from '../../../actions';

export const metadata: Metadata = { title: 'Pay an order' };

export default async function PayOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const [{ id }, query] = await Promise.all([params, searchParams]);

  const order = await getOrder(id).catch(() => null);
  if (!order) notFound();
  // A row id is guessable, so ownership is re-checked here rather than being
  // assumed from the fact that the link was followed.
  if (!owns(viewer, order)) notFound();

  const [methods, payments] = await Promise.all([
    listPaymentMethods(),
    listPayments({ orderId: order.id, limit: 20 }).catch(() => []),
  ]);

  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const error = first(query.error);

  const gross = order.amount_due || order.price || 0;
  const due = Math.max(0, gross - (order.amount_paid || 0));
  const payable = awaitingPayment(order.status, order.payment_status);
  const status = statusTint(order.status);
  const pay = paymentTint(order.payment_status);
  const items = lineItems(order.custom_items);

  return (
    <>
      {error ? <Notice tone="bad">{error}</Notice> : null}

      <Card>
        <SectionHead
          title={`Order ${order.ref}`}
          note={`Placed ${formatDate(order.created_at)}`}
          action={
            <>
              <Badge bg={status.bg} fg={status.fg}>
                {order.status}
              </Badge>
              <Badge bg={pay.bg} fg={pay.fg}>
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </Badge>
            </>
          }
        />

        <Fx s="margin-top:20px;display:flex;flex-direction:column;gap:10px">
          <SummaryRow label="Item" value={order.item_name ?? order.item_id} />
          {order.plan_name ? <SummaryRow label="Plan" value={order.plan_name} /> : null}
          <SummaryRow
            label="Amount"
            value={`${money(gross, order.currency)}${order.unit ? ` ${order.unit}` : ''}`}
          />
          {order.amount_paid > 0 ? (
            <SummaryRow label="Already paid" value={money(order.amount_paid, order.currency)} />
          ) : null}
          <SummaryRow label="Outstanding" value={due > 0 ? money(due, order.currency) : 'Nothing due'} />
        </Fx>

        {items.length ? (
          <Fx s="margin-top:18px">
            <Fx
              s={`font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${tone.faint}`}
            >
              What is included
            </Fx>
            <Fx s="display:flex;flex-direction:column;gap:8px;margin-top:10px">
              {items.map((item, index) => (
                <Fx
                  key={index}
                  s="display:flex;align-items:center;justify-content:space-between;gap:14px;background:#FFF6F1;border-radius:18px;padding:12px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)"
                >
                  <Fx as="span" s="font-size:14px;font-weight:600;min-width:0;word-break:break-word">
                    {item.description || 'Item'}
                    {item.qty > 1 ? ` × ${item.qty}` : ''}
                  </Fx>
                  <Fx as="span" s="font-size:14px;font-weight:800;white-space:nowrap">
                    {money((Number(item.qty) || 1) * (Number(item.unitPrice) || 0), order.currency)}
                  </Fx>
                </Fx>
              ))}
            </Fx>
          </Fx>
        ) : null}

        {order.notes ? (
          <Fx s="margin-top:18px;background:#FFF6F1;border-radius:22px;padding:16px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)">
            <Fx as="p" s={`font-size:14px;line-height:1.6;color:${tone.muted};margin:0;white-space:pre-wrap`}>
              {order.notes}
            </Fx>
          </Fx>
        ) : null}
      </Card>

      {payable ? (
        methods.length ? (
          <PaymentForm
            action={submitPaymentAction}
            orderId={order.id}
            orderRef={order.ref}
            amountDue={due}
            orderCurrency={order.currency || 'USD'}
            methods={methods.map((method) => ({
              id: method.method_id,
              label: method.label,
              kind: method.kind,
              currency: method.currency,
              address: method.address,
              network: method.network ?? '',
              accountName: method.account_name ?? '',
              bankName: method.bank_name ?? '',
              branch: method.branch ?? '',
              iban: method.iban ?? '',
              swift: method.swift ?? '',
              instructions: method.instructions ?? '',
              icon: method.icon || '💳',
              tint: method.tint || '#FFF4D8',
            }))}
          />
        ) : (
          <Card>
            <SectionHead
              title="Payment details are being set up"
              note="Message us and we will send you where to pay directly."
            />
          </Card>
        )
      ) : (
        <Card>
          <SectionHead
            title={
              order.payment_status === 'awaiting_verification'
                ? 'We are checking your payment'
                : order.payment_status === 'paid'
                  ? 'This order is paid'
                  : 'Nothing to pay right now'
            }
            note={
              order.payment_status === 'awaiting_verification'
                ? 'A person checks every transfer by hand. You will see the order move as soon as it clears.'
                : order.payment_status === 'paid'
                  ? 'Thanks — the full amount is in. Everything else happens on our side.'
                  : 'We confirm the price in writing before anything is charged.'
            }
          />
        </Card>
      )}

      {payments.length ? (
        <Card>
          <SectionHead title="Payments against this order" />
          <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:16px">
            {payments.map((payment) => (
              <Fx
                key={payment.id}
                s="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;background:#FFF6F1;border-radius:20px;padding:14px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)"
              >
                <Fx as="span" s="font-size:14px;font-weight:700;min-width:0">
                  {money(payment.amount, payment.currency)} · {payment.method_label ?? payment.method}
                  <Fx as="span" s={`display:block;font-size:12.5px;font-weight:500;color:${tone.muted};margin-top:3px`}>
                    {payment.ref} · {formatDate(payment.created_at)}
                    {payment.admin_note ? ` · ${payment.admin_note}` : ''}
                  </Fx>
                </Fx>
                <Badge
                  bg={payment.status === 'verified' ? '#E9FBF3' : payment.status === 'rejected' ? '#FFEDE3' : '#EEEBFE'}
                  fg={payment.status === 'verified' ? '#0F9C6E' : payment.status === 'rejected' ? '#B4230C' : '#5A48D6'}
                >
                  {payment.status === 'submitted' ? 'Checking' : payment.status}
                </Badge>
              </Fx>
            ))}
          </Fx>
        </Card>
      ) : null}

      <Fx>
        <Fx
          as={Link}
          href={`${routes.dashboard}/orders`}
          s={`text-decoration:none;font-weight:700;font-size:13.5px;color:${tone.muted}`}
        >
          ← Back to your orders
        </Fx>
      </Fx>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Fx s="display:flex;align-items:center;justify-content:space-between;gap:14px;background:#FFF6F1;border-radius:20px;padding:13px 18px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)">
      <Fx
        as="span"
        s={`font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${tone.faint}`}
      >
        {label}
      </Fx>
      <Fx as="span" s="font-size:15px;font-weight:800;text-align:right;word-break:break-word">
        {value}
      </Fx>
    </Fx>
  );
}
