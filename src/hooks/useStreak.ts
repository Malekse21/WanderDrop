import { useState, useEffect, useCallback } from 'react';
import type { ChallengeStreak } from '../types';

export function useStreak() {
  const [streakData, setStreakData] = useState<ChallengeStreak>({
    user_id: 'local-user',
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
    total_completed: 0,
    updated_at: new Date().toISOString()
  });

  const fetchStreak = useCallback(() => {
    try {
      const sStr = localStorage.getItem('wanderdrop_challenge_streaks');
      if (sStr) {
        setStreakData(JSON.parse(sStr));
      }
    } catch (e) {
      console.error('Failed to parse streaks', e);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
    window.addEventListener('challenge-update', fetchStreak);
    return () => window.removeEventListener('challenge-update', fetchStreak);
  }, [fetchStreak]);

  const formattedDisplay = `${streakData.current_streak} day streak 🔥`;

  return { ...streakData, formattedDisplay };
}
