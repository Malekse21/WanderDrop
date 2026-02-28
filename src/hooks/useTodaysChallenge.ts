import { useState, useEffect, useCallback } from 'react';
import type { DailyChallenge, ChallengeCategory, ChallengeDifficulty } from '../types';

const MOCK_TEMPLATES = [
  { category: 'food' as ChallengeCategory, title: 'Menu Roulette', desc: 'Eat something you cannot identify on the menu at a local eatery.', xp: 120, diff: 'medium' as ChallengeDifficulty },
  { category: 'social' as ChallengeCategory, title: 'The Unspoken Story', desc: 'Find a street musician and learn one thing about their story.', xp: 100, diff: 'medium' as ChallengeDifficulty },
  { category: 'exploration' as ChallengeCategory, title: 'Digital Detox', desc: 'Stay entirely off your phone for two hours while wandering the city.', xp: 300, diff: 'hard' as ChallengeDifficulty },
  { category: 'culture' as ChallengeCategory, title: 'Doorways to History', desc: 'Find a door that looks like it has a story. Photograph it.', xp: 50, diff: 'easy' as ChallengeDifficulty }
];

export function useTodaysChallenge() {
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChallenge = useCallback(() => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    let logs: DailyChallenge[] = [];
    
    try {
      const storedStr = localStorage.getItem('wanderdrop_daily_challenges');
      const parsed = storedStr ? JSON.parse(storedStr) : [];
      logs = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse daily challenges', e);
    }
    
    let todays = logs.find(c => c && c.date_assigned === today && c.user_id === 'local-user');

    if (!todays) {
      // Fake Edge Function Generation
      setTimeout(() => {
        let activeDrop = null;
        try {
          const activeDropStr = localStorage.getItem('wanderdrop_active_drop');
          activeDrop = activeDropStr ? JSON.parse(activeDropStr) : null;
        } catch (e) {
          console.error('Failed to parse active drop', e);
        }
        const currentCity = activeDrop?.destination_city || 'Tunis';
        
        const tmpl = MOCK_TEMPLATES[Math.floor(Math.random() * MOCK_TEMPLATES.length)];
        
        const newChallenge: DailyChallenge = {
          id: `challenge-${Date.now()}`,
          user_id: 'local-user',
          template_id: 'temp-id',
          date_assigned: today,
          city: currentCity,
          category: tmpl.category,
          difficulty: tmpl.diff,
          personalized_title: `${currentCity}: ${tmpl.title}`,
          personalized_description: `While exploring ${currentCity}, ${tmpl.desc.toLowerCase()}`,
          xp_reward: tmpl.xp,
          status: 'pending',
          completed_at: null,
          completion_note: null,
          completion_photo_url: null,
          mood_rating: null,
          created_at: new Date().toISOString()
        };
        
        logs.push(newChallenge);
        localStorage.setItem('wanderdrop_daily_challenges', JSON.stringify(logs));
        setChallenge(newChallenge);
        setLoading(false);
      }, 1500);
    } else {
      setChallenge(todays);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenge();

    const handleUpdate = () => fetchChallenge();
    window.addEventListener('challenge-update', handleUpdate);
    return () => window.removeEventListener('challenge-update', handleUpdate);
  }, [fetchChallenge]);

  const completeChallenge = async (note: string, rating: number) => {
    if (!challenge || challenge.status !== 'pending') return null;

    const today = new Date().toISOString().split('T')[0];
    const storedStr = localStorage.getItem('wanderdrop_daily_challenges');
    let logs: DailyChallenge[] = storedStr ? JSON.parse(storedStr) : [];
    
    logs = logs.map(c => {
      if (c.id === challenge.id) {
        return {
          ...c,
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_note: note,
          mood_rating: rating
        };
      }
      return c;
    });

    localStorage.setItem('wanderdrop_daily_challenges', JSON.stringify(logs));
    
    // Simulate `award_xp`
    const pStr = localStorage.getItem('wanderdrop_profiles');
    let profiles = pStr ? JSON.parse(pStr) : {};
    let prof = profiles['local-user'] || { wanderer_xp: 0, gem_access_tier: 0 };
    
    const oldTier = prof.gem_access_tier || 0;
    prof.wanderer_xp = (prof.wanderer_xp || 0) + challenge.xp_reward;
    
    let newTier = 0;
    if (prof.wanderer_xp >= 3000) newTier = 3;
    else if (prof.wanderer_xp >= 1500) newTier = 2;
    else if (prof.wanderer_xp >= 500) newTier = 1;

    prof.gem_access_tier = Math.max(oldTier, newTier);
    profiles['local-user'] = prof;
    localStorage.setItem('wanderdrop_profiles', JSON.stringify(profiles));

    // Log XP
    const xLogStr = localStorage.getItem('wanderdrop_xp_log');
    let xLogs = xLogStr ? JSON.parse(xLogStr) : [];
    xLogs.push({
      id: `xp-${Date.now()}`,
      user_id: 'local-user',
      amount: challenge.xp_reward,
      source: 'challenge_complete',
      reference_id: challenge.id,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('wanderdrop_xp_log', JSON.stringify(xLogs));

    // Simulate `update_streak`
    const sStr = localStorage.getItem('wanderdrop_challenge_streaks');
    let streaks = sStr ? JSON.parse(sStr) : { user_id: 'local-user', current_streak: 0, longest_streak: 0, last_completed_date: null, total_completed: 0 };
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    if (streaks.last_completed_date === yStr) {
      streaks.current_streak += 1;
    } else if (streaks.last_completed_date !== today) {
      streaks.current_streak = 1;
    }
    
    streaks.longest_streak = Math.max(streaks.longest_streak, streaks.current_streak);
    streaks.last_completed_date = today;
    streaks.total_completed += 1;
    
    localStorage.setItem('wanderdrop_challenge_streaks', JSON.stringify(streaks));
    
    // Trigger cross component update
    window.dispatchEvent(new Event('challenge-update'));
    window.dispatchEvent(new Event('dashboard-update'));

    return {
      new_xp: prof.wanderer_xp,
      tier_unlocked: newTier > oldTier,
      new_tier: newTier,
      new_streak: streaks.current_streak,
      streak_milestone: streaks.current_streak > 0 && streaks.current_streak % 7 === 0
    };
  };

  const skipChallenge = () => {
    if (!challenge || challenge.status !== 'pending') return;
    
    const storedStr = localStorage.getItem('wanderdrop_daily_challenges');
    let logs: DailyChallenge[] = storedStr ? JSON.parse(storedStr) : [];
    logs = logs.map(c => c.id === challenge.id ? { ...c, status: 'skipped' } : c);
    localStorage.setItem('wanderdrop_daily_challenges', JSON.stringify(logs));
    window.dispatchEvent(new Event('challenge-update'));
  };

  return { challenge, loading, completeChallenge, skipChallenge };
}
