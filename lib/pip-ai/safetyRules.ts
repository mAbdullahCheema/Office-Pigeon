export function sanitizeVisitorText(value: string, max = 4000) {
  return value.replace(/\0/g, '').trim().slice(0, max);
}

export function publicErrorMessage() {
  return 'Something went wrong on my side. You can still continue on WhatsApp or book a free consultation.';
}

export function hashIp(ip: string | null | undefined) {
  if (!ip) return null;
  let hash = 0;
  for (let i = 0; i < ip.length; i += 1) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return `ip_${Math.abs(hash)}`;
}
