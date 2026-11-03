import { CSSProperties } from 'react';

/**
 * Styles applied dynamically to overlay during scroll events to conceal overlay from viewport completely
 */
export const getScrollHideStyles = (isScrolling: boolean): CSSProperties => {
  if (isScrolling) {
    return {
      opacity: 0,
      pointerEvents: 'none',
      transform: 'scale(0.95) translateY(24px)',
      transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)'
    };
  }
  return {
    transition: 'all 350ms cubic-bezier(0.16, 1, 0.3, 1)',
    opacity: 1,
    transform: 'none',
    pointerEvents: 'auto'
  };
};
