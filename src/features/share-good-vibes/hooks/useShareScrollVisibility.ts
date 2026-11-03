import { useState, useEffect, useRef, RefObject } from 'react';

export const useShareScrollVisibility = (shareModalRef: RefObject<HTMLElement | null>) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const captureScrollOrGesture = (e: Event) => {
      const target = e.target as HTMLElement;
      if (shareModalRef.current && shareModalRef.current.contains(target)) {
        return;
      }

      setIsScrolling(true);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 350);
    };

    window.addEventListener('scroll', captureScrollOrGesture, true);
    window.addEventListener('touchmove', captureScrollOrGesture, { capture: true, passive: true });
    window.addEventListener('wheel', captureScrollOrGesture, { capture: true, passive: true });

    return () => {
      window.removeEventListener('scroll', captureScrollOrGesture, true);
      window.removeEventListener('touchmove', captureScrollOrGesture, { capture: true });
      window.removeEventListener('wheel', captureScrollOrGesture, { capture: true });
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [shareModalRef]);

  return {
    isScrolling
  };
};
