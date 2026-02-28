import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DailyChallenge } from '../types';
import CompletionSheet from './CompletionSheet';
import confetti from 'canvas-confetti';

interface Props {
  challenge: DailyChallenge | null;
  loading: boolean;
  onComplete: (note: string, rating: number) => Promise<{ new_xp: number, tier_unlocked: boolean, new_tier: number, new_streak: number, streak_milestone: boolean } | null>;
  onSkip: () => void;
}

const CAT_COLORS: Record<string, string> = {
  food: 'bg-clay text-cream',
  culture: 'bg-moss text-cream',
  social: 'bg-terracotta text-cream',
  nature: 'bg-moss text-cream', // sage alternative
  night: 'bg-ink text-sand',
  exploration: 'bg-dusk text-cream'
};

function DifficultyDots({ diff }: { diff: string }) {
  const count = diff === 'hard' ? 3 : diff === 'medium' ? 2 : 1;
  return (
    <div className="flex gap-1 ml-2">
      {[1, 2, 3].map(i => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= count ? 'bg-sand' : 'bg-sand/20'}`} />
      ))}
    </div>
  );
}

function AnimatedCounter({ endValue }: { endValue: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 600;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(Math.floor(easeProgress * endValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [endValue]);

  return <span>+{count} XP</span>;
}

export default function ChallengeHeroCard({ challenge, loading, onComplete, onSkip }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [milestone, setMilestone] = useState(false);

  const handleCompleteSubmit = async (note: string, rating: number) => {
    const res = await onComplete(note, rating);
    setSheetOpen(false);
    if (res) {
      setJustCompleted(true);
      if (res.streak_milestone) {
        setMilestone(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C4603A', '#D97B52', '#E8C9A0', '#5C7A4E']
        });
      }
      if (res.tier_unlocked) {
        window.dispatchEvent(new CustomEvent('tier-unlocked', { detail: { newTier: res.new_tier } }));
      }
    }
  };

  if (loading || !challenge) {
    return (
      <div className="w-full bg-ink rounded-3xl p-6 shadow-warm relative overflow-hidden h-64 animate-pulse">
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-3xl -mr-10 -mt-20"></div>
        <div className="w-20 h-6 bg-sand/20 rounded-full mb-4"></div>
        <div className="w-3/4 h-8 bg-sand/20 rounded-xl mb-3"></div>
        <div className="w-full h-16 bg-sand/10 rounded-xl mb-6"></div>
        <div className="w-24 h-8 bg-clay/20 rounded-full"></div>
      </div>
    );
  }

  const isSkipped = challenge.status === 'skipped';
  const isCompleted = challenge.status === 'completed';
  const showCompletedState = isCompleted || justCompleted;

  return (
    <>
      <motion.div 
        layout
        className={`w-full bg-ink rounded-3xl p-6 pb-7 shadow-warm relative overflow-hidden transition-all duration-500 grain ${isSkipped ? 'opacity-60 grayscale-[50%]' : ''}`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            <span className={`px-2.5 py-1 ${CAT_COLORS[(challenge.category || 'exploration').toLowerCase()] || 'bg-sand text-ink'} text-[10px] uppercase font-bold tracking-wider rounded-full`}>
              {challenge.category || 'Quest'}
            </span>
            {/* Find diff from mockup or default if missing from schema projection */}
            <DifficultyDots diff={'medium'} /> 
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="font-fraunces text-2xl text-sand mb-2 leading-tight">
            {challenge.personalized_title}
          </h2>
          <p className="font-instrument text-dusk text-sm leading-relaxed mb-6">
            {challenge.personalized_description}
          </p>
        </div>

        {/* Footer actions */}
        <div className="relative z-10">
          {showCompletedState ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-moss/20 border border-moss/40 rounded-2xl p-4 flex flex-col items-center justify-center"
            >
              <div className="text-moss font-instrument font-bold flex items-center gap-2 mb-1">
                Completed ✓
              </div>
              <div className="font-fraunces text-sand text-lg">
                {justCompleted ? <AnimatedCounter endValue={challenge.xp_reward} /> : `+${challenge.xp_reward} XP`}
              </div>
              {challenge.completion_note && (
                <div className="mt-3 text-sm text-dusk/80 italic text-center w-full px-2 line-clamp-2">
                  "{challenge.completion_note}"
                </div>
              )}
            </motion.div>
          ) : isSkipped ? (
            <div className="w-full text-center py-4 text-dusk font-instrument text-sm">
              Skipped — come back tomorrow.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1.5 bg-clay/20 text-clay font-instrument font-bold text-sm rounded-full">
                  +{challenge.xp_reward} XP
                </span>
              </div>
              
              <button
                onClick={() => setSheetOpen(true)}
                className="w-full py-3.5 bg-clay text-cream font-instrument font-bold text-lg rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Mark Complete
              </button>
              
              <button
                onClick={onSkip}
                className="w-full py-2 text-dusk hover:text-sand font-instrument text-sm font-medium transition-colors"
              >
                Skip for today
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <CompletionSheet 
        isOpen={sheetOpen} 
        onClose={() => setSheetOpen(false)} 
        onSubmit={handleCompleteSubmit} 
      />
    </>
  );
}
