import { useState, useEffect } from 'react';
import type { CompanionMatch } from '../types';

export function useMatches() {
  const [matches, setMatches] = useState<CompanionMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing matches on mount (mocking DB fetch)
  useEffect(() => {
    try {
      const localStr = localStorage.getItem('wanderdrop_matches');
      if (localStr) {
        const parsed = JSON.parse(localStr);
        setMatches(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error('Failed to parse matches', e);
    }
  }, []);

  const findMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate network delay for calling the Edge Function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pStr = localStorage.getItem('wanderdrop_profile');
      if (!pStr) throw new Error("Initialize your traveler profile first.");
      
      // Generate some clever mock matches based on the edge function specs
      const mockMatches: CompanionMatch[] = [
        {
          id: `match-${Date.now()}-1`,
          requester_id: 'local-user',
          matched_user_id: 'user-a',
          compatibility_score: 92,
          compatibility_blurb: "She'll drag you to the ruins you love. You'll drag her to the chaotic street market she'll never forget.",
          status: 'pending',
          created_at: new Date().toISOString(),
          username: 'Sarah_Nomad',
          archetype: 'The Chaos Tourist'
        },
        {
          id: `match-${Date.now()}-2`,
          requester_id: 'local-user',
          matched_user_id: 'user-b',
          compatibility_score: 85,
          compatibility_blurb: "You both appreciate a slow morning espresso, but he knows where the late-night jazz is hiding.",
          status: 'pending',
          created_at: new Date().toISOString(),
          username: 'RicoSuave',
          archetype: 'The Midnight Roamer'
        },
        {
          id: `match-${Date.now()}-3`,
          requester_id: 'local-user',
          matched_user_id: 'user-c',
          compatibility_score: 74,
          compatibility_blurb: "Opposites attract: your deep cultural dive perfectly balances her desire for spontaneous wandering.",
          status: 'pending',
          created_at: new Date().toISOString(),
          username: 'Yuki_Wanders',
          archetype: 'The Slow Traveler'
        }
      ];
      
      setMatches(mockMatches);
      localStorage.setItem('wanderdrop_matches', JSON.stringify(mockMatches));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const sendWave = (matchId: string) => {
    // Optimistic UI update for sending a match request
    const newList = matches.map(m => 
      m.id === matchId ? { ...m, status: 'accepted' as const } : m
    );
    setMatches(newList);
    localStorage.setItem('wanderdrop_matches', JSON.stringify(newList));
  };

  return { matches, loading, error, findMatches, sendWave };
}
