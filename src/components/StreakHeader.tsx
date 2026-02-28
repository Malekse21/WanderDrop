import { motion } from 'framer-motion';
import { useStreak } from '../hooks/useStreak';
import { useXP } from '../hooks/useXP';

const TIER_BADGES = [
  { label: 'Explorer', color: 'bg-sand text-ink', border: 'border-transparent' },
  { label: 'Local', color: 'bg-moss text-cream', border: 'border-transparent' },
  { label: 'Insider', color: 'bg-terracotta text-cream', border: 'border-transparent' },
  { label: 'Ghost', color: 'bg-ink text-sand', border: 'border-yellow-500/50' }
];

export default function StreakHeader() {
  const { current_streak } = useStreak();
  const { totalXP, currentTier } = useXP();
  
  const safeTier = Math.min(Math.max(Number(currentTier) || 0, 0), 3);
  const badgeConfig = TIER_BADGES[safeTier] || TIER_BADGES[0];

  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-cream/80 backdrop-blur-md rounded-2xl border border-sand/30 shadow-warm-sm mb-4">
      {/* Streak */}
      <div className="flex items-center gap-2">
        <span className="text-2xl" role="img" aria-label="flame">🔥</span>
        <div className="flex flex-col">
          <span className="font-fraunces text-xl leading-none text-ink">{current_streak}</span>
          <span className="font-instrument text-[10px] font-bold uppercase tracking-wider text-dusk/70">Day Streak</span>
        </div>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5">
        <span className="text-xl" role="img" aria-label="lightning bolt">⚡</span>
        <span className="font-fraunces text-lg text-ink">{totalXP.toLocaleString()}</span>
      </div>

      {/* Tier Badge */}
      <motion.div 
        key={safeTier}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className={`px-3 py-1 rounded-full border ${badgeConfig.border} ${badgeConfig.color}`}
      >
        <span className="font-instrument text-xs font-bold uppercase tracking-wide">
          {badgeConfig.label}
        </span>
      </motion.div>
    </div>
  );
}
