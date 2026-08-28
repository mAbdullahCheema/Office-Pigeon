import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ConfirmSubmit } from '@/components/site/dashboard/ConfirmSubmit';
import { Notice } from '@/components/site/dashboard/Notice';
import { PaymentReview } from '@/components/site/dashboard/PaymentReview';
import { RecordForm } from '@/components/site/dashboard/RecordForm';
import { SetPassword } from '@/components/site/dashboard/SetPassword';
import { controls } from '@/components/site/dashboard/styles';
import { Badge, Card, Empty, Row, SectionHead, tone } from '@/components/site/dashboard/ui';
import { Fx } from '@/components/ui/Fx';
import { requireViewer } from '@/lib/auth';
import { formatDate, metaLine } from '@/lib/dashboard/format';
import { findResource, type Resource } from '@/lib/dashboard/resources';
import { routes } from '@/lib/routes';
import { admin } from '@/lib/supabase/admin';

import {
  deleteRecordAction,
  reviewPaymentAction,
  saveRecordAction,
  setCustomerPasswordAction,
} from '../../actions';

type AnyRow = Record<string, unknown> & { id: string; created_at: string };

const PAGE_SIZE = 50;

/** Status colours, by the value the column actually holds. */
const badgeTint: Record<string, { bg: string; fg: string }> = {
  // Good
  verified: { bg: '#E9FBF3', fg: '#0F9C6E' },
  paid: { bg: '#E9FBF3', fg: '#0F9C6E' },
  won: { bg: '#E9FBF3', fg: '#0F9C6E' },
  confirmed: { bg: '#E9FBF3', fg: '#0F9C6E' },
  Confirmed: { bg: '#E9FBF3', fg: '#0F9C6E' },
  Live: { bg: '#E9FBF3', fg: '#0F9C6E' },
  active: { bg: '#E9FBF3', fg: '#0F9C6E' },
  open: { bg: '#E9FBF3', fg: '#0F9C6E' },
  // Working
  'In build': { bg: '#EEEBFE', fg: '#5A48D6' },
  submitted: { bg: '#EEEBFE', fg: '#5A48D6' },
  qualified: { bg: '#EEEBFE', fg: '#5A48D6' },
  scheduled: { bg: '#EEEBFE', fg: '#5A48D6' },
  resolved: { bg: '#EEEBFE', fg: '#5A48D6' },
  // Waiting
  'Awaiting payment': { bg: '#FFF4D8', fg: '#96690A' },
  'Awaiting confirmation': { bg: '#FFEDE3', fg: '#E8480F' },
  sent: { bg: '#FFF4D8', fg: '#B07C00' },
  pending: { bg: '#FFF4D8', fg: '#B07C00' },
  requested: { bg: '#FFF4D8', fg: '#B07C00' },
  rescheduling: { bg: '#FFF4D8', fg: '#B07C00' },
  new: { bg: '#FFEDE3', fg: '#E8480F' },
  unread: { bg: '#FFEDE3', fg: '#E8480F' },
  overdue: { bg: '#FFEDE3', fg: '#B4230C' },
  // Ended
  rejected: { bg: '#FFEDE3', fg: '#B4230C' },
  spam: { bg: '#FFEDE3', fg: '#B4230C' },
  lost: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
  Closed: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
  Cancelled: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.45)' },
  cancelled: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.45)' },
  closed: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
  draft: { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' },
};

function tintFor(value: string) {
  return badgeTint[value] ?? { bg: '#FFF6F1', fg: 'rgba(36,26,22,.6)' };
}

/**
 * Escapes a search term for PostgREST's `or` filter.
 *
 * The filter is a comma-separated list and quotes its values, so a comma or a
 * quote in the term would otherwise be read as syntax rather than as text.
 */
function escapeTerm(term: string): string {
  return term.replace(/[\\"]/g, '\\$&').replace(/[,()]/g, ' ');
}

/**
 * Reads one page of a resource.
 *
 * Search runs in Postgres across the columns the resource nominates, so the
 * result is the best match in the whole table rather than the best match inside
 * whichever fifty rows happened to load.
 */
async function readPage(resource: Resource, search: string) {
  let query = admin()
    .from(resource.table)
    .select('*', { count: 'exact' })
    .limit(PAGE_SIZE);

  const sort = resource.sort ?? { key: 'created_at', dir: 'desc' as const };
  query = query.order(sort.key, { ascending: sort.dir === 'asc', nullsFirst: false });

  if (search && resource.searchable?.length) {
    const term = escapeTerm(search);
    query = query.or(resource.searchable.map((column) => `${column}.ilike.%${term}%`).join(','));
  }

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return { rows: (data ?? []) as unknown as AnyRow[], total: count ?? 0 };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ resource: string }>;
}): Promise<Metadata> {
  const { resource } = await params;
  return { title: findResource(resource)?.label ?? 'Manage' };
}

export default async function ManageResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const viewer = await requireViewer();
  if (viewer.role !== 'admin') notFound();

  const [{ resource: resourceId }, query] = await Promise.all([params, searchParams]);
  const resource = findResource(resourceId);
  if (!resource) notFound();

  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const search = (first(query.q) ?? '').trim();
  const editId = first(query.edit);
  const creating = first(query.new) === '1';
  const basePath = `${routes.dashboard}/manage/${resource.id}`;

  let rows: AnyRow[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const result = await readPage(resource, search);
    rows = result.rows;
    total = result.total;
  } catch (error) {
    // Staff must see a backend failure rather than an empty table that looks
    // like there is simply nothing here.
    loadError = (error as Error).message;
  }

  // The row being edited may sit outside the page that loaded, so it is read on
  // its own rather than looked up in the list.
  let editing: AnyRow | null = null;
  if (editId) {
    const { data } = await admin().from(resource.table).select('*').eq('id', editId).maybeSingle();
    editing = (data as AnyRow | null) ?? null;
  }

  // Two resources carry an action a plain edit form cannot express.
  const isPayments = resource.id === 'payments';
  // Only an owner or admin may set someone else's password.
  const canSetPassword =
    resource.id === 'customers' && (viewer.staffRole === 'owner' || viewer.staffRole === 'admin');

  return (
    <>
      {first(query.saved) ? <Notice tone="good">Saved.</Notice> : null}
      {first(query.deleted) ? <Notice tone="good">Deleted.</Notice> : null}
      {first(query.error) ? <Notice tone="bad">{first(query.error)}</Notice> : null}
      {loadError ? (
        <Notice tone="bad">
          Could not load {resource.label.toLowerCase()}: {loadError}
        </Notice>
      ) : null}

      <Card>
        <SectionHead
          title={resource.label}
          note={resource.note ?? `${total} ${total === 1 ? 'record' : 'records'}`}
          action={
            resource.creatable === false ? null : (
              <Fx
                as={Link}
                href={creating ? basePath : `${basePath}?new=1`}
                s={creating ? controls.soft : controls.primary}
              >
                {creating ? 'Close' : `New ${resource.singular}`}
              </Fx>
            )
          }
        />

        <Fx as="form" method="get" s="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
          <Fx
            as="input"
            name="q"
            defaultValue={search}
            placeholder={`Search ${resource.label.toLowerCase()}…`}
            aria-label={`Search ${resource.label}`}
            s={`${controls.input};margin-top:0;flex:1;min-width:min(220px,100%)`}
          />
          <Fx as="button" type="submit" s={`${controls.soft};cursor:pointer`}>
            Search
          </Fx>
          {search ? (
            <Fx as={Link} href={basePath} s={controls.soft}>
              Clear
            </Fx>
          ) : null}
        </Fx>
      </Card>

      {creating ? (
        <RecordForm resource={resource} action={saveRecordAction} cancelHref={basePath} />
      ) : null}

      {editing ? (
        <RecordForm resource={resource} row={editing} action={saveRecordAction} cancelHref={basePath} />
      ) : null}

      <Card flush>
        {rows.map((row) => {
          const badgeValue = resource.badge ? String(row[resource.badge] ?? '') : '';
          const tint = tintFor(badgeValue);

          return (
            <Fx key={row.id}>
              <Row
                icon={resource.icon}
                tint={resource.tint}
                title={String(row[resource.primary] ?? '—') || '—'}
                meta={metaLine([
                  ...(resource.meta ?? []).map((key) => row[key] as string),
                  formatDate(row.created_at),
                ])}
                trailing={badgeValue ? <Badge bg={tint.bg} fg={tint.fg}>{badgeValue}</Badge> : null}
                action={
                  <Fx s="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end">
                    <Fx
                      as={Link}
                      href={`${basePath}?edit=${row.id}${search ? `&q=${encodeURIComponent(search)}` : ''}`}
                      s="text-decoration:none;font-size:12.5px;font-weight:800;color:#E8480F;white-space:nowrap"
                    >
                      Edit
                    </Fx>
                    {resource.deletable === false ? null : (
                      <Fx as="form" action={deleteRecordAction}>
                        <input type="hidden" name="resource" value={resource.id} />
                        <input type="hidden" name="id" value={row.id} />
                        <ConfirmSubmit
                          variant="danger"
                          confirmLabel={`Delete this ${resource.singular}? This cannot be undone.`}
                        >
                          Delete
                        </ConfirmSubmit>
                      </Fx>
                    )}
                  </Fx>
                }
              />

              {canSetPassword ? (
                <SetPassword
                  action={setCustomerPasswordAction}
                  userId={row.id}
                  name={String(row.name ?? row.email ?? 'this customer')}
                />
              ) : null}

              {isPayments ? (
                <PaymentReview
                  action={reviewPaymentAction}
                  id={row.id}
                  status={String(row.status ?? '')}
                  proofHref={row.proof_path ? `/api/files/proof/${row.id}` : null}
                  adminNote={String(row.admin_note ?? '')}
                  reviewedBy={String(row.reviewed_by ?? '')}
                />
              ) : null}
            </Fx>
          );
        })}

        {rows.length === 0 && !loadError ? (
          <Empty
            title={search ? 'Nothing matched' : `No ${resource.label.toLowerCase()} yet`}
            body={
              search
                ? 'Try a shorter search, or clear it to see everything.'
                : resource.creatable === false
                  ? 'Rows appear here as the site produces them.'
                  : `Create the first ${resource.singular} with the button above.`
            }
          />
        ) : null}

        {total > rows.length ? (
          <Fx s={`padding:16px 20px;font-size:12.5px;color:${tone.muted}`}>
            Showing the most recent {rows.length} of {total}. Use search to narrow it down.
          </Fx>
        ) : null}
      </Card>
    </>
  );
}
