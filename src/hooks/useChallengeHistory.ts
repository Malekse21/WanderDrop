import { useState, useEffect, useCallback } from 'react';
import type { DailyChallenge } from '../types';

const PAGE_SIZE = 20;

export function useChallengeHistory() {
  const [history, setHistory] = useState<DailyChallenge[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback((currentPage: number = 1, append: boolean = false) => {
    setLoading(true);
    let allLogs: DailyChallenge[] = [];
    try {
      const storedStr = localStorage.getItem('wanderdrop_daily_challenges');
      const parsed = storedStr ? JSON.parse(storedStr) : [];
      allLogs = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse history', e);
    }
    
    // Filter out pending and sort desc
    let past = allLogs
      .filter(c => c.user_id === 'local-user' && c.status !== 'pending')
      .sort((a, b) => new Date(b.date_assigned).getTime() - new Date(a.date_assigned).getTime());

    const total = past.length;
    const paginated = past.slice(0, currentPage * PAGE_SIZE);

    setHistory(paginated);
    setHasMore(paginated.length < total);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory(1, false);
    
    const listener = () => {
      setPage(1);
      fetchHistory(1, false);
    };

    window.addEventListener('challenge-update', listener);
    return () => window.removeEventListener('challenge-update', listener);
  }, [fetchHistory]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHistory(nextPage, true);
  };

  return { history, hasMore, loadMore, loading };
}
