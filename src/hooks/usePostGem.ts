import { useState } from 'react';
import type { Gem, GemType } from '../types';
import { useWandererProfile } from './useWandererProfile';
import { awardMockXP } from '../utils/mockXp';

export interface PostGemForm {
  photos: File[]; // Ignoring actual upload since we're local
  title: string;
  description: string;
  gem_type: GemType | null;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number } | null;
  address_hint: string;
  best_time: string;
  avoid_time: string;
  open_for_hosting: boolean;
}

const DEFAULT_FORM: PostGemForm = {
  photos: [],
  title: '',
  description: '',
  gem_type: null,
  city: '',
  country: '',
  coordinates: null,
  address_hint: '',
  best_time: '',
  avoid_time: '',
  open_for_hosting: false,
};

export function usePostGem() {
  const [form, setForm] = useState<PostGemForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { triggerBackgroundRecalculation } = useWandererProfile();

  const updateField = <K extends keyof PostGemForm>(field: K, value: PostGemForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submit = async (): Promise<boolean> => {
    setError('');
    
    if (!form.title || !form.description || !form.gem_type || !form.city || !form.country || !form.coordinates) {
      setError('Please fill out all required fields and set a location pin.');
      return false;
    }

    setLoading(true);

    try {
      // 1. Simulate photo upload delay
      if (form.photos.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 2. "Insert" gem into local storage database
      const newGem: Gem = {
        id: `gem-local-${Date.now()}`,
        author_id: 'local-user',
        title: form.title,
        description: form.description,
        gem_type: form.gem_type,
        city: form.city,
        country: form.country,
        coordinates: form.coordinates,
        photos: [], // Fake empty URLs since we're not actually uploading to storage
        best_time: form.best_time || null,
        avoid_time: form.avoid_time || null,
        address_hint: form.address_hint || null,
        open_for_hosting: form.open_for_hosting,
        
        // Initial state before analyze-gem edge function runs
        authenticity_score: 0,
        crowd_level: 'secret',
        ai_tags: [],
        ai_summary: null,
        status: 'unverified',
        save_count: 0,
        visit_count: 0,
        verification_count: 0,
        created_at: new Date().toISOString(),
      };

      let localGems = [];
      try {
        const localStr = localStorage.getItem('wanderdrop_local_gems');
        const parsed = localStr ? JSON.parse(localStr) : [];
        localGems = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse local gems for posting', e);
      }
      localStorage.setItem('wanderdrop_local_gems', JSON.stringify([newGem, ...localGems]));

      // Record activity
      triggerBackgroundRecalculation();
      
      // Award XP for posting
      awardMockXP(100, 'gem_post', newGem.id);

      // 3. Simulate the background analyze-gem Edge Function
      setTimeout(() => {
        try {
          const currentStr = localStorage.getItem('wanderdrop_local_gems');
          if (currentStr) {
            const currentGems = JSON.parse(currentStr);
            if (Array.isArray(currentGems)) {
              const idx = currentGems.findIndex(g => g.id === newGem.id);
              if (idx !== -1) {
                currentGems[idx] = {
                  ...currentGems[idx],
                  authenticity_score: Math.floor(Math.random() * 20) + 75, // 75-95
                  crowd_level: 'secret',
                  ai_tags: ['Hidden Spot', 'Local Vibe', 'New Discovery'],
                  ai_summary: `A freshly discovered corner of ${form.city} waiting to be explored.`,
                };
                localStorage.setItem('wanderdrop_local_gems', JSON.stringify(currentGems));
                window.dispatchEvent(new Event('storage'));
              }
            }
          }
        } catch (e) {
          console.error('Failed to update gems in post background task', e);
        }
      }, 3000);

      setLoading(false);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoading(false);
      return false;
    }
  };

  return { form, updateField, submit, loading, error };
}
