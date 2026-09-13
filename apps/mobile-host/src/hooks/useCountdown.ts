import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for countdown timer with auto-trigger on expiry.
 */
export function useCountdown(
  initialSeconds: number,
  onExpire: () => void
): { remaining: number; cancel: () => void } {
  const remainingRef = useRef(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    remainingRef.current = initialSeconds;

    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      if (remainingRef.current <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpire();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [initialSeconds, onExpire]);

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return { remaining: remainingRef.current, cancel };
}
