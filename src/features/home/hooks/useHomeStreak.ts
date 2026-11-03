import { useState, useCallback, useEffect } from 'react';
import { safeLocalStorage } from '../../../shared/services/storage/safeLocalStorage';
import { vqLedger } from '@/domains/d20_vq_ledger';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

export const useHomeStreak = ({ updateProfilePoints, triggerAlert }: any) => {
  const [streakCount, setStreakCount] = useState(0);
  const [streakClaimed, setStreakClaimed] = useState(false);

  const loadStreakData = useCallback(() => {
    try {
      const today = new Date().toDateString();
      const lastDate = safeLocalStorage.getItem('lastStreakDate', '');
      const storedCount = safeLocalStorage.getItem('streakCount', '0');
      const savedStreak = parseInt(storedCount, 10);
      
      if (lastDate === today) {
        setStreakClaimed(true);
        setStreakCount(savedStreak || 1);
      } else if (lastDate) {
        const lastCheckIn = new Date(lastDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          setStreakCount(savedStreak);
          setStreakClaimed(false);
        } else if (daysDiff > 1) {
          setStreakCount(0);
          safeLocalStorage.setItem('streakCount', '0');
          setStreakClaimed(false);
        }
      } else {
        setStreakCount(0);
        setStreakClaimed(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    const today = new Date().toDateString();
    
    const nextStreak = streakCount > 0 ? streakCount + 1 : 1;
    setStreakCount(nextStreak);
    setStreakClaimed(true);
    safeLocalStorage.setItem('lastStreakDate', today);
    safeLocalStorage.setItem('streakCount', nextStreak.toString());
    
    if (updateProfilePoints) updateProfilePoints(25);
    
    // Authoritative D20 Ledger credit (writes to Supabase vq_ledger)
    try {
      vqLedger.credit(
        'current_user',
        25,
        'DAILY_STREAK',
        `Daily presence verification (Day ${nextStreak})`
      );
      supabase
        .from('profiles')
        .update({ streaks: nextStreak })
        .eq('handle', 'hannibal')
        .then(() => {})
        .catch(console.warn);
    } catch (e) {
      console.warn('Ledger streak credit notice:', e);
    }

    if (triggerAlert) triggerAlert("🔥 Daily Streak Maintained!", `Streak updated to ${nextStreak} Days! Added +25 VQ Points to your Purse.`);
  };

  return {
    streakCount,
    streakClaimed,
    loadStreakData,
    handleClaimStreak
  };
};
