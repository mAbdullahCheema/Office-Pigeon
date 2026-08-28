import { notFound, redirect } from 'next/navigation';

import { requireViewer } from '@/lib/auth';
import { routes } from '@/lib/routes';

/** The management area has no landing screen of its own — orders is the door. */
export default async function ManageIndexPage() {
  const viewer = await requireViewer();
  if (viewer.role !== 'admin') notFound();
  redirect(`${routes.dashboard}/manage/orders`);
}
