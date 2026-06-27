/**
 * Visitor country resolution for Next (Phase 3) — ported from server.ts.
 *
 * Works from a Web `Headers` + the request URL search params (no Express).
 * Used by /api/region-offer and (next) the Pakistan geo-gating middleware.
 * Order: dev `?country=` override → trusted edge headers → IP geolocation.
 */

const TRUSTED_COUNTRY_HEADERS = [
  'cf-ipcountry',
  'x-vercel-ip-country',
  'x-country-code',
  'x-nf-client-connection-ip-country',
];

const visitorCountryCache = new Map<string, { country: string | null; expiresAt: number }>();

export const isProductionServer = process.env.NODE_ENV === 'production';

const normalizeCountryCode = (value: unknown): string | null => {
  const country = typeof value === 'string' ? value.trim().toUpperCase() : '';
  return /^[A-Z]{2}$/.test(country) ? country : null;
};

const isPrivateOrLocalIp = (ip: string): boolean => {
  const normalized = ip.replace(/^::ffff:/, '').trim();
  return (
    !normalized ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) ||
    normalized.startsWith('169.254.') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  );
};

export const getClientIp = (headers: Headers): string => {
  const forwardedFor = headers.get('x-forwarded-for');
  const forwardedIp = forwardedFor?.split(',').map((part) => part.trim()).find(Boolean);
  const realIp = headers.get('x-real-ip')?.trim();
  return forwardedIp || realIp || '';
};

const getCountryFromHeaders = (headers: Headers, searchParams?: URLSearchParams): string | null => {
  if (!isProductionServer && searchParams) {
    const simulated = normalizeCountryCode(searchParams.get('country'));
    if (simulated) return simulated;
  }
  for (const name of TRUSTED_COUNTRY_HEADERS) {
    const country = normalizeCountryCode(headers.get(name));
    if (country) return country;
  }
  return null;
};

const lookupCountryByIp = async (ip: string): Promise<string | null> => {
  const normalizedIp = ip.replace(/^::ffff:/, '').trim();
  if (isPrivateOrLocalIp(normalizedIp)) return null;

  const cached = visitorCountryCache.get(normalizedIp);
  if (cached && cached.expiresAt > Date.now()) return cached.country;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch(`https://api.country.is/${encodeURIComponent(normalizedIp)}`, {
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    let country = normalizeCountryCode((data as { country?: unknown })?.country);

    if (!country) {
      const fallback = await fetch(`https://ipinfo.io/${encodeURIComponent(normalizedIp)}/country`, {
        signal: controller.signal,
      });
      country = normalizeCountryCode(await fallback.text().catch(() => ''));
    }

    visitorCountryCache.set(normalizedIp, { country, expiresAt: Date.now() + 6 * 60 * 60 * 1000 });
    return country;
  } catch {
    visitorCountryCache.set(normalizedIp, { country: null, expiresAt: Date.now() + 20 * 60 * 1000 });
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export const resolveVisitorCountry = async (
  headers: Headers,
  searchParams?: URLSearchParams,
): Promise<string | null> => {
  const headerCountry = getCountryFromHeaders(headers, searchParams);
  if (headerCountry) return headerCountry;
  return lookupCountryByIp(getClientIp(headers));
};

/** Whether a dev/local request without geo data may see PK-only content. */
export const devPakistanFallback = (headers: Headers): boolean => {
  if (isProductionServer) return false;
  const ip = getClientIp(headers);
  return isPrivateOrLocalIp(ip) || process.env.ALLOW_PAKISTAN_PAGE_DEV === 'true';
};

/** Can this request access the PK-only page / see the PK offer? */
export const canAccessPakistan = async (
  headers: Headers,
  searchParams?: URLSearchParams,
): Promise<boolean> => {
  const country = await resolveVisitorCountry(headers, searchParams);
  if (country) return country === 'PK';
  return devPakistanFallback(headers);
};
