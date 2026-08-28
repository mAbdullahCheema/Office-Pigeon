'use client';

import { useEffect } from 'react';

/**
 * Arms every `.rv` section that starts below the fold and releases it as it
 * scrolls into view. Sections already on screen at mount are never armed, so
 * the first paint is not blank.
 *
 * This used to run an animation-frame loop for the life of the page, measuring
 * every `.rv` element sixty times a second whether or not anything had moved.
 * That forced a layout per element per frame and kept the site busy while it sat
 * still, which is what made scrolling and typing feel laggy.
 *
 * The loop is gone. Nothing runs while the page is idle, and the listeners are
 * dropped entirely once every section has been released.
 */
export function Reveal() {
  useEffect(() => {
    const known = new WeakSet<Element>();
    /** Armed and not yet released. */
    const waiting = new Set<Element>();

    /** How far down the viewport a section's top may be and still count. */
    const triggerLine = () => window.innerHeight * 0.92;

    /*
     * Releasing is position-based rather than crossing-based on purpose.
     *
     * A flung wheel or an End key can move the page past several sections
     * between two observations. Asking "is it above the line now" releases every
     * one of them; reacting only to the crossings the browser happened to report
     * would leave the skipped sections invisible for good.
     */
    const sweep = () => {
      const limit = triggerLine();
      for (const element of waiting) {
        if (element.getBoundingClientRect().top >= limit) continue;
        element.classList.add('in');
        waiting.delete(element);
        observer?.unobserve(element);
      }

      if (waiting.size === 0) stopListening();
    };

    /*
     * Two triggers, because neither alone is reliable everywhere: scroll events
     * are not emitted for programmatic scrolling, and an observer only fires
     * when something actually crosses its threshold. Both funnel into the same
     * frame-coalesced sweep, so having both costs no extra measurements.
     */
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(() => schedule(), { rootMargin: '0px 0px -8% 0px' });

    let frame = 0;
    let listening = false;

    function schedule() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sweep();
      });
    }

    function startListening() {
      if (listening) return;
      listening = true;
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
    }

    function stopListening() {
      if (!listening) return;
      listening = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }

    let scanQueued = 0;

    const scan = () => {
      scanQueued = 0;

      // Fonts, images and late-mounting sections move things down the page after
      // a section was armed, so release anything already past the line on this
      // pass rather than waiting for a scroll that may never come.
      if (waiting.size > 0) sweep();

      const fresh: Element[] = [];
      for (const element of document.querySelectorAll('.rv')) {
        if (known.has(element)) continue;
        known.add(element);
        fresh.push(element);
      }
      if (fresh.length === 0) return;

      // Read every position first, then write every class. Interleaving the two
      // would force one layout per element instead of one for the batch.
      const limit = triggerLine();
      const below = fresh.map((element) => element.getBoundingClientRect().top >= limit);

      fresh.forEach((element, index) => {
        if (!below[index]) return;
        element.classList.add('armed');
        waiting.add(element);
        observer?.observe(element);
      });

      if (waiting.size > 0) startListening();
    };

    const scheduleScan = () => {
      if (scanQueued) return;
      scanQueued = requestAnimationFrame(scan);
    };

    scan();

    // Client-side navigation swaps the page under us; new sections have to be
    // armed before they are scrolled to.
    const mutations = new MutationObserver(scheduleScan);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (scanQueued) cancelAnimationFrame(scanQueued);
      mutations.disconnect();
      observer?.disconnect();
      stopListening();
    };
  }, []);

  return null;
}
