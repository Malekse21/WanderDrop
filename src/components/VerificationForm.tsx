import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Gem } from '../types';
import { awardMockXP } from '../utils/mockXp';

interface VerificationFormProps {
  gem: Gem;
  onClose: () => void;
}

export default function VerificationForm({ gem, onClose }: VerificationFormProps) {
  const [rating, setRating] = useState(0);
  const [stillHidden, setStillHidden] = useState<boolean | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || stillHidden === null) return;
    
    setSubmitting(true);
    // Simulate network latency for mock verification
    await new Promise(resolve => setTimeout(resolve, 800));
    
    awardMockXP(50, 'gem_verify', gem.id);
    
    setSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-cream rounded-t-[32px] shadow-warm-lg p-6 pb-safe"
      >
        {success ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💎</div>
            <h2 className="heading text-2xl text-ink mb-2">Verified!</h2>
            <p className="font-instrument text-dusk">+50 XP added to your profile</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="heading text-2xl text-ink">Verify {gem.title}</h2>
              <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center text-dusk font-bold">×</button>
            </div>

            <div>
              <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-3">Overall Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform ${rating >= star ? 'text-clay scale-110' : 'text-sand grayscale opacity-50'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-3">Is it still hidden?</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStillHidden(true)}
                  className={`flex-1 py-3 rounded-xl font-instrument font-medium transition-all ${stillHidden === true ? 'bg-moss text-cream shadow-warm-sm' : 'bg-parchment text-dusk hover:bg-sand/30'}`}
                >
                  Yes, very quiet
                </button>
                <button
                  type="button"
                  onClick={() => setStillHidden(false)}
                  className={`flex-1 py-3 rounded-xl font-instrument font-medium transition-all ${stillHidden === false ? 'bg-terracotta text-cream shadow-warm-sm' : 'bg-parchment text-dusk hover:bg-sand/30'}`}
                >
                  No, it's crowded
                </button>
              </div>
            </div>

            <div>
              <label className="block font-instrument text-xs font-semibold text-dusk uppercase tracking-wider mb-2">Short Note (Optional)</label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What changed? Any new tips?"
                className="w-full px-4 py-3 bg-parchment border border-sand rounded-xl font-instrument text-ink placeholder:text-dusk/40 focus:outline-none focus:ring-2 focus:ring-clay/30 resize-none h-24"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0 || stillHidden === null}
              className="w-full py-4 bg-ink text-cream font-instrument font-semibold text-lg rounded-2xl shadow-warm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? 'Verifying...' : 'Submit Verification'}
            </button>
          </form>
        )}
      </motion.div>
    </>
  );
}
