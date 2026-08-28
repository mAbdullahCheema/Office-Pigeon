import Link from 'next/link';

import { Badge, Card, Empty, Grid, Row, SectionHead, Stat, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { money, statusTint } from '@/lib/catalog';
import { comingSoonProducts } from '@/lib/coming-soon';
import { formatDate } from '@/lib/dashboard/format';
import { customerSnapshot, dashboardStats } from '@/lib/data';
import { awaitingPayment } from '@/lib/order-status';
import { routes } from '@/lib/routes';

export default async function DashboardOverviewPage() {
  const viewer = await requireViewer();

  const [snapshot, stats] = await Promise.all([
    customerSnapshot(viewer.id, viewer.email),
    // The business counters are an admin-only read, and a customer's dashboard
    // must not pay for them.
    viewer.role === 'admin' ? dashboardStats().catch(() => null) : Promise.resolve(null),
  ]);

  const { orders, invoices } = snapshot;
  const first = viewer.name.split(' ')[0] || 'there';

  const live = orders.filter((order) => order.status === 'Live').length;
  const waiting = orders.filter((order) => order.status === 'Awaiting confirmation').length;
  const toPay = orders.filter((order) => awaitingPayment(order.status, order.payment_status));
  const outstanding = toPay.reduce(
    (sum, order) => sum + Math.max(0, (order.amount_due || order.price || 0) - (order.amount_paid || 0)),
    0,
  );
  const nextInvoice = invoices
    .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
    .sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''))[0];

  return (
    <>
      <Fx s="background:linear-gradient(150deg,#FFEDE3,#FFF6F1 55%,#EEEBFE);border-radius:38px;padding:32px 34px;box-shadow:inset 0 2px 4px rgba(255,255,255,.9), 0 16px 34px rgba(196,120,74,.14);animation:pop .5s cubic-bezier(.34,1.4,.64,1) both">
        <Fx as="h1" s="font-size:clamp(26px,3.2vw,36px);max-width:22ch;margin:0">
          Good to see you, {first}.
        </Fx>
        <Fx
          as="p"
          s={`font-size:15.5px;line-height:1.65;color:rgba(36,26,22,.64);margin:10px 0 0;max-width:56ch;text-wrap:pretty`}
        >
          {toPay.length
            ? `${toPay.length} order${toPay.length === 1 ? '' : 's'} ${
                toPay.length === 1 ? 'is' : 'are'
              } waiting on payment. Send the transfer, upload the screenshot, and we start as soon as it clears.`
            : waiting
              ? `You have ${waiting} order awaiting our confirmation. We reply with a firm price, usually within a few hours.`
              : 'Everything is running. Anything you order is quoted before it is charged, and prices are confirmed for your region first.'}
        </Fx>
      </Fx>

      <Fx className="four" s="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        <Stat label="Orders" value={String(orders.length)} note="all time" />
        <Stat label="Live" value={String(live)} note="running now" color="#0F9C6E" />
        <Stat
          label="To pay"
          value={outstanding > 0 ? money(outstanding) : '—'}
          note={outstanding > 0 ? 'awaiting your transfer' : 'nothing outstanding'}
          color="#5A48D6"
        />
        <Stat
          label="Next invoice"
          value={nextInvoice ? formatDate(nextInvoice.due_at) : '—'}
          note={nextInvoice ? money(nextInvoice.total, nextInvoice.currency) : 'confirmed amounts only'}
          color="#E8A100"
        />
      </Fx>

      {viewer.role === 'admin' && stats ? (
        <Card>
          <SectionHead
            title="Across the business"
            note="Everything waiting on someone here."
            action={
              <Fx
                as={Link}
                href={`${routes.dashboard}/manage/orders`}
                s="text-decoration:none;font-size:13px;font-weight:800;color:#E8480F"
              >
                Open management →
              </Fx>
            }
          />
          <Fx s="margin-top:18px">
            <Grid min={190} gap={12}>
              <Stat label="New leads" value={String(stats.newLeads)} note="not yet contacted" />
              <Stat
                label="Payments to check"
                value={String(stats.paymentsToVerify)}
                note="screenshots submitted"
                color="#5A48D6"
              />
              <Stat
                label="Orders to quote"
                value={String(stats.ordersAwaitingQuote)}
                note="awaiting confirmation"
                color="#E8A100"
              />
              <Stat
                label="Replies owed"
                value={String(stats.threadsNeedingReply)}
                note="dashboard threads"
                color="#0F9C6E"
              />
              <Stat label="Unread mail" value={String(stats.unreadMessages)} note="contact form" />
              <Stat
                label="Collected"
                value={money(stats.revenuePaid)}
                note={`${stats.invoicesPaid} paid invoices`}
                color="#0F9C6E"
              />
            </Grid>
          </Fx>
        </Card>
      ) : null}

      <Card>
        <SectionHead title="Apps in build" note="None of these are open yet — we will tell you when they are." />
        <Fx className="two" s="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px">
          {comingSoonProducts.map((product) => (
            <Fx
              key={product.itemId}
              as={Link}
              className="clay"
              href={product.page}
              s={`display:flex;align-items:center;gap:14px;text-decoration:none;color:#241A16;background:${product.tint};border-radius:26px;padding:18px 20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9)`}
            >
              <Fx
                as="span"
                s="width:46px;height:46px;flex:none;border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:21px;box-shadow:0 8px 18px rgba(196,120,74,.14)"
              >
                {product.icon}
              </Fx>
              <Fx as="span" s="flex:1;min-width:0;line-height:1.4">
                <Fx as="span" s="display:block;font-weight:800;font-size:15.5px">
                  {product.name}
                </Fx>
                <Fx as="span" s={`display:block;font-size:12.5px;color:${tone.muted};margin-top:2px`}>
                  {product.audience}
                </Fx>
              </Fx>
              <Badge bg="#fff" fg={tone.muted}>
                In build
              </Badge>
            </Fx>
          ))}
        </Fx>
      </Card>

      <Card flush>
        <SectionHead
          flush
          title="Recent orders"
          note={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} on file`}
          action={
            <Fx
              as={Link}
              href={`${routes.dashboard}/orders`}
              s="text-decoration:none;font-size:13px;font-weight:800;color:#E8480F;padding-top:6px"
            >
              See all →
            </Fx>
          }
        />
        {orders.slice(0, 5).map((order) => {
          const tint = statusTint(order.status);
          return (
            <Row
              key={order.id}
              icon="🧾"
              title={`${order.item_name ?? order.item_id}${order.plan_name ? ` · ${order.plan_name}` : ''}`}
              meta={`${order.ref} · placed ${formatDate(order.created_at)} · ${money(
                order.amount_due || order.price,
                order.currency,
              )}${order.unit ? ` ${order.unit}` : ''}`}
              trailing={<Badge bg={tint.bg} fg={tint.fg}>{order.status}</Badge>}
              action={
                awaitingPayment(order.status, order.payment_status) ? (
                  <Fx
                    as={Link}
                    href={`${routes.dashboard}/orders/${order.id}/pay`}
                    s="text-decoration:none;font-size:12.5px;font-weight:800;color:#E8480F;white-space:nowrap"
                  >
                    Pay now →
                  </Fx>
                ) : null
              }
            />
          );
        })}
        {orders.length === 0 ? (
          <Empty
            title="Nothing here yet"
            body="Place an order and it will appear the moment you submit it."
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
    </>
  );
}
