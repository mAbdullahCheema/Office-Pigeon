/**
 * Small request/payload helpers shared by the Next form Route Handlers.
 * Ported 1:1 from the Express server (server.ts) so behavior matches during
 * the Phase 3 migration.
 */
export const nonEmptyString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const compactObject = (payload: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  );
