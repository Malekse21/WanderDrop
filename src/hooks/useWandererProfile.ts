import { useState, useEffect, useCallback } from 'react';
import type { WandererProfile } from '../types';

// Mock initial profile state (no data yet)
const EMPTY_PROFILE: WandererProfile = {
  user_id: 'local-user',
  chaos_score: 0,
  connection_score: 0,
  culture_score: 0,
  sensation_score: 0,
  foodie_depth_score: 0,
  night_owl_score: 0,
  archetype: null,
  archetype_description: null,
  total_activity_count: 0,
  last_calculated_at: new Date().toISOString(),
};

// Mock calculated profile
const MOCK_CALCULATED_PROFILE: WandererProfile = {
  user_id: 'local-user',
  chaos_score: 85,
  connection_score: 20,
  culture_score: 90,
  sensation_score: 75,
  foodie_depth_score: 95,
  night_owl_score: 80,
  archetype: 'The Hidden Gem Hunter',
  archetype_description: "You bypass the lines and head straight for the back alleys. You'd rather get lost finding a secret cocktail bar than stick to the beaten path.",
  total_activity_count: 5,
  last_calculated_at: new Date().toISOString(),
};

export function useWandererProfile() {
  const [profile, setProfile] = useState<WandererProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const localData = localStorage.getItem('wanderdrop_profiles');
      if (localData) {
        const profiles = JSON.parse(localData);
        const myProfile = profiles['local-user'];
        if (myProfile && typeof myProfile === 'object') {
          setProfile({ ...EMPTY_PROFILE, ...myProfile });
        } else {
          setProfile(EMPTY_PROFILE);
        }
      } else {
        setProfile(EMPTY_PROFILE);
        localStorage.setItem('wanderdrop_profiles', JSON.stringify({ 'local-user': EMPTY_PROFILE }));
      }
    } catch (e) {
      console.error('Failed to parse wanderer profile', e);
      setProfile(EMPTY_PROFILE);
    }
    setLoading(false);
  }, []);

  // Debounced background recalculation
  const triggerBackgroundRecalculation = useCallback(() => {
    let p = EMPTY_PROFILE;
    let profiles: Record<string, any> = {};
    
    try {
      const current = localStorage.getItem('wanderdrop_profiles');
      profiles = current ? JSON.parse(current) : {};
      p = profiles['local-user'] || EMPTY_PROFILE;
    } catch (e) {
      console.error('Failed to parse profiles in background recalc', e);
    }
    
    const newCount = (p.total_activity_count || 0) + 1;
    const updated = { ...p, total_activity_count: newCount };
    
    setProfile(updated);
    profiles['local-user'] = updated;
    localStorage.setItem('wanderdrop_profiles', JSON.stringify(profiles));

    // If we just hit the threshold of 3, simulate the Edge Function completion after a delay
    if (newCount === 3) {
        console.log("Triggering Groq edge function mock in background...");
        setTimeout(() => {
            console.log("Groq Edge function complete. Profile updated.");
            const newProfile = { ...MOCK_CALCULATED_PROFILE, total_activity_count: newCount };
            setProfile(newProfile);
            
            try {
              const current = localStorage.getItem('wanderdrop_profiles');
              const profiles = current ? JSON.parse(current) : {};
              profiles['local-user'] = newProfile;
              localStorage.setItem('wanderdrop_profiles', JSON.stringify(profiles));
            } catch (e) {
              console.error('Failed to update profiles in mock timeout', e);
            }
            
            // Generate a mock tagline to match the DB behavior
            localStorage.setItem('wanderdrop_tagline', "Chasing sunsets and street food.");
            
            // Dispatch a storage event so other tabs/hooks notice
            window.dispatchEvent(new Event('storage'));
        }, 3000);
    }
  }, []);

  return { profile, loading, triggerBackgroundRecalculation };
}
