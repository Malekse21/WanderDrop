import { motion } from 'framer-motion';
import type { Gem } from '../types';
import AuthenticityBadge from './AuthenticityBadge';
import { getGemTypeColor, getGemTypeEmoji } from '../utils/gemColors';
import { useSaveGem } from '../hooks/useSaveGem';

interface GemCardProps {
  gem: Gem;
  fullWidth?: boolean;
  onClick: (gem: Gem) => void;
  onVerify?: (gem: Gem) => void;
}

export default function GemCard({ gem, fullWidth = false, onClick, onVerify }: GemCardProps) {
  const { isSaved, toggleSave } = useSaveGem(gem.id);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(gem)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-cream rounded-3xl overflow-hidden shadow-warm cursor-pointer border border-sand/30 flex flex-col relative"
    >
      {/* Animated warning bar for getting crowded */}
      {(gem.status === 'getting_crowded' || gem.crowd_level === 'crowded') && (
        <div className="bg-terracotta text-cream text-[10px] font-instrument font-bold uppercase tracking-wider text-center py-1 animate-pulse">
          Getting Crowded — Visit Soon
        </div>
      )}

      {/* Image / Gradient header */}
      <div className={`relative w-full ${fullWidth ? 'h-48' : 'h-36'} bg-parchment flex items-center justify-center`}>
        {gem.photos && gem.photos.length > 0 ? (
          <img src={gem.photos[0]} alt={gem.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`absolute inset-0 opacity-80 ${getGemTypeColor(gem.gem_type)}`} />
        )}
        
        {(!gem.photos || gem.photos.length === 0) && (
          <span className="text-5xl relative z-10">{getGemTypeEmoji(gem.gem_type)}</span>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-instrument font-medium shadow-warm-sm capitalize ${getGemTypeColor(gem.gem_type)}`}>
            {gem.gem_type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <AuthenticityBadge score={gem.authenticity_score} />
        </div>
        <div className="absolute bottom-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave();
            }}
            className="w-8 h-8 rounded-full bg-cream/90 backdrop-blur-sm flex items-center justify-center shadow-warm-sm hover:scale-110 active:scale-95 transition-all text-ink"
          >
            {isSaved ? '📌' : '🔖'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="heading text-xl text-ink leading-tight mb-1">{gem.title}</h3>
        
        {gem.ai_summary && (
          <p className="font-instrument text-dusk text-sm leading-snug mb-3 flex-1 line-clamp-3">
            {gem.ai_summary}
          </p>
        )}

        {/* Tags horizontal scroll */}
        {gem.ai_tags && gem.ai_tags.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide mb-2">
            {gem.ai_tags.map((tag, i) => (
              <span key={i} className="whitespace-nowrap px-2 py-0.5 rounded-md bg-parchment border border-sand/50 text-dusk text-[10px] font-instrument uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between text-xs font-instrument text-dusk/70 border-t border-sand/30">
          <span>📍 {gem.city}</span>
          {gem.best_time && <span className="truncate max-w-[50%]">⏱️ {gem.best_time}</span>}
        </div>

        {fullWidth && (
          <div className="mt-3 pt-3 border-t border-sand/30 flex items-center justify-between">
            <span className="font-instrument text-xs text-dusk font-medium flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sand inline-block"></span>
              @{gem.author_id}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onVerify?.(gem); }}
              className="px-3 py-1.5 rounded-lg bg-clay text-cream font-instrument text-xs font-bold shadow-warm-sm"
            >
              Verify
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
