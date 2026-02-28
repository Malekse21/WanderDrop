import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CompanionMatch, Archetype } from '../types';

interface MatchCardProps {
  match: CompanionMatch;
  delay?: number;
}

// Temporary map to fetch companion colors until we build the full design token set into the database
const ARCHETYPE_COLORS: Record<Archetype, string> = {
  'The Lone Wolf': 'bg-ink border-white/20',
  'The Culture Vulture': 'bg-sand border-dusk/20',
  'The Chaos Tourist': 'bg-terracotta border-clay/20',
  'The Slow Traveler': 'bg-moss border-ink/20',
  'The Midnight Roamer': 'bg-ink border-clay/20',
  'The Hidden Gem Hunter': 'bg-clay border-sand/20',
  'The Social Butterfly': 'bg-sand border-clay/20',
  'The Comfort Seeker': 'bg-parchment border-dusk/20',
};

export default function MatchCard({ match, delay = 0 }: MatchCardProps) {
  const [waved, setWaved] = useState(match.status === 'accepted');

  const handleWave = () => {
    // In a real app, this triggers an Edge Function or DB update. Mocking optimistically.
    setWaved(true);
  };

  const initial = match.username ? match.username.charAt(0).toUpperCase() : '?';
  const colorClass = ARCHETYPE_COLORS[match.archetype as Archetype] || 'bg-dusk border-white/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-cream rounded-2xl p-4 sm:p-5 shadow-warm-sm border border-sand/30 flex min-w-0"
    >
      {/* Avatar column */}
      <div className="shrink-0 mr-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-cream font-instrument font-bold text-lg border-2 shadow-sm ${colorClass}`}>
          {initial}
        </div>
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="font-instrument font-bold text-ink truncate">{match.username}</h3>
            <p className="text-[10px] font-instrument uppercase tracking-wider text-clay font-bold">
              {match.archetype}
            </p>
          </div>
          
          {/* Score Badge */}
          <div className="text-right shrink-0 ml-2">
            <div className="heading text-2xl text-clay leading-none">{match.compatibility_score}<span className="text-sm font-instrument">%</span></div>
            <div className="text-[8px] font-instrument uppercase tracking-widest text-dusk font-bold">Vibe Match</div>
          </div>
        </div>

        {/* Blurb */}
        <p className="font-instrument text-dusk/80 text-xs italic leading-snug my-2 pr-6">
          "{match.compatibility_blurb}"
        </p>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleWave}
            disabled={waved}
            className={`px-4 py-1.5 rounded-full font-instrument text-xs font-bold transition-all flex items-center gap-1.5 ${
              waved 
                ? 'bg-ink text-cream' 
                : 'bg-parchment text-ink border border-sand/50 hover:bg-sand/30'
            }`}
          >
            {waved ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Waved
              </>
            ) : (
              <>Wave 👋</>
            )}
          </button>
          <button className="px-4 py-1.5 rounded-full font-instrument text-xs font-bold text-dusk hover:bg-sand/20 transition-colors">
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
}
