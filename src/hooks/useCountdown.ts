import { useState, useEffect } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  isReady: boolean;
}

export function useCountdown(targetDate: string | null): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() => calculate(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    // Recalculate immediately on mount / target change
    setTimeLeft(calculate(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(calculate(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

function calculate(targetDate: string | null): CountdownResult {
  if (!targetDate) return { hours: 0, minutes: 0, seconds: 0, isReady: false };

  const diff = new Date(targetDate).getTime() - Date.now();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isReady: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, isReady: false };
}
