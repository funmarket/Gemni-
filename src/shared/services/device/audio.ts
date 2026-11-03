/**
 * Shared Audio Context Device Service
 * Safely creates, manages, and resumes web AudioContexts to avoid browser blockages.
 */

let cachedAudioContext: AudioContext | null = null;

export const getSharedAudioContext = (): AudioContext => {
  if (typeof window === 'undefined') {
    throw new Error('AudioContext can only be used in browser environments.');
  }

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  if (!cachedAudioContext || cachedAudioContext.state === 'closed') {
    cachedAudioContext = new AudioCtx();
  }

  return cachedAudioContext;
};

export const resumeSharedAudioContext = async (): Promise<AudioContext> => {
  const ctx = getSharedAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('Failed to resume AudioContext safely:', e);
    }
  }
  return ctx;
};
