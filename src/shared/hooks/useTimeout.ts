import { useEffect, useRef } from 'react';

/**
 * Custom React hook for running a callback after a delay
 * Implements clean-up on unmount and uses refs to keep callback fresh
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};
