/**
 * Where to send someone after they sign in.
 *
 * The target arrives as a query parameter, so it is attacker-controlled: an
 * absolute URL here would turn the login page into an open redirect that
 * phishing can point anywhere. Only same-site absolute paths survive.
 */
export function safeRedirect(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value) return fallback;

  const target = value.trim();

  // Must be rooted, and must not be protocol-relative (`//evil.com`) or a
  // backslash variant that some browsers normalise into one.
  if (!target.startsWith('/')) return fallback;
  if (target.startsWith('//')) return fallback;
  if (target.includes('\\')) return fallback;

  // A control character can smuggle a header break past a naive parser.
  for (let index = 0; index < target.length; index += 1) {
    const code = target.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return fallback;
  }

  return target;
}
