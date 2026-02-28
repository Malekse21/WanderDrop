import { useTodaysChallenge } from '../hooks/useTodaysChallenge';
import { useChallengeHistory } from '../hooks/useChallengeHistory';
import StreakHeader from '../components/StreakHeader';
import ChallengeHeroCard from '../components/ChallengeHeroCard';
import ChallengeHistoryItem from '../components/ChallengeHistoryItem';
import XPUnlockCelebration from '../components/XPUnlockCelebration';

export default function ChallengesPage() {
  const { challenge, loading, completeChallenge, skipChallenge } = useTodaysChallenge();
  const { history, hasMore, loadMore, loading: historyLoading } = useChallengeHistory();

  return (
    <div className="min-h-dvh bg-cream pb-32">
      <XPUnlockCelebration />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-sand/30">
        <div className="max-w-md mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="heading text-2xl text-ink">Challenges</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <StreakHeader />

        <section className="mb-10">
          <h2 className="font-instrument text-xs font-bold uppercase tracking-widest text-dusk/70 mb-3">
            Today's Mission
          </h2>
          <ChallengeHeroCard 
            challenge={challenge} 
            loading={loading} 
            onComplete={completeChallenge}
            onSkip={skipChallenge}
          />
        </section>

        <section>
          <h2 className="font-instrument text-xs font-bold uppercase tracking-widest text-dusk/70 mb-4">
            Past Missions
          </h2>
          
          <div className="space-y-4">
            {history.length === 0 && !historyLoading ? (
              <p className="font-instrument text-dusk/60 text-sm italic py-4">
                No past missions yet. Check back tomorrow!
              </p>
            ) : (
              history.map(c => (
                <ChallengeHistoryItem key={c.id} challenge={c} />
              ))
            )}
            
            {hasMore ? (
              <button
                onClick={loadMore}
                disabled={historyLoading}
                className="w-full py-3 mt-4 text-clay bg-clay/10 rounded-xl font-instrument font-bold text-sm hover:bg-clay/20 transition-colors"
              >
                {historyLoading ? 'Loading...' : 'Load More'}
              </button>
            ) : (
              history.length > 0 && (
                <p className="text-center font-instrument text-dusk/50 text-xs mt-6 pb-6">
                  You've reached the end of your history.
                </p>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
