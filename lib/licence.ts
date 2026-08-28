import 'server-only';

import { currentViewer } from './auth';
import { listOrders } from './data';

/**
 * Whether the signed-in visitor owns a product. A licence is a verified order
 * for that item that has not been closed; trials are held in the browser (see
 * lib/trial.ts).
 */
export async function hasLicence(itemId: string): Promise<boolean> {
  const viewer = await currentViewer();
  if (!viewer) return false;

  try {
    const orders = await listOrders({ email: viewer.email, limit: 100 });
    return orders.some(
      (order) => order.item_id === itemId && order.verified && order.status !== 'Closed',
    );
  } catch {
    return false;
  }
}
