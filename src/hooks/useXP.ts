import { useState, useEffect, useCallback } from 'react';
import type { XPLogEntry } from '../types';

export function useXP() {
  const [totalXP, setTotalXP] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [recentEvents, setRecentEvents] = useState<XPLogEntry[]>([]);

  const fetchXP = useCallback(() => {
    // 1. Fetch Profile Data
    try {
      const pStr = localStorage.getItem('wanderdrop_profiles');
      if (pStr) {
        const profiles = JSON.parse(pStr);
        const prof = profiles['local-user'];
        if (prof) {
          setTotalXP(Number(prof.wanderer_xp) || 0);
          setCurrentTier(Number(prof.gem_access_tier) || 0);
        }
      }
    } catch (e) {
      console.error('Failed to parse profiles', e);
    }

    // 2. Fetch XP Log
    try {
      const xLogStr = localStorage.getItem('wanderdrop_xp_log');
      if (xLogStr) {
        const xLogs = JSON.parse(xLogStr);
        if (Array.isArray(xLogs)) {
          // Sort desc by date and take top 10
          const sorted = [...xLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setRecentEvents(sorted.slice(0, 10));
        }
      }
    } catch (e) {
      console.error('Failed to parse XP log', e);
    }
  }, []);

  useEffect(() => {
    fetchXP();
    window.addEventListener('challenge-update', fetchXP);
    window.addEventListener('dashboard-update', fetchXP);
    return () => {
      window.removeEventListener('challenge-update', fetchXP);
      window.removeEventListener('dashboard-update', fetchXP);
    };
  }, [fetchXP]);

  return { totalXP, currentTier, recentEvents };
}
