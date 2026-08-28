import type { Metadata } from 'next';

import Link from 'next/link';

import { Badge, Card, Empty, Row, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Notice } from '@/components/site/dashboard/Notice';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { money, paymentTint, statusTint } from '@/lib/catalog';
import { formatDate } from '@/lib/dashboard/format';
import { listOrdersForUser, listPayments } from '@/lib/data';
import { awaitingPayment, PAYMENT_STATUS_LABELS } from '@/lib/order-status';
import { routes } from '@/lib/routes';

export const metadata: Metadata = { title: 'Orders' };

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;

  const [orders, payments] = await Promise.all([
    listOrdersForUser(viewer.id, viewer.email),
    listPayments({ userId: viewer.id, limit: 50 }).catch(() => []),
  ]);

  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  return (
    <>
      {first(params.paid) ? (
        <Notice tone="good">
          Thanks — we have your payment details for {first(params.paid)}. We check transfers by hand, usually within a
          few hours, and the order moves on as soon as it clears.
        </Notice>
      ) : null}
      {first(params.error) ? <Notice tone="bad">{first(params.error)}</Notice> : null}

      <Card flush>
        <SectionHead
          flush
          title="Your orders"
          note={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} on file`}
          action={
            <Fx
              as={Link}
              href={routes.order}
              s="text-decoration:none;font-size:13px;font-weight:800;color:#E8480F;padding-top:6px"
            >
              New order →
            </Fx>
          }
        />

        {orders.map((order) => {
          const tint = statusTint(order.status);
          const pay = paymentTint(order.payment_status);
          const due = Math.max(0, (order.amount_due || order.price || 0) - (order.amount_paid || 0));

          return (
            <Row
              key={order.id}
              icon="🧾"
              title={`${order.item_name ?? order.item_id}${order.plan_name ? ` · ${order.plan_name}` : ''}`}
              meta={
                <>
                  {order.ref} · placed {formatDate(order.created_at)} ·{' '}
                  {money(order.amount_due || order.price, order.currency)}
                  {order.unit ? ` ${order.unit}` : ''}
                  {due > 0 ? ` · ${money(due, order.currency)} outstanding` : ''}
                </>
              }
              trailing={
                <>
                  <Badge bg={tint.bg} fg={tint.fg}>
                    {order.status}
                  </Badge>
                  <Badge bg={pay.bg} fg={pay.fg}>
                    {PAYMENT_STATUS_LABELS[order.payment_status]}
                  </Badge>
                </>
              }
              action={
                awaitingPayment(order.status, order.payment_status) ? (
                  <Fx
                    as={Link}
                    href={`${routes.dashboard}/orders/${order.id}/pay`}
                    s="text-decoration:none;font-weight:700;font-size:13px;color:#fff;padding:11px 18px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 10px 20px rgba(226,78,23,.3);white-space:nowrap"
                  >
                    Pay now
                  </Fx>
                ) : (
                  <Fx
                    as={Link}
                    href={`${routes.dashboard}/orders/${order.id}/pay`}
                    s={`text-decoration:none;font-weight:700;font-size:12.5px;color:${tone.muted};white-space:nowrap`}
                  >
                    Details
                  </Fx>
                )
              }
            />
          );
        })}

        {orders.length === 0 ? (
          <Empty
            title="No orders yet"
            body="Once you place an order it shows up here with its status, its price and where to pay."
            action={
              <Fx
                as={Link}
                href={routes.order}
                s="display:inline-flex;text-decoration:none;color:#fff;font-weight:700;font-size:14.5px;padding:14px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34)"
              >
                Place an order
              </Fx>
            }
          />
        ) : null}
      </Card>

      {payments.length ? (
        <Card flush>
          <SectionHead flush title="Payments you have sent" note="Every transfer you have told us about." />
          {payments.map((payment) => {
            const badge =
              payment.status === 'verified'
                ? { bg: '#E9FBF3', fg: '#0F9C6E' }
                : payment.status === 'rejected'
                  ? { bg: '#FFEDE3', fg: '#B4230C' }
                  : payment.status === 'refunded'
                    ? { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' }
                    : { bg: '#EEEBFE', fg: '#5A48D6' };

            return (
              <Row
                key={payment.id}
                icon="🪙"
                tint="#E9FBF3"
                title={`${money(payment.amount, payment.currency)} · ${payment.method_label ?? payment.method}`}
                meta={`${payment.ref}${payment.order_ref ? ` · order ${payment.order_ref}` : ''} · sent ${formatDate(
                  payment.created_at,
                )}${payment.reference ? ` · ref ${payment.reference}` : ''}`}
                trailing={
                  <Badge bg={badge.bg} fg={badge.fg}>
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
            );
          })}
        </Card>
      ) : null}
    </>
  );
}
