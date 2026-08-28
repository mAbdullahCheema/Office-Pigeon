'use client';

import { useEffect, useRef, useState } from 'react';

import { Fx } from './Fx';

/**
 * Scroll-to-top button.
 *
 * Positioned by the corner dock in `Shell`, not by itself: the dock stacks this
 * above the chat launcher so the two can never land on top of each other.
 * Unmounting when hidden is deliberate — a button left in the flow at zero
 * opacity would still reserve its slot and push the launcher up the screen.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const shown = useRef(false);

  useEffect(() => {
    // Scroll fires many times a second; only the two crossings of the threshold
    // are worth handing to React.
    const onScroll = () => {
      const next = window.scrollY > 480;
      if (next === shown.current) return;
      shown.current = next;
      setShow(next);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;

  return (
    <Fx
      as="button"
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      s="pointer-events:auto;width:46px;height:46px;flex:none;border-radius:50%;border:none;cursor:pointer;background:#fff;color:#E8480F;font-size:17px;font-weight:800;box-shadow:0 12px 26px rgba(196,120,74,.24), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;animation:pipIn .35s cubic-bezier(.34,1.4,.64,1) both"
      hover="transform:translateY(-3px);box-shadow:0 18px 32px rgba(196,120,74,.3)"
    >
      ↑
    </Fx>
  );
}
