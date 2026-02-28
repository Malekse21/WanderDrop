import { useState, useEffect } from 'react';
import type { Drop } from '../types';

export function useActiveDrop() {
  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrop = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('wanderdrop_active_drop');
      if (stored) {
        setDrop(JSON.parse(stored));
      } else {
        setDrop(null);
      }
    } catch (err) {
      setError('Failed to parse local drop data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrop();

    // Poll for changes since we don't have Supabase Realtime anymore
    const interval = setInterval(() => {
      fetchDrop();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { drop, loading, error, refetch: fetchDrop };
}
