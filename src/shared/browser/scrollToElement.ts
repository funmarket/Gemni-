/**
 * Shared browser utility for scrolling elements into view safely
 */
export const scrollToElement = (id: string, behavior: 'smooth' | 'auto' = 'smooth', block: 'start' | 'center' | 'end' | 'nearest' = 'start') => {
  if (typeof document !== 'undefined') {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior, block });
    }
  }
};

export const scrollToCommunities = () => {
  scrollToElement('communities-section');
};
