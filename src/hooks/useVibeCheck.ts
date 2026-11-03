import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { vibeCheckService } from '../services/vibeCheckService';
import { VibeCheckRequest } from '../types/socialGraph';

export function useVibeCheck() {
  const { user } = useAuth();
  const currentUserId = user?.uid || 'current_user';

  const [requests, setRequests] = useState<VibeCheckRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRequests = async () => {
    try {
      const data = await vibeCheckService.getRequests(currentUserId);
      setRequests(data);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const sendVibeCheck = async (challengedId: string, prompt: string) => {
    const result = await vibeCheckService.sendRequest(currentUserId, challengedId, prompt);
    await loadRequests();
    return result;
  };

  const acceptVibeCheck = async (requestId: string) => {
    await vibeCheckService.acceptRequest(requestId);
    await loadRequests();
  };

  const ignoreVibeCheck = async (requestId: string) => {
    await vibeCheckService.ignoreRequest(requestId);
    await loadRequests();
  };

  // Incoming pending requests from active challengers
  const incomingRequests = requests.filter(
    r => r.challenged_id === currentUserId && r.status === 'pending'
  );

  // Confirmed mutual challenges (matches)
  const mutualMatches = requests.filter(
    r => (r.challenger_id === currentUserId || r.challenged_id === currentUserId) && r.status === 'confirmed'
  );

  return {
    requests,
    incomingRequests,
    mutualMatches,
    loading,
    sendVibeCheck,
    acceptVibeCheck,
    ignoreVibeCheck,
    refreshVibeChecks: loadRequests,
  };
}

export default useVibeCheck;
