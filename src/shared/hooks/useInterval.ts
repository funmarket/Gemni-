import { useEffect, useRef } from 'react';

/**
 * Custom React hook for running a callback on a set interval
 * Implements clean-up on unmount and uses refs to keep callback fresh
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};
