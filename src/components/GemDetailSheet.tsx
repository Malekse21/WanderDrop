import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Gem } from '../types';
import AuthenticityBadge from './AuthenticityBadge';
import { getGemTypeColor, getGemTypeEmoji } from '../utils/gemColors';
import { useSaveGem } from '../hooks/useSaveGem';
import VerificationForm from './VerificationForm';

interface GemDetailSheetProps {
  gem: Gem | null;
  onClose: () => void;
}

export default function GemDetailSheet({ gem, onClose }: GemDetailSheetProps) {
  const [showVerify, setShowVerify] = useState(false);
  const isSavedHook = useSaveGem(gem?.id || '');

  if (!gem) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.05}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100) onClose();
          }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-cream rounded-t-[32px] shadow-warm-lg flex flex-col h-[92dvh] overflow-hidden"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center py-4 shrink-0 bg-cream z-10 sticky top-0">
            <div className="w-12 h-1.5 bg-sand rounded-full" />
          </div>

          <div className="flex-1 overflow-y-auto pb-safe">
            {/* Header Image / Color Block */}
            <div className={`w-full h-64 relative flex items-center justify-center shrink-0 ${!gem.photos?.length ? getGemTypeColor(gem.gem_type) : 'bg-parchment'}`}>
              {gem.photos?.length ? (
                // Simplistic carousel placeholder (just shows first image for now)
                <img src={gem.photos[0]} alt={gem.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-7xl opacity-80">{getGemTypeEmoji(gem.gem_type)}</span>
              )}

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => isSavedHook.toggleSave()}
                  className="w-10 h-10 rounded-full bg-cream/90 backdrop-blur-sm flex items-center justify-center shadow-warm-sm hover:scale-110 active:scale-95 transition-all text-ink text-xl"
                >
                  {isSavedHook.isSaved ? '📌' : '🔖'}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="heading text-3xl text-ink leading-tight pr-4">{gem.title}</h2>
                <AuthenticityBadge score={gem.authenticity_score} />
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm font-instrument">
                <div className="w-6 h-6 rounded-full bg-sand" />
                <span className="text-dusk font-medium">@{gem.author_id}</span>
                <span className="text-sand mx-1">•</span>
                <span className="text-dusk">{new Date(gem.created_at).toLocaleDateString()}</span>
              </div>

              {/* Vibe Tags */}
              {gem.ai_tags && gem.ai_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {gem.ai_tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-parchment border border-sand/50 text-dusk text-xs font-instrument uppercase tracking-wider font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <p className="font-instrument text-ink/80 leading-relaxed text-lg mb-8 whitespace-pre-wrap">
                {gem.description}
              </p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {gem.best_time && (
                  <div className="bg-parchment rounded-2xl p-4">
                    <div className="text-[10px] font-instrument uppercase tracking-wider text-dusk/70 font-bold mb-1">Best Time</div>
                    <div className="font-instrument text-ink text-sm">{gem.best_time}</div>
                  </div>
                )}
                {gem.avoid_time && (
                  <div className="bg-parchment rounded-2xl p-4">
                    <div className="text-[10px] font-instrument uppercase tracking-wider text-dusk/70 font-bold mb-1">Avoid</div>
                    <div className="font-instrument text-ink text-sm">{gem.avoid_time}</div>
                  </div>
                )}
              </div>

              {gem.address_hint && (
                <div className="mb-8">
                  <div className="text-[10px] font-instrument uppercase tracking-wider text-dusk/70 font-bold mb-1">How to find it</div>
                  <p className="font-instrument text-ink italic text-sm">{gem.address_hint}</p>
                </div>
              )}

              <hr className="border-sand/30 my-8" />

              {/* Verifications Section */}
              <div className="mb-24">
                <h3 className="heading text-xl text-ink mb-4">Verifications ({gem.verification_count})</h3>
                {gem.verification_count === 0 ? (
                  <p className="font-instrument text-dusk text-sm italic">No one has verified this spot yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                     {/* Mocked reviews for UI visualization since DB is mocked */}
                     <div className="bg-parchment rounded-2xl p-4">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-clay text-sm">★★★★★</span>
                         <span className="font-instrument text-xs text-dusk font-bold uppercase">Still Hidden: Yes</span>
                       </div>
                       <p className="font-instrument text-ink text-sm">"Incredible spot. Exactly as described and completely empty when we went."</p>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Verify Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-cream/90 backdrop-blur-md border-t border-sand/30 pt-4 pb-8">
            <button
              onClick={() => setShowVerify(true)}
              className="w-full py-4 bg-clay text-cream font-instrument font-semibold text-lg rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all"
            >
              I've Been Here — Verify It
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showVerify && (
          <VerificationForm gem={gem} onClose={() => setShowVerify(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
