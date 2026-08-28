/**
 * The order and payment lifecycles.
 *
 * Deliberately dependency-free: the Postgres `order_status` and
 * `payment_status` enums carry exactly these labels, and client components
 * render badges from them, so neither side can drift and neither pulls the
 * other's module graph into its bundle.
 */

export const ORDER_STATUSES = [
  'Awaiting confirmation',
  'Awaiting payment',
  'Confirmed',
  'In build',
  'Live',
  'Closed',
  'Cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'unpaid',
  'awaiting_verification',
  'paid',
  'partially_paid',
  'refunded',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  awaiting_verification: 'Checking payment',
  paid: 'Paid',
  partially_paid: 'Part paid',
  refunded: 'Refunded',
};

/** Order states where the customer is expected to send money. */
export function awaitingPayment(status: OrderStatus, paymentStatus: PaymentStatus): boolean {
  if (status === 'Cancelled' || status === 'Closed') return false;
  return paymentStatus === 'unpaid' || paymentStatus === 'partially_paid';
}
