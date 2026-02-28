import type { DailyChallenge } from '../types';

interface Props {
  challenge: DailyChallenge;
}

const CAT_COLORS: Record<string, string> = {
  food: 'bg-clay',
  culture: 'bg-moss',
  social: 'bg-terracotta',
  nature: 'bg-moss', // sage 
  night: 'bg-ink',
  exploration: 'bg-dusk'
};

export default function ChallengeHistoryItem({ challenge }: Props) {
  const isCompleted = challenge.status === 'completed';
  const category = (challenge.category || 'exploration').toLowerCase();
  const color = CAT_COLORS[category] || 'bg-sand';
  
  // Format MM/DD
  const dateObj = new Date(challenge.date_assigned);
  const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;

  return (
    <div 
      className={`relative w-full p-4 mb-3 rounded-2xl bg-cream border overflow-hidden ${isCompleted ? 'border-moss/30' : 'border-sand/50 opacity-60'} shadow-sm flex items-start gap-4`}
    >
      {/* Left colored indicator strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCompleted ? color : 'bg-sand'}`} />

      {/* Date */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 pt-1 pb-2 bg-parchment rounded-xl border border-sand/30">
        <span className="font-instrument text-[10px] uppercase font-bold text-dusk/60 mb-0.5">Date</span>
        <span className="font-fraunces text-sm text-ink">{dateStr}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-instrument text-[10px] uppercase font-bold tracking-wider text-dusk/80">
            {challenge.category || 'exploration'}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 font-instrument text-[10px] font-bold text-moss">
              ✓ +{challenge.xp_reward}XP
            </span>
          )}
        </div>
        
        <h4 className="font-instrument font-medium text-ink truncate text-sm mb-1.5 leading-tight">
          {challenge.personalized_title}
        </h4>

        {isCompleted && challenge.completion_note && (
          <p className="font-instrument text-xs text-dusk/70 italic line-clamp-1 border-l-2 border-moss/20 pl-2">
            "{challenge.completion_note}"
          </p>
        )}
      </div>

      {isCompleted && challenge.completion_photo_url && (
        <div className="flex-shrink-0 w-10 h-10 bg-sand/20 rounded-lg overflow-hidden flex items-center justify-center text-xs">
          {/* Mock thumbnail */}
          📷
        </div>
      )}
    </div>
  );
}
