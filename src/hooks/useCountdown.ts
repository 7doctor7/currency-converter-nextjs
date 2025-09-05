import { useState, useEffect, useRef } from 'react';

export function useCountdown(targetTime: number | null, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (targetTime === null) {
      setTimeLeft(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      return;
    }

    const updateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, targetTime - now);

      setTimeLeft(remaining);

      if (remaining === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        onExpire?.();
      }
    };

    updateTimeLeft();

    intervalRef.current = setInterval(updateTimeLeft, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTime, onExpire]);

  return timeLeft;
}

export function formatCountdown(milliseconds: number): string {
  if (milliseconds <= 0) return '0:00';

  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
