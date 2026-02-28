import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WandererProfile, Profile } from '../types';

interface ProfileHeroProps {
  profile: WandererProfile;
  user: Profile; // The base user model
  onShare: () => void;
}

export default function ProfileHero({ profile, user, onShare }: ProfileHeroProps) {
  const [editingTagline, setEditingTagline] = useState(false);
  const [tagline, setTagline] = useState(user.profile_tagline || '');
  
  // The 'building' state triggered when actions < 3
  const isBuilding = profile.total_activity_count < 3;
  
  const handleSaveTagline = () => {
    // Save to local storage mock
    localStorage.setItem('wanderdrop_tagline', tagline);
    setEditingTagline(false);
    // Force a storage event dispatch to re-render in parent if needed
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="bg-ink rounded-b-[40px] pt-12 pb-8 px-6 shadow-warm-lg relative overflow-hidden grain text-cream mx-auto max-w-md w-full shrink-0" id="profile-hero-card">
      
      {/* Top Banner Row */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex gap-4 items-center">
          {/* Avatar Base */}
          <div className="w-14 h-14 rounded-full bg-clay text-cream flex items-center justify-center text-xl font-instrument font-bold shadow-warm">
            {user.username ? user.username.charAt(0).toUpperCase() : 'W'}
          </div>
          <div>
            <h1 className="font-instrument font-bold text-lg leading-tight">{user.username || 'Wanderer'}</h1>
            
            {/* Tagline Editor */}
            <div className="flex items-center gap-2 mt-1 min-h-[24px]">
              {editingTagline ? (
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSaveTagline(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    maxLength={60}
                    autoFocus
                    className="bg-white/10 text-cream font-instrument text-xs px-2 py-1 rounded outline-none border border-sand/30"
                  />
                  <button type="submit" className="text-[10px] text-terracotta uppercase font-bold tracking-widest">Done</button>
                </form>
              ) : (
                <p 
                  className="font-instrument text-sand text-xs flex items-center gap-1.5 cursor-pointer group hover:text-white transition-colors"
                  onClick={() => setEditingTagline(true)}
                >
                  {tagline || 'Add a tagline...'}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Share Button */}
        {!isBuilding && (
          <button 
            onClick={onShare} 
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Share Profile"
            data-hide-on-share="true" // Attribute used when taking screenshot
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sand"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {isBuilding ? (
          <motion.div 
            key="building"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-6 relative z-10"
          >
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-4xl mb-4"
            >
              🧬
            </motion.div>
            <h2 className="heading text-3xl text-sand mb-3">Your travel DNA<br />is building...</h2>
            
            <div className="w-full max-w-[200px] mx-auto bg-white/5 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-clay transition-all duration-500 ease-out"
                style={{ width: `${(profile.total_activity_count / 3) * 100}%` }}
              />
            </div>
            
            <p className="font-instrument text-dusk text-xs mb-8">
              {profile.total_activity_count} / 3 actions completed
            </p>
            
            <p className="font-instrument text-white/40 text-[10px] uppercase tracking-widest px-8 leading-relaxed">
              Drop into the unknown. Save a secret gem. Leave your mark. Let the algorithm learn your soul.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            key="built"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
          >
            <h2 className="heading text-4xl sm:text-5xl text-clay mb-4 leading-none">
              {profile.archetype}
            </h2>
            <p className="font-instrument text-sand/90 text-sm leading-relaxed mb-8 max-w-[90%] md:max-w-full">
              {profile.archetype_description}
            </p>
            
            {/* Stats Row */}
            <div className="flex gap-2 font-instrument text-xs">
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex gap-1.5 items-center">
                <span className="text-sand">Drops</span>
                <span className="font-bold text-cream">2</span>
              </div>
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full flex gap-1.5 items-center">
                <span className="text-sand">Gems</span>
                <span className="font-bold text-cream">14</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
