import { useEffect, JSX } from 'react';

interface SmoothScrollProps {
  children: JSX.Element | JSX.Element[];
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    // Disable smooth scroll on mobile & touch devices for optimal native momentum scrolling
    const checkIsMobile = () => 
      window.innerWidth < 1024 || 
      ('ontouchstart' in window) || 
      navigator.maxTouchPoints > 0;
      
    if (checkIsMobile()) return;

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isMoving = false;
    let rafId: number | null = null;

    const onWheel = (e: WheelEvent) => {
      // Allow standard zoom / gesture shortcuts
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      
      e.preventDefault();
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetY = Math.max(0, Math.min(maxScroll, targetY + e.deltaY * 0.9));
      
      if (!isMoving) {
        isMoving = true;
        currentY = window.scrollY;
        animate();
      }
    };

    const animate = () => {
      const damping = 0.085; // Extremely premium, fluid momentum feel
      const diff = targetY - currentY;
      
      if (Math.abs(diff) > 0.15) {
        currentY += diff * damping;
        window.scrollTo(0, currentY);
        rafId = requestAnimationFrame(animate);
      } else {
        window.scrollTo(0, targetY);
        isMoving = false;
        rafId = null;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    // Synchronize target and current scroll coordinates when scrolled externally (scrollbar, keys, page nav)
    const onScroll = () => {
      if (!isMoving) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="w-full">
      {children}
    </div>
  );
}

