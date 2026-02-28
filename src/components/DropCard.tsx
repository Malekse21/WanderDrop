import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import { useWandererProfile } from '../hooks/useWandererProfile';
import ItineraryView from './ItineraryView';
import type { Drop } from '../types';
import { useNavigate } from 'react-router-dom';

interface DropCardProps {
  drop: Drop | null;
  loading: boolean;
  onReveal?: () => void;
}

/* ────────────────────────────────────────────
   No-Drop State
   ──────────────────────────────────────────── */
function NoDropCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-parchment rounded-3xl p-8 shadow-warm text-center"
    >
      <div className="text-5xl mb-4">🧭</div>
      <h2 className="heading text-2xl text-ink mb-2">Your next adventure awaits</h2>
      <p className="font-instrument text-dusk mb-6">
        Let the AI pick a destination you'd never choose yourself.
      </p>
      <button
        onClick={() => navigate('/new')}
        className="w-full py-3.5 px-6 bg-clay text-cream font-instrument font-semibold rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all"
      >
        Create a Drop
      </button>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Generating Skeleton
   ──────────────────────────────────────────── */
function GeneratingCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-ink rounded-3xl p-6 shadow-warm-lg relative overflow-hidden grain"
    >
      <div className="relative z-10 space-y-4">
        <div className="shimmer-bg h-14 w-32 rounded-xl" />
        <div className="shimmer-bg h-4 w-full rounded-lg" />
        <div className="shimmer-bg h-4 w-3/4 rounded-lg" />
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer-bg h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer-bg h-20 flex-1 rounded-xl" />
          ))}
        </div>
        <div className="shimmer-bg h-14 w-full rounded-2xl mt-4" />
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Active State (countdown)
   ──────────────────────────────────────────── */
function ActiveCard({ drop, onReveal }: { drop: Drop; onReveal?: () => void }) {
  const countdown = useCountdown(drop.reveal_at);
  const { triggerBackgroundRecalculation } = useWandererProfile();
  const [revealing, setRevealing] = useState(false);

  const handleReveal = async () => {
    if (!countdown.isReady || revealing) return;
    setRevealing(true);

    try {
      // Simulate network delay for reveal
      await new Promise((resolve) => setTimeout(resolve, 800));

      const updatedDrop = {
        ...drop,
        status: 'revealed' as const,
        revealed_at: new Date().toISOString(),
      };

      // Update local storage
      localStorage.setItem('wanderdrop_active_drop', JSON.stringify(updatedDrop));
      // Record action and recalculate profile
      triggerBackgroundRecalculation();

      onReveal?.();
    } catch (err) {
      console.error('Reveal failed:', err);
      setRevealing(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-ink rounded-3xl p-6 shadow-warm-lg relative overflow-hidden grain"
    >
      <div className="relative z-10">
        {/* Mystery title */}
        <h2 className="heading text-6xl text-sand mb-3">???</h2>

        {/* Vibe line */}
        {drop.vibe_line && (
          <p className="font-instrument text-dusk text-sm leading-relaxed mb-5 italic">
            "{drop.vibe_line}"
          </p>
        )}

        {/* Hint chips */}
        {drop.hints && drop.hints.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {drop.hints.map((hint, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-sand/90 text-sm font-instrument whitespace-nowrap backdrop-blur-sm"
              >
                <span>{hint.emoji}</span>
                <span>{hint.text}</span>
              </motion.span>
            ))}
          </div>
        )}

        {/* Countdown */}
        <div className="flex gap-3 justify-center mb-6">
          {[
            { value: pad(countdown.hours), label: 'HRS' },
            { value: pad(countdown.minutes), label: 'MIN' },
            { value: pad(countdown.seconds), label: 'SEC' },
          ].map((block) => (
            <div
              key={block.label}
              className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl py-4 text-center"
            >
              <div className="heading text-3xl text-sand">{block.value}</div>
              <div className="text-[10px] font-instrument font-semibold text-dusk tracking-widest uppercase mt-1">
                {block.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reveal button */}
        <button
          onClick={handleReveal}
          disabled={!countdown.isReady || revealing}
          className={`w-full py-4 rounded-2xl font-instrument font-semibold text-lg transition-all ${
            countdown.isReady
              ? 'bg-clay text-cream shadow-warm animate-pulse-glow hover:brightness-110 active:scale-[0.98]'
              : 'bg-white/10 text-dusk/50 cursor-not-allowed'
          }`}
        >
          {revealing ? 'Revealing...' : countdown.isReady ? 'Reveal Your Drop' : 'Locked'}
        </button>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Revealed State
   ──────────────────────────────────────────── */
function RevealedCard({ drop }: { drop: Drop }) {
  const navigate = useNavigate();
  const [showReasoning, setShowReasoning] = useState(false);
  const cityLetters = (drop.destination_city || '').split('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Destination header */}
      <div className="bg-ink rounded-3xl p-6 shadow-warm-lg relative overflow-hidden grain">
        <div className="relative z-10 text-center">
          {/* Letter-by-letter animation */}
          <h2 className="heading text-5xl md:text-6xl text-sand mb-2 flex justify-center flex-wrap">
            {cityLetters.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.04,
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: cityLetters.length * 0.04 + 0.2 }}
            className="font-instrument text-dusk text-lg"
          >
            {drop.destination_country}
          </motion.p>

          {drop.airport_code && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: cityLetters.length * 0.04 + 0.4 }}
              className="inline-block mt-2 px-3 py-1 bg-white/10 rounded-full text-sand/70 text-xs font-instrument"
            >
              ✈️ {drop.airport_code}
            </motion.span>
          )}
        </div>
      </div>

      {/* AI Reasoning collapsible */}
      {drop.ai_reasoning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-parchment rounded-2xl overflow-hidden shadow-warm-sm"
        >
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between px-5 py-4 font-instrument font-medium text-ink"
          >
            <span>🧠 Why this destination?</span>
            <motion.span
              animate={{ rotate: showReasoning ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              ↓
            </motion.span>
          </button>
          <AnimatePresence>
            {showReasoning && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-4 font-instrument text-dusk text-sm leading-relaxed">
                  {drop.ai_reasoning}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Itinerary */}
      {drop.itinerary && <ItineraryView itinerary={drop.itinerary} />}

      {/* Welcome Challenge */}
      {drop.welcome_challenge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-moss p-6 rounded-3xl shadow-warm text-cream mt-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎯</span>
            <span className="font-instrument text-xs font-bold uppercase tracking-wider text-cream/80">Arrival Mission</span>
          </div>
          <p className="font-fraunces text-xl leading-tight mb-4">
            {drop.welcome_challenge}
          </p>
          <button 
            onClick={() => navigate('/challenges')}
            className="px-4 py-2 bg-cream text-moss font-instrument font-bold text-sm rounded-xl hover:bg-cream/90 transition-colors"
          >
            Go to Challenges
          </button>
        </motion.div>
      )}

      <div className="pt-8 pb-4">
        <button
          onClick={() => {
            localStorage.removeItem('wanderdrop_active_drop');
            navigate('/new');
          }}
          className="w-full py-4 bg-clay text-cream font-instrument font-semibold text-lg rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Book Another Drop
        </button>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────
   Main DropCard
   ──────────────────────────────────────────── */
export default function DropCard({ drop, loading, onReveal }: DropCardProps) {
  if (loading) {
    return <GeneratingCard />;
  }

  if (!drop) {
    return <NoDropCard />;
  }

  switch (drop.status) {
    case 'generating':
      return <GeneratingCard />;
    case 'active':
      return <ActiveCard drop={drop} onReveal={onReveal} />;
    case 'revealed':
    case 'completed':
      return <RevealedCard drop={drop} />;
    default:
      return <NoDropCard />;
  }
}
