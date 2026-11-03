export const triggerHaptic = (style: 'light' | 'medium' | 'heavy') => {
  if (!window.navigator || !window.navigator.vibrate) return;
  switch (style) {
    case 'light':
      window.navigator.vibrate(10);
      break;
    case 'medium':
      window.navigator.vibrate(30);
      break;
    case 'heavy':
      window.navigator.vibrate([40, 30, 40]);
      break;
  }
};

export const triggerTelegramHaptic = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
  if (typeof window !== 'undefined') {
    const haptic = (window as any).Telegram?.WebApp?.HapticFeedback;
    if (haptic) {
      haptic.impactOccurred(style);
    }
  }
};
