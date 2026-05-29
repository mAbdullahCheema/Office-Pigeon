/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, JSX } from 'react';

interface SmoothScrollProps {
  children: JSX.Element | JSX.Element[];
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Scroll state
  const requestRef = useRef<number | null>(null);
  const targetY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const scrollHeightOffset = useRef<number>(0);

  useEffect(() => {
    const handleCheckMode = () => {
      // Disable custom scroller on touch-capable mobile/tablet devices or smaller screens for native momentum
      const mobileCheck = window.innerWidth < 1024 || ('ontouchstart' in window);
      setIsMobile(mobileCheck);
    };

    handleCheckMode();
    window.addEventListener('resize', handleCheckMode);
    return () => window.removeEventListener('resize', handleCheckMode);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Keep native scrolling on mobile & tablet for optimal performance & native responsiveness
      document.body.style.height = 'auto';
      if (contentRef.current) {
        contentRef.current.style.transform = 'none';
        contentRef.current.style.position = 'static';
      }
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    const content = contentRef.current;
    if (!scrollContainer || !content) return;

    // Apply strict styles to hide system scroll bars and setup smooth transform layers
    content.style.position = 'fixed';
    content.style.top = '0';
    content.style.left = '0';
    content.style.width = '100%';
    content.style.willChange = 'transform';

    const updateHeight = () => {
      if (!content) return;
      const height = content.getBoundingClientRect().height;
      scrollHeightOffset.current = height;
      document.body.style.height = `${height}px`;
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateHeight);
    });

    resizeObserver.observe(content);

    // Initial height update
    updateHeight();

    // Listen to native window scroll event.
    // This supports trackpad precision, mouse wheel, keyboard arrows, PageUp/PageDown, spacebar, scrollbar dragging, etc.
    const onScroll = () => {
      targetY.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Smooth render loop with responsive interpolation dampening
    const render = () => {
      const dampingForce = 0.12; // Snappy and direct yet visually buttery-smooth
      const delta = targetY.current - currentY.current;
      currentY.current += delta * dampingForce;

      if (Math.abs(delta) > 0.05) {
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${-currentY.current}px)`;
        }
      } else {
        currentY.current = targetY.current;
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${-currentY.current}px)`;
        }
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    // Also update height after a small timeout to make sure everything has rendered in
    const timer = setTimeout(updateHeight, 500);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      document.body.style.height = 'auto';
    };
  }, [isMobile]);

  return (
    <div ref={scrollContainerRef} className="smooth-scroll-viewport w-full min-h-screen">
      <div ref={contentRef} className="smooth-scroll-content w-full">
        {children}
      </div>
    </div>
  );
}
