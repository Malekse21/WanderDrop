import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIER_CELEBRATIONS = [
  null,
  { emoji: '🌿', name: 'Local', desc: 'You\'ve unlocked Secret gems in the feed!' },
  { emoji: '🔥', name: 'Insider', desc: 'You\'ve unlocked Hidden gems in the feed!' },
  { emoji: '👻', name: 'Ghost', desc: 'You now possess ultimate clearance. Retired gems unlocked.' }
];

export default function XPUnlockCelebration() {
  const [activeTier, setActiveTier] = useState<number | null>(null);

  useEffect(() => {
    const handleUnlock = (e: CustomEvent) => {
      if (e.detail?.newTier) {
        setActiveTier(e.detail.newTier);
        // Auto dismiss after 3 seconds
        setTimeout(() => {
          setActiveTier(null);
        }, 3500);
      }
    };
    
    window.addEventListener('tier-unlocked', handleUnlock as EventListener);
    return () => window.removeEventListener('tier-unlocked', handleUnlock as EventListener);
  }, []);

  const config = (activeTier !== null && activeTier > 0) ? TIER_CELEBRATIONS[activeTier] : null;

  return (
    <AnimatePresence>
      {activeTier !== null && config && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 backdrop-blur-md px-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="text-8xl mb-6 shadow-glow"
          >
            {config.emoji}
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-fraunces text-4xl text-sand mb-3"
          >
            {config.name} Unlocked
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-instrument text-lg text-cream/80 max-w-sm"
          >
            {config.desc}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-12 px-6 py-3 bg-moss text-cream font-instrument font-medium rounded-2xl shadow-warm border border-moss/50"
          >
            New gems unlocked in your feed 💎
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
