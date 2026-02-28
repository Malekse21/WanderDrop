import { useState, useEffect } from 'react';
import { useWandererProfile } from './useWandererProfile';

export function useSaveGem(gemId: string) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { triggerBackgroundRecalculation } = useWandererProfile();

  useEffect(() => {
    // Check local storage for saved state
    try {
      const savesStr = localStorage.getItem('wanderdrop_gem_saves');
      if (savesStr) {
        const saves = JSON.parse(savesStr);
        if (Array.isArray(saves)) {
          setIsSaved(saves.includes(gemId));
        }
      }
    } catch (e) {
      console.error('Failed to parse gem saves', e);
    }
    setLoading(false);
  }, [gemId]);

  const toggleSave = () => {
    // Optimistic UI update
    const newValue = !isSaved;
    setIsSaved(newValue);

    // Persist to local storage
    let newSaves: string[] = [];
    try {
      const savesStr = localStorage.getItem('wanderdrop_gem_saves');
      const saves = savesStr ? JSON.parse(savesStr) : [];
      const currentSaves = Array.isArray(saves) ? saves : [];
      
      if (newValue) {
        newSaves = Array.from(new Set([...currentSaves, gemId]));
      } else {
        newSaves = currentSaves.filter(id => id !== gemId);
      }
      
      localStorage.setItem('wanderdrop_gem_saves', JSON.stringify(newSaves));
    } catch (e) {
      console.error('Failed to update gem saves', e);
    }
    
    if (newValue) {
      triggerBackgroundRecalculation();
    }
  };

  return { isSaved, toggleSave, loading };
}
