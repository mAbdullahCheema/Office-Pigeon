import 'server-only';

/** Best-effort client IP behind Hostinger's reverse proxy. */
export function clientIp(request: Request): string | undefined {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim();
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? undefined;
}

/**
 * Country of the visitor, taken from an edge header when the host provides one.
 * The browser may post its own country with the form, so this is the
 * server-side fallback for when it does not.
 */
export function edgeCountry(request: Request): string | undefined {
  const headers = request.headers;
  return (
    headers.get('cf-ipcountry') ??
    headers.get('x-vercel-ip-country') ??
    headers.get('x-geo-country') ??
    undefined
  );
}
