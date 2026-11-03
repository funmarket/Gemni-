import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { 
  VibeFlash, 
  VibeFlashStatus, 
  openVibeFlashWindow, 
  respondToVibeFlash, 
  denyVibeFlash as apiDenyVibeFlash, 
  markExpiredVibeFlashes, 
  fetchMyVibeFlashes, 
  subscribeToVibeFlashes 
} from './vibeFlashService';
import { VibeShotResult } from '../types/native';

export type VibeFlashResponse = 'pending' | 'accepted' | 'denied' | 'expired' | 'none';

export const useVibeFlashWindow = () => {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'guest_node_1337';

  const [myVibeFlashes, setMyVibeFlashes] = useState<VibeFlash[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interval and subscription references
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync / Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      setError(null);
      // Mark outdated vibe flashes as expired in the DB
      await markExpiredVibeFlashes();
      // Fetch user's list from firestore
      const data = await fetchMyVibeFlashes(currentUserId);
      setMyVibeFlashes(data);
    } catch (err: any) {
      console.error('Failed to load VibeFlashes:', err);
      setError(err?.message || 'Failed to sync VibeFlashes matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup real-time subscription
    const channel = subscribeToVibeFlashes(currentUserId, (updatedFlash) => {
      setMyVibeFlashes((prev) => {
        const index = prev.findIndex((item) => item.id === updatedFlash.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = updatedFlash;
          return updated;
        } else {
          return [updatedFlash, ...prev];
        }
      });
    });

    subRef.current = channel;

    // Local tick/expiry evaluator to update states smoothly
    const expiryInterval = setInterval(() => {
      setMyVibeFlashes((prev) => {
        let changed = false;
        const now = Date.now();
        const updated = prev.map((item) => {
          if (item.status === 'active' && item.expires_at < now) {
            changed = true;
            return { ...item, status: 'expired' as const };
          }
          return item;
        });
        return changed ? updated : prev;
      });
    }, 2000);

    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe();
      }
      clearInterval(expiryInterval);
    };
  }, [currentUserId]);

  // Derived state calculations
  const now = Date.now();
  
  // Find the single current active vibe flash window
  const activeFlash = myVibeFlashes.find(
    (f) => f.status === 'active' && f.expires_at > now
  ) || null;

  const isWindowOpen = !!activeFlash;
  const windowExpiresAt = activeFlash ? activeFlash.expires_at : null;
  const activeFlashId = activeFlash ? activeFlash.id : null;

  // Track countdown seconds
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!windowExpiresAt) {
      setSecondsRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const diffMs = windowExpiresAt - Date.now();
      if (diffMs <= 0) {
        setSecondsRemaining(0);
      } else {
        setSecondsRemaining(Math.ceil(diffMs / 1000));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [windowExpiresAt]);

  const triggerVibeFlash = async () => {
    try {
      setError(null);
      const newFlash = await openVibeFlashWindow(currentUserId);
      setMyVibeFlashes((prev) => {
        const exists = prev.some(f => f.id === newFlash.id);
        if (exists) return prev;
        return [newFlash, ...prev];
      });
      return newFlash;
    } catch (err: any) {
      setError(err?.message || 'Error triggering VibeFlash window');
      throw err;
    }
  };

  const acceptVibeFlash = async () => {
    // Transition to responding layout (the UI handler triggers the actual capture)
    // On capture verified, respondToFlash will be called with shot results
  };

  const denyVibeFlash = async () => {
    if (!activeFlashId) return;
    try {
      setError(null);
      await apiDenyVibeFlash(activeFlashId);
    } catch (err: any) {
      setError(err?.message || 'Error denying VibeFlash');
      throw err;
    }
  };

  const respondToFlash = async (flashId: string, result: VibeShotResult) => {
    try {
      setError(null);
      await respondToVibeFlash(flashId, result);
    } catch (err: any) {
      setError(err?.message || 'Error responding to VibeFlash');
      throw err;
    }
  };

  // Map status cleanly to expected string enum
  let userResponse: VibeFlashResponse = 'none';
  if (activeFlash) {
    userResponse = 'pending';
  } else if (myVibeFlashes.length > 0) {
    const latest = myVibeFlashes[0];
    if (latest.status === 'responded') userResponse = 'accepted';
    else if (latest.status === 'denied') userResponse = 'denied';
    else if (latest.status === 'expired') userResponse = 'expired';
  }

  return {
    isWindowOpen,
    activeFlash,
    activeFlashId,
    windowExpiresAt,
    secondsRemaining,
    userResponse,
    loading,
    error,
    triggerVibeFlash,
    acceptVibeFlash,
    denyVibeFlash,
    respondToFlash,
    myVibeFlashes,
  };
};
