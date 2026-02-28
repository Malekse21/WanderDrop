import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWandererProfile } from '../hooks/useWandererProfile';
import { useMatches } from '../hooks/useMatches';
import { useShareProfile } from '../hooks/useShareProfile';
import type { Profile } from '../types';

import ProfileHero from '../components/ProfileHero';
import RadarChart from '../components/RadarChart';
import TraitBars from '../components/TraitBars';
import MatchCard from '../components/MatchCard';

// Dummy static user object mapped to the mock local state
const CURRENT_USER: Profile = {
  id: 'local-user',
  username: 'Sarah_Nomad',
  avatar_url: null,
  is_discoverable: true,
  match_notification: true,
  profile_tagline: null,
  created_at: new Date().toISOString(),
};

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useWandererProfile();
  const { matches, loading: matchesLoading, error: matchesError, findMatches } = useMatches();
  const { sharing, shareProfile } = useShareProfile();
  
  useEffect(() => {
    // Keep tagline sync'd across components via storage event listener
    const syncTagline = () => window.dispatchEvent(new Event('dashboard-update'));
    window.addEventListener('storage', syncTagline);
    return () => window.removeEventListener('storage', syncTagline);
  }, []);

  if (profileLoading || !profile) {
    return (
      <div className="min-h-dvh bg-cream flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-sand border-t-clay animate-spin" />
      </div>
    );
  }

  const isBuilding = profile.total_activity_count < 3;
  // Get sync'd tagline to pass into hero
  const activeTagline = localStorage.getItem('wanderdrop_tagline');
  const userProps = { ...CURRENT_USER, profile_tagline: activeTagline };

  return (
    <div className="min-h-dvh bg-cream pb-24 flex flex-col items-center overflow-x-hidden">
      
      {/* 1. Hero / Header Section */}
      <ProfileHero 
        profile={profile} 
        user={userProps} 
        onShare={() => shareProfile('profile-hero-card')} 
      />

      {/* 2. Trait Map Section */}
      <AnimatePresence>
        {!isBuilding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md px-4 mt-8"
          >
            <div className="bg-white rounded-3xl p-6 shadow-warm-lg border border-sand/30">
              <h3 className="heading text-2xl text-ink text-center mb-6">Trait Map</h3>
              
              <RadarChart profile={profile} />
              
              <div className="mt-8">
                <TraitBars profile={profile} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Companion Matches Section */}
      <AnimatePresence>
        {!isBuilding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md px-4 mt-8"
          >
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <h3 className="heading text-2xl text-ink">Your Travel Twins</h3>
                <p className="font-instrument text-xs text-dusk max-w-[200px]">Matched by AI based on complementary explorer styles.</p>
              </div>
              <button
                onClick={findMatches}
                disabled={matchesLoading}
                className="shrink-0 px-4 py-2 border-2 border-clay text-clay rounded-full text-xs font-instrument font-bold uppercase tracking-widest hover:bg-clay hover:text-white transition-colors disabled:opacity-50"
              >
                {matchesLoading ? 'Searching...' : matches.length > 0 ? 'Refresh' : 'Find Matches'}
              </button>
            </div>

            {matchesError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl font-instrument text-sm mb-4">
                {matchesError}
              </div>
            )}

            <div className="space-y-4">
              {matches.length === 0 && !matchesLoading ? (
                <div className="text-center py-12 px-6 bg-parchment rounded-3xl border border-sand/50 shadow-inner">
                  <span className="text-4xl">🧭</span>
                  <h4 className="heading text-xl text-ink mt-4 mb-2">No matches yet</h4>
                  <p className="font-instrument text-sm text-dusk max-w-xs mx-auto">
                    Hit "Find Matches" above to let our algorithm pair your distinct style with complementary explorers globally.
                  </p>
                </div>
              ) : (
                matches.map((match, i) => (
                  <MatchCard key={match.id} match={match} delay={i * 0.15} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Sharing Overlay */}
      <AnimatePresence>
        {sharing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-sand border-t-clay animate-spin mb-4" />
              <p className="heading text-xl text-cream">Generating share card...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
