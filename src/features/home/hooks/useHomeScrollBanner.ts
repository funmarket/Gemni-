import { useState, useEffect, useRef } from 'react';

export const useHomeScrollBanner = () => {
  const [topBannerVisible, setTopBannerVisible] = useState(true);
  const lastScrollTopRef = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop === 'undefined') return;
      
      const currentScrollTop = target.scrollTop;
      const difference = currentScrollTop - lastScrollTopRef.current;

      if (currentScrollTop < 10) {
        setTopBannerVisible(true);
        lastScrollTopRef.current = currentScrollTop;
        return;
      }

      if (Math.abs(difference) > 20) {
        if (difference > 0) {
          // Scrolling down: hide top banner smoothly
          setTopBannerVisible(false);
        } else {
          // Scrolling up: show top banner smoothly
          setTopBannerVisible(true);
        }
        lastScrollTopRef.current = currentScrollTop;
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  return {
    topBannerVisible,
    setTopBannerVisible
  };
};
