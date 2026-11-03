import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { 
  VibeCheck, 
  VibeShotResult, 
  fireVibeCheck, 
  respondToVibeCheck, 
  reactToVibeCheck, 
  markExpiredVibeChecks, 
  fetchMyVibeChecks, 
  subscribeToVibeChecks 
} from './vibeCheckService';

export const useVibeCheck = () => {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'guest_node_1337';

  const [myVibeChecks, setMyVibeChecks] = useState<VibeCheck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a reference to the active subscription channel for unmounting
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Sync / Load Initial Data
  const loadData = async () => {
    setLoading(true);
    try {
      setError(null);
      // Mark any outdated ones as 'ghosted' first
      await markExpiredVibeChecks();
      // Fetch user's list
      const data = await fetchMyVibeChecks(currentUserId);
      setMyVibeChecks(data);
    } catch (err: any) {
      console.error('Failed to load VibeChecks:', err);
      setError(err?.message || 'Failed to sync VibeChecks matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup subscription for real-time changes
    const channel = subscribeToVibeChecks(currentUserId, (updatedCheck) => {
      setMyVibeChecks((prev) => {
        const index = prev.findIndex((item) => item.id === updatedCheck.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = updatedCheck;
          return updated;
        } else {
          return [updatedCheck, ...prev];
        }
      });
    });

    subRef.current = channel;

    // Periodic check to auto-expire checks locally in UI
    const expiryInterval = setInterval(() => {
      setMyVibeChecks((prev) => {
        let changed = false;
        const now = Date.now();
        const updated = prev.map((item) => {
          if (item.status === 'pending' && item.expires_at < now) {
            changed = true;
            return { ...item, status: 'ghosted' as const };
          }
          return item;
        });
        return changed ? updated : prev;
      });
    }, 5000);

    return () => {
      if (subRef.current) {
        subRef.current.unsubscribe();
      }
      clearInterval(expiryInterval);
    };
  }, [currentUserId]);

  const fireCheck = async (challengedId: string, prompt: string) => {
    try {
      setError(null);
      const newCheck = await fireVibeCheck(challengedId, prompt);
      setMyVibeChecks((prev) => {
        const exists = prev.some(c => c.id === newCheck.id);
        if (exists) return prev;
        return [newCheck, ...prev];
      });
    } catch (err: any) {
      setError(err?.message || 'Error firing VibeCheck challenge');
      throw err;
    }
  };

  const respondToCheck = async (id: string, result: VibeShotResult) => {
    try {
      setError(null);
      await respondToVibeCheck(id, result);
    } catch (err: any) {
      setError(err?.message || 'Error responding to VibeCheck');
      throw err;
    }
  };

  const reactToCheck = async (id: string, reaction: 'fire' | 'cap' | 'vibing') => {
    try {
      setError(null);
      await reactToVibeCheck(id, reaction);
    } catch (err: any) {
      setError(err?.message || 'Error updating reaction');
      throw err;
    }
  };

  // Derived state lookups
  // Takes the single most recent active pending check where I am the challenged one
  const now = Date.now();
  const pendingIncoming = myVibeChecks.filter(
    (c) => c.challenged_id === currentUserId && c.status === 'pending' && c.expires_at > now
  );
  // Sort by created_at descending (most recent first)
  pendingIncoming.sort((a, b) => b.created_at - a.created_at);
  const incomingPending = pendingIncoming.length > 0 ? pendingIncoming[0] : null;

  // Checks I fired that are still awaiting response
  const outgoingPending = myVibeChecks.filter(
    (c) => c.challenger_id === currentUserId && c.status === 'pending' && c.expires_at > now
  );

  return {
    myVibeChecks,
    incomingPending,
    outgoingPending,
    loading,
    error,
    fireCheck,
    respondToCheck,
    reactToCheck,
  };
};
