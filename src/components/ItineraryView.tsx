import { motion } from 'framer-motion';
import type { ItineraryDay, TimeSlot } from '../types';

interface ItineraryViewProps {
  itinerary: ItineraryDay[];
}

const timeLabels: Record<string, { label: string; emoji: string }> = {
  morning: { label: 'Morning', emoji: '🌅' },
  afternoon: { label: 'Afternoon', emoji: '☀️' },
  evening: { label: 'Evening', emoji: '🌙' },
};

function SlotCard({ slot, index }: { slot: TimeSlot; index: number }) {
  const timeInfo = timeLabels[slot.time] || { label: slot.time, emoji: '⏰' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
      className="bg-cream rounded-2xl p-4 shadow-warm-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-instrument font-semibold text-dusk bg-parchment px-2.5 py-1 rounded-full">
          {timeInfo.emoji} {timeInfo.label}
        </span>
        {slot.type === 'local_gem' ? (
          <span className="inline-flex items-center gap-1 text-xs font-instrument font-semibold text-moss bg-moss/10 px-2.5 py-1 rounded-full">
            Local Gem 💎
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-instrument font-semibold text-dusk bg-sand/60 px-2.5 py-1 rounded-full">
            📍 Highlight
          </span>
        )}
      </div>

      <h4 className="font-instrument font-semibold text-ink text-base mb-1">
        {slot.title}
      </h4>
      <p className="font-instrument text-dusk text-sm leading-relaxed mb-2">
        {slot.description}
      </p>
      <div className="flex items-center gap-3 text-xs font-instrument text-dusk/70">
        <span>⏱ {slot.duration}</span>
        <span>💰 {slot.cost}</span>
      </div>
    </motion.div>
  );
}

export default function ItineraryView({ itinerary }: ItineraryViewProps) {
  return (
    <div className="space-y-8 mt-6">
      {itinerary.map((day, dayIndex) => (
        <motion.div
          key={day.day}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: dayIndex * 0.15,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          <div className="flex items-baseline gap-3 mb-4">
            <span className="heading text-3xl text-clay">Day {day.day}</span>
            <span className="font-instrument text-sm text-dusk italic">
              {day.theme}
            </span>
          </div>

          <div className="space-y-3">
            {day.slots.map((slot, slotIndex) => (
              <SlotCard
                key={`${day.day}-${slot.time}`}
                slot={slot}
                index={dayIndex * 3 + slotIndex}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
