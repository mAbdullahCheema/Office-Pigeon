import { NextResponse } from 'next/server';

import { guard, sameOrigin, withHeaders } from '@/lib/api-guard';
import { currentViewer } from '@/lib/auth';
import { createOrder, nextOrderRef } from '@/lib/data';
import { purgeViewer } from '@/lib/cache';
import { clientIp } from '@/lib/request';
import { getCatalog } from '@/lib/site-content';
import { spamScore, SPAM_THRESHOLD } from '@/lib/spam';
import { fieldErrors, orderSchema } from '@/lib/validation';

/**
 * Order requests.
 *
 * Nothing is charged here. The row records what was asked for, priced from the
 * published catalog rather than from the browser, and enters the lifecycle at
 * `Awaiting payment` with the amount the customer will be asked to transfer.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 403 });
  }

  const viewer = await currentViewer();
  const limit = await guard(request, 'order', viewer?.id);
  if (!limit.ok) return limit.limited();

  const body = await request.json().catch(() => null);
  if (!body) {
    return withHeaders(
      NextResponse.json({ errors: { form: 'Invalid request' } }, { status: 400 }),
      limit.headers,
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return withHeaders(
      NextResponse.json({ errors: fieldErrors(parsed.error) }, { status: 422 }),
      limit.headers,
    );
  }

  const input = parsed.data;
  const catalog = await getCatalog();
  const item = catalog.find((entry) => entry.itemId === input.itemId);
  const plan = item?.plans.find((entry) => entry.id === input.planId);

  // Products are still in build. The order form does not offer them, and this
  // refuses a request that names one anyway.
  if (!item || !plan || item.group === 'Products') {
    return withHeaders(
      NextResponse.json({ errors: { form: 'That item is no longer available' } }, { status: 422 }),
      limit.headers,
    );
  }

  const score = spamScore({ name: input.name, email: input.email, message: input.notes ?? '' });
  const ref = await nextOrderRef();

  const order = await createOrder({
    ref,
    status: 'Awaiting payment',
    verified: false,
    item_id: item.itemId,
    item_name: item.name,
    plan_id: plan.id,
    plan_name: plan.name,
    price: plan.price,
    unit: plan.unit,
    group_key: item.group,
    currency: 'USD',
    // The published figure is the starting point; staff can revise it before
    // the customer pays, and the payment screen always reads this column.
    amount_due: plan.price,
    amount_paid: 0,
    payment_status: 'unpaid',
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    company: input.company || null,
    country: input.country || null,
    notes: [input.notes, input.timeline ? `Timeline: ${input.timeline}` : ''].filter(Boolean).join('\n\n'),
    // Attaching the account here is what makes the order show up in the
    // customer's dashboard straight away rather than only after a later match.
    user_id: viewer?.id ?? null,
    ip: clientIp(request) ?? null,
    spam_score: score,
  });

  if (viewer) await purgeViewer(viewer.id);

  return withHeaders(
    NextResponse.json(
      {
        ok: true,
        ref: order.ref,
        status: order.status,
        orderId: order.id,
        /** Where to send the customer to pay, when they are signed in. */
        payHref: viewer ? `/dashboard/orders/${order.id}/pay` : null,
        spam: score >= SPAM_THRESHOLD,
      },
      { status: 201 },
    ),
    limit.headers,
  );
}
