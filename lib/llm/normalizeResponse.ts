export function normalizeText(value: unknown, provider: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${provider} returned an empty answer.`);
  }

  return value.trim();
}

export async function postJson(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  signal: AbortSignal
) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data.error) : response.statusText;
    throw new Error(`${response.status} ${detail}`);
  }

  return data as Record<string, any>;
}
