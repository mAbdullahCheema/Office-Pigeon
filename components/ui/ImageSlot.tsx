import { imageVariants } from '@/lib/image-variants';
import { slotMedia } from '@/lib/media';

import { Fx } from './Fx';

type ImageSlotProps = {
  /** Stable slot name — the key media is published against. */
  id: string;
  /** Resolved media URL. Falls back to the published media for `id`. */
  src?: string | null;
  /** Caption shown while the slot is empty; doubles as the alt text. */
  placeholder: string;
  shape?: 'rect' | 'rounded' | 'circle';
  /**
   * The widest this slot ever gets, as a CSS length or a media-query list. It
   * is what the browser picks a `srcset` entry against, so a slot that never
   * exceeds half the page should say so rather than take the 100vw default.
   */
  sizes?: string;
  /** Set on a slot that is visible without scrolling, so it is not deferred. */
  priority?: boolean;
  /** Extra declarations for the slot frame. */
  s?: string;
};

const radii: Record<NonNullable<ImageSlotProps['shape']>, string> = {
  rect: '0',
  rounded: '20px',
  circle: '50%',
};

/**
 * A picture area. Filled slots print the image; empty ones print a soft clay
 * panel captioned with what belongs there.
 */
export function ImageSlot({
  id,
  src,
  placeholder,
  shape = 'rect',
  sizes = '100vw',
  priority = false,
  s,
}: ImageSlotProps) {
  const radius = radii[shape];
  const resolved = src ?? slotMedia[id];

  if (resolved) {
    // Only the images this repo ships have narrow encodes; media published from
    // the dashboard is served as uploaded.
    const variant = imageVariants[resolved];
    const srcSet = variant
      ? variant.widths
          .map((width) =>
            width === variant.width
              ? `${resolved} ${width}w`
              : `${resolved.replace(/\.webp$/, `-${width}w.webp`)} ${width}w`,
          )
          .join(', ')
      : undefined;

    return (
      <Fx
        as="img"
        src={resolved}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        width={variant?.width}
        height={variant?.height}
        alt={placeholder}
        // An image above the fold is usually the largest paint on the page, so
        // deferring it is what makes the page look slow to load.
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
        data-slot={id}
        s={`width:100%;height:100%;object-fit:cover;border-radius:${radius};${s ?? ''}`}
      />
    );
  }

  return (
    <Fx
      data-slot={id}
      s={`width:100%;height:100%;min-height:inherit;border-radius:${radius};display:flex;align-items:center;justify-content:center;padding:18px;text-align:center;background:linear-gradient(150deg,rgba(255,255,255,.55),rgba(255,255,255,0));${s ?? ''}`}
    >
      <Fx
        as="span"
        s="font-size:12px;font-weight:700;letter-spacing:.02em;line-height:1.5;color:rgba(36,26,22,.42);max-width:26ch"
      >
        {placeholder}
      </Fx>
    </Fx>
  );
}
