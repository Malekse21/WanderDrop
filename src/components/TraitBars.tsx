import { motion } from 'framer-motion';
import type { WandererProfile } from '../types';

// Trait mappings matching the radar chart axes
const TRAITS = [
  { key: 'chaos_score', name: 'Chaos', color: 'bg-clay', textColor: 'text-clay' },
  { key: 'connection_score', name: 'Connection', color: 'bg-moss', textColor: 'text-moss' },
  { key: 'culture_score', name: 'Culture', color: 'bg-sand', textColor: 'text-sand' },
  { key: 'sensation_score', name: 'Sensation', color: 'bg-terracotta', textColor: 'text-terracotta' },
  { key: 'foodie_depth_score', name: 'Foodie Depth', color: 'bg-dusk', textColor: 'text-dusk' },
  { key: 'night_owl_score', name: 'Night Owl', color: 'bg-ink', textColor: 'text-ink' },
];

export default function TraitBars({ profile }: { profile: WandererProfile }) {
  return (
    <div className="space-y-4 px-2">
      {TRAITS.map((trait, i) => {
        const score = profile[trait.key as keyof WandererProfile] as number || 0;
        
        return (
          <div key={trait.key} className="flex items-center gap-4">
            <div className="w-24 shrink-0 flex justify-between items-center text-xs font-instrument font-medium uppercase tracking-wider text-ink">
              <span>{trait.name}</span>
              <span className={`font-bold ${trait.textColor}`}>{score}</span>
            </div>
            
            <div className="flex-1 h-2 bg-parchment rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, type: 'spring' }}
                className={`h-full rounded-full ${trait.color}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
