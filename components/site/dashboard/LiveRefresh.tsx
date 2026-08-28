'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';

/**
 * Keeps the dashboard current without a reload.
 *
 * Subscribes to the tables a viewer can act on and re-renders the current
 * server component tree when one of them changes — so an admin verifying a
 * payment moves the customer's order in front of them, and a staff reply lands
 * in an open Messages tab.
 *
 * Row level security governs the socket exactly as it governs a read, so a
 * customer is only ever sent changes to rows their own policies already let
 * them see. The `user_id` filter below is a bandwidth saving, not the
 * protection.
 */

/** Tables that carry a `user_id`, so a customer's stream can be narrowed. */
const OWNED_TABLES = [
  'orders',
  'payments',
  'invoices',
  'threads',
  'customer_files',
  'enrollments',
  // A customer's own notifications carry their user_id like everything else.
  'notifications',
] as const;

/** Additionally interesting to staff, and not scoped to one account. */
const STAFF_TABLES = [
  'leads',
  'bookings',
  'contact_messages',
  'chat_conversations',
  // Team notifications have a null user_id, so staff subscribe unfiltered.
  'notifications',
] as const;

export function LiveRefresh({ userId, isStaff }: { userId: string; isStaff: boolean }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`dashboard:${userId}`);

    // A burst of related writes — verifying a payment touches the payment and
    // the order — should cost one re-render, not one per row.
    let pending: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (pending) clearTimeout(pending);
      pending = setTimeout(() => router.refresh(), 250);
    };

    for (const table of OWNED_TABLES) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(isStaff ? {} : { filter: `user_id=eq.${userId}` }),
        },
        refresh,
      );
    }

    if (isStaff) {
      for (const table of STAFF_TABLES) {
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, refresh);
      }
    }

    channel.subscribe();

    return () => {
      if (pending) clearTimeout(pending);
      supabase.removeChannel(channel);
    };
  }, [router, userId, isStaff]);

  return null;
}
