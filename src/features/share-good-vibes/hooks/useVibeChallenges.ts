import { useState } from 'react';
import { vibeChallengeService } from '../services/vibeChallengeService';
import { triggerHaptic } from '@/shared/services/device/haptics';

export const useVibeChallenges = () => {
  const [activeCheckToRespond, setActiveCheckToRespond] = useState<any | null>(null);
  const [activeFlashToRespond, setActiveFlashToRespond] = useState<any | null>(null);

  const handleRefuseChallenge = async (check: any) => {
    try {
      if (typeof window !== "undefined") {
        const haptic = (window as any).Telegram?.WebApp?.HapticFeedback;
        if (haptic) haptic.impactOccurred('medium');
      }
      triggerHaptic('medium');
      await vibeChallengeService.refuseChallenge(check.id);
    } catch (e) {
      console.error("Failed to mark challenge as ignored/ghosted:", e);
    }
  };

  return {
    activeCheckToRespond,
    setActiveCheckToRespond,
    activeFlashToRespond,
    setActiveFlashToRespond,
    handleRefuseChallenge
  };
};
