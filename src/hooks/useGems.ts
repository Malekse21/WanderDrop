import { useState, useEffect, useCallback } from 'react';
import type { Gem, GemType } from '../types';

// Mock list of gems since backend is disabled
const MOCK_GEMS: Gem[] = [
  {
    id: 'gem-1',
    author_id: 'user-a',
    title: 'Cafe des Nattes Balcony',
    description: 'Everyone goes to Cafe des Nattes, but skip the main floor. Ask the waiter nicely to unlock the narrow staircase to the roof balcony. The view over the Gulf of Tunis is unmatched and tourists never go up there.',
    gem_type: 'secret',
    city: 'Sidi Bou Said',
    country: 'Tunisia',
    coordinates: { lat: 36.8705, lng: 10.3418 },
    photos: [],
    best_time: 'Golden hour, right before sunset',
    avoid_time: 'Midday heat',
    address_hint: 'Top of the main stairs in the village, inside behind the bar counter.',
    open_for_hosting: false,
    authenticity_score: 92,
    crowd_level: 'secret',
    ai_tags: ['Rooftop View', 'Hidden Stairs', 'Mint Tea'],
    ai_summary: 'Sip warm mint tea under peeling blue awnings while watching the white village glow against the Mediterranean.',
    status: 'verified',
    save_count: 42,
    visit_count: 12,
    verification_count: 5,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'gem-2',
    author_id: 'user-b',
    title: 'Oued El Khil Oasis',
    description: 'A tiny, completely undeveloped oasis south of Tataouine. The water runs naturally through the red rock gorge. You have to hike in about 30 minutes from where the dirt road ends.',
    gem_type: 'nature',
    city: 'Tataouine',
    country: 'Tunisia',
    coordinates: { lat: 32.85, lng: 10.45 },
    photos: [],
    best_time: 'Early morning',
    avoid_time: 'Summer months',
    address_hint: 'Unmarked dirt turnoff 15km south of Tataouine, follow the dry riverbed.',
    open_for_hosting: false,
    authenticity_score: 98,
    crowd_level: 'secret',
    ai_tags: ['Red Rocks', 'Natural Spring', 'Secluded'],
    ai_summary: 'Cool spring water rushing softly through an echoing gorge of towering red sandstone.',
    status: 'unverified',
    save_count: 8,
    visit_count: 2,
    verification_count: 1,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'gem-3',
    author_id: 'user-c',
    title: 'Mhibes Brik Stand',
    description: 'Not a restaurant, just a guy named Mhibes frying brik out of his garage in the Medina. The egg is always perfectly runny and the tuna is fresh. Expect to wait in a line of locals leaning against the old wall.',
    gem_type: 'food',
    city: 'Tunis',
    country: 'Tunisia',
    coordinates: { lat: 36.798, lng: 10.169 },
    photos: [],
    best_time: '5 PM to 8 PM',
    avoid_time: 'Lunch hour',
    address_hint: 'Alleyway behind the Zaytuna Mosque, look for the yellow bulb.',
    open_for_hosting: false,
    authenticity_score: 85,
    crowd_level: 'getting_known',
    ai_tags: ['Runny Yolk', 'Street Food', 'Sizzling'],
    ai_summary: 'The loud hiss of hot oil and the crunch of golden pastry echoing in a damp, fragrant alley.',
    status: 'verified',
    save_count: 156,
    visit_count: 80,
    verification_count: 24,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'gem-4',
    author_id: 'user-d',
    title: 'Bungalow 71',
    description: 'A crumbling colonial era seaside bungalow that a collective of local artists took over. They throw lowkey vinyl listening sessions on Thursday nights. Sometimes there is food, sometimes just drinks. Always a good crowd.',
    gem_type: 'night',
    city: 'La Marsa',
    country: 'Tunisia',
    coordinates: { lat: 36.884, lng: 10.332 },
    photos: [],
    best_time: 'Thursday nights after 10PM',
    avoid_time: 'Mondays (closed)',
    address_hint: 'End of the corniche, path marked by a painted blue anchor.',
    open_for_hosting: false,
    authenticity_score: 65,
    crowd_level: 'getting_known',
    ai_tags: ['Vinyl Beats', 'Ocean Spray', 'Indie Art'],
    ai_summary: 'Scratchy soul records echoing through damp seaside rooms filled with clove smoke and ocean spray.',
    status: 'getting_crowded',
    save_count: 210,
    visit_count: 150,
    verification_count: 40,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export function useGems(filter: GemType | 'all' = 'all') {
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore] = useState(false); // Pagination disabled for mock

  const fetchGems = useCallback(async () => {
    setLoading(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 1. Fetch User Access Tier
    let tier = 0;
    try {
      const pStr = localStorage.getItem('wanderdrop_profiles');
      const profiles = pStr ? JSON.parse(pStr) : {};
      const prof = profiles['local-user'] || { gem_access_tier: 0 };
      tier = Number(prof.gem_access_tier) || 0;
    } catch (e) {
      console.error('Failed to parse profiles in useGems', e);
    }

    // 2. Fetch Components
    let localGems = [];
    try {
      const localStr = localStorage.getItem('wanderdrop_local_gems');
      const parsed = localStr ? JSON.parse(localStr) : [];
      localGems = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse local gems', e);
    }
    
    let combined = [...localGems, ...MOCK_GEMS];
    
    // 3. Filter by Tier
    // Tier 0: basic only
    // Tier 1+: can see secret
    if (tier < 1) {
      combined = combined.filter(g => g.gem_type !== 'secret');
    }

    // 4. Filter by Category
    if (filter !== 'all') {
      combined = combined.filter(g => g.gem_type === filter);
    }
    
    // 5. Final Sort
    combined.sort((a, b) => b.authenticity_score - a.authenticity_score);

    setGems(combined);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  const loadMore = () => {
    // Left empty for mock implementation since we load all at once
  };

  return { gems, loading, loadMore, hasMore, refetch: fetchGems };
}
