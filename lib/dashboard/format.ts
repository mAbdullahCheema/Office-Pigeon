/**
 * Date formatting for the dashboard.
 *
 * Fixed to `en-US` and UTC on purpose: these strings are rendered on the server
 * and hydrated on the client, and a locale or zone that differs between the two
 * produces a hydration mismatch on every timestamp on the page.
 */

const date = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
});

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : date.format(parsed);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : `${dateTime.format(parsed)} UTC`;
}

/** Joins the parts of a row's meta line, dropping the empty ones. */
export function metaLine(parts: (string | number | null | undefined)[]): string {
  return parts
    .map((part) => (part === null || part === undefined ? '' : String(part).trim()))
    .filter(Boolean)
    .join(' · ');
}
