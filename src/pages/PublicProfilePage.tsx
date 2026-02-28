import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { WandererProfile, Profile } from '../types';

import ProfileHero from '../components/ProfileHero';
import RadarChart from '../components/RadarChart';
import TraitBars from '../components/TraitBars';

// Mock profile for public view (bypasses auth requirement)
const PUBLIC_PROFILE: WandererProfile = {
  user_id: 'public-user',
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

const PUBLIC_USER: Profile = {
  id: 'public-user',
  username: 'Stranger_Nomad',
  avatar_url: null,
  is_discoverable: true,
  match_notification: true,
  profile_tagline: "Wandering where the WiFi is weak.",
  created_at: new Date().toISOString(),
};

export default function PublicProfilePage() {
  const { shareToken } = useParams();
  const [loading, setLoading] = useState(true);

  // Mocking the fetch by share token constraint 
  useEffect(() => {
    // In a real app we query `profile_shares` where share_token = shareToken, join `wanderer_profiles` and increment view_count logic here
    console.log("Fetching read-only profile via token: ", shareToken);
    setTimeout(() => setLoading(false), 800);
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-cream flex justify-center py-24">
        <div className="w-8 h-8 rounded-full border-4 border-sand border-t-clay animate-spin" />
      </div>
    );
  }

  // Open Graph Head Tags ideally managed server side or react-helmet for real crawlers
  const pageTitle = `${PUBLIC_PROFILE.archetype} | WanderDrop`;

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center overflow-x-hidden pt-12 pb-24 relative">
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={PUBLIC_USER.profile_tagline || ''} />
      
      {/* Call to Action Banner (Fixed Top) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-clay/95 backdrop-blur shadow-warm flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
           <span className="text-xl">🧭</span>
           <span className="font-instrument font-bold text-cream text-sm">Viewed on WanderDrop</span>
        </div>
        <Link 
            to="/" 
            className="px-4 py-1.5 bg-cream text-ink text-xs font-instrument font-bold rounded-full uppercase tracking-widest hover:brightness-90 transition-colors"
        >
            Get Yours
        </Link>
      </div>

      {/* 1. Hero / Header Section (Read Only, No Share Button via empty onShare or conditional rendering inside)*/}
      <div className="mt-8 w-full max-w-md pointer-events-none">
        <ProfileHero 
            profile={PUBLIC_PROFILE} 
            user={PUBLIC_USER} 
            onShare={() => {}} 
        />
      </div>

      {/* 2. Trait Map Section */}
      <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md px-4 mt-8 pointer-events-none"
          >
            <div className="bg-white rounded-3xl p-6 shadow-warm-lg border border-sand/30">
              <h3 className="heading text-2xl text-ink text-center mb-6">Trait Map</h3>
              <RadarChart profile={PUBLIC_PROFILE} />
              <div className="mt-8">
                <TraitBars profile={PUBLIC_PROFILE} />
              </div>
            </div>
          </motion.div>
      </AnimatePresence>

      <div className="mt-12 text-center z-10">
        <Link to="/" className="heading text-3xl text-ink underline decoration-clay underline-offset-8 hover:text-clay transition-colors">
            Discover your archetype &#8594;
        </Link>
      </div>

    </div>
  );
}
