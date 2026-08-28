import type { ResourceField } from './resources';

/**
 * Turns a submitted form into a Postgres row.
 *
 * Every value arrives as a string, and the columns are typed, so this is where
 * the two meet. `null` is meaningful — it clears a nullable column — which is
 * why an empty date, email or uuid must become `null` rather than `''`:
 * Postgres rejects an empty string on a `timestamptz` or `uuid` column outright.
 */

export class InvalidFieldError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
  }
}

function coerce(field: ResourceField, formData: FormData): unknown {
  const raw = formData.get(field.key);

  if (field.type === 'checkbox') {
    // An unticked checkbox is absent from the payload entirely.
    return raw === 'on' || raw === 'true';
  }

  const value = typeof raw === 'string' ? raw.trim() : '';

  switch (field.type) {
    case 'number': {
      if (value === '') return 0;
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        throw new InvalidFieldError(field.key, `${field.label} must be a number.`);
      }
      return parsed;
    }

    case 'list':
      return value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    case 'datetime': {
      if (value === '') return null;
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new InvalidFieldError(field.key, `${field.label} is not a valid date.`);
      }
      return parsed.toISOString();
    }

    case 'json': {
      if (value === '') return null;
      try {
        // The column is `jsonb`, so hand Postgres the parsed value rather than
        // a string of JSON — the two are not the same thing to a jsonb column.
        return JSON.parse(value);
      } catch {
        throw new InvalidFieldError(field.key, `${field.label} must be valid JSON.`);
      }
    }

    // An empty enum, address or key has to clear the column, not write ''.
    case 'email':
    case 'select':
    case 'uuid':
      return value === '' ? null : value;

    default:
      return value;
  }
}

export function formToRow(fields: ResourceField[], formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    // A form may render a subset of the resource's fields; anything absent is
    // left untouched rather than being blanked.
    if (field.type !== 'checkbox' && !formData.has(field.key)) continue;
    if (field.type === 'checkbox' && !formData.has(`${field.key}__present`)) continue;

    data[field.key] = coerce(field, formData);
  }

  return data;
}

/** Renders a stored value back into the form control that produced it. */
export function rowToInput(field: ResourceField, raw: unknown): string {
  if (raw === undefined || raw === null) {
    return field.type === 'number' ? '0' : '';
  }

  if (field.type === 'list') {
    return Array.isArray(raw) ? raw.join('\n') : String(raw);
  }

  if (field.type === 'datetime') {
    const date = new Date(String(raw));
    if (Number.isNaN(date.getTime())) return '';
    // `datetime-local` wants `YYYY-MM-DDTHH:mm` with no zone marker.
    return date.toISOString().slice(0, 16);
  }

  return String(raw);
}
