import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJIS = ['😩', '😐', '🙂', '😄', '🤩'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string, rating: number) => void;
}

export default function CompletionSheet({ isOpen, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');
  const [rating, setRating] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(note, rating);
    setNote('');
    setRating(5);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-cream rounded-t-[32px] shadow-[0_-8px_30px_rgba(28,22,18,0.12)] p-6 pb-safe border-t border-sand/30"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-sand rounded-full mx-auto mb-6" />

            <h3 className="font-fraunces text-2xl text-ink mb-6 text-center">
              Challenge Complete
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload Mock */}
              <button 
                type="button"
                className="w-full py-4 border-2 border-dashed border-sand/50 rounded-2xl flex flex-col items-center justify-center text-dusk hover:bg-parchment transition-colors"
                onClick={() => alert("Photo upload opens native camera/gallery in production.")}
              >
                <span className="text-2xl mb-1">📷</span>
                <span className="font-instrument text-sm font-medium">Add Photo Evidence (Optional)</span>
              </button>

              {/* Reflection Note */}
              <div>
                <label className="block font-instrument text-xs font-bold text-dusk uppercase tracking-wider mb-2">
                  Reflection
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What happened? What did you learn?"
                  className="w-full p-4 bg-parchment border border-sand rounded-2xl font-instrument text-ink placeholder:text-dusk/50 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-clay/30 transition-all"
                />
              </div>

              {/* Mood Rating */}
              <div>
                <label className="block font-instrument text-xs font-bold text-dusk uppercase tracking-wider mb-3 text-center">
                  How did it feel?
                </label>
                <div className="flex justify-between max-w-[280px] mx-auto">
                  {EMOJIS.map((emoji, index) => {
                    const score = index + 1;
                    const isSelected = rating === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setRating(score)}
                        className={`text-3xl transition-transform ${isSelected ? 'scale-125 grayscale-0 drop-shadow-md' : 'scale-100 grayscale-[60%] opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-4 bg-clay text-cream font-instrument font-bold text-lg rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all"
              >
                I did it — claim XP
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
