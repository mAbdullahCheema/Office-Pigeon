import type { CSSProperties, ElementType, ReactNode } from 'react';

/**
 * The redesign markup carries its styling as CSS declaration strings, exactly
 * as it was authored in the prototype. `Fx` renders one element from such a
 * string and, when the element needs a hover or pressed treatment, emits a
 * deduplicated stylesheet rule for it.
 */

/**
 * Parsed declaration strings, kept so a repeated literal is only split once.
 *
 * Bounded, because plenty of call sites build their string by interpolation —
 * a row's status colour, a card's tint — and an unbounded map would grow with
 * the data for as long as the server process lives.
 */
const parseCache = new Map<string, CSSProperties>();
const PARSE_CACHE_MAX = 4_000;

function toReactProperty(property: string): string {
  if (property.startsWith('--')) return property;
  return property
    .replace(/^-(\w)/, (_, c: string) => c.toUpperCase())
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

/** Turn `"display:flex;gap:8px"` into a React style object. */
export function css(declarations?: string): CSSProperties | undefined {
  if (!declarations) return undefined;
  const cached = parseCache.get(declarations);
  if (cached) return cached;

  const style: Record<string, string> = {};
  for (const declaration of declarations.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator < 0) continue;
    const property = declaration.slice(0, separator).trim();
    const value = declaration.slice(separator + 1).trim();
    if (!property || !value) continue;
    style[toReactProperty(property)] = value;
  }

  // The literals that repeat are hit constantly, so a full clear costs one
  // re-parse each and is far cheaper than tracking recency per entry.
  if (parseCache.size >= PARSE_CACHE_MAX) parseCache.clear();
  parseCache.set(declarations, style);

  return style as CSSProperties;
}

/** Every state declaration has to outrank the element's own inline style. */
function important(declarations: string): string {
  return declarations
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => `${declaration} !important`)
    .join(';');
}

function hash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

type FxProps = {
  as?: ElementType;
  /** The element's own declarations, as a CSS string. */
  s?: string;
  /** Declarations applied on `:hover`. */
  hover?: string;
  /** Declarations applied on `:active`. */
  active?: string;
  className?: string;
  children?: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [attribute: string]: any;
};

export function Fx({ as: Tag = 'div', s, hover, active, className, children, ...rest }: FxProps) {
  if (!hover && !active) {
    return (
      <Tag className={className} style={css(s)} {...rest}>
        {children}
      </Tag>
    );
  }

  const key = `fx${hash(`${hover ?? ''}|${active ?? ''}`)}`;
  const rules = [
    hover ? `.${key}:hover{${important(hover)}}` : '',
    active ? `.${key}:active{${important(active)}}` : '',
  ].join('');

  return (
    <>
      <style href={key} precedence="fx">
        {rules}
      </style>
      <Tag className={className ? `${className} ${key}` : key} style={css(s)} {...rest}>
        {children}
      </Tag>
    </>
  );
}
