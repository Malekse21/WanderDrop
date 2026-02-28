import { motion } from 'framer-motion';

interface AuthenticityBadgeProps {
  score: number;
}

export default function AuthenticityBadge({ score }: AuthenticityBadgeProps) {
  let colorClass = '';
  let icon = '';
  let label = '';

  if (score >= 75) {
    colorClass = 'bg-moss text-cream';
    icon = '🍃';
    label = 'Hidden';
  } else if (score >= 55) {
    colorClass = 'bg-sand text-ink';
    icon = '👁️';
    label = 'Quiet';
  } else if (score >= 30) {
    colorClass = 'bg-terracotta text-cream';
    icon = '📍';
    label = 'Getting Known';
  } else {
    colorClass = 'bg-ink text-red-400';
    icon = '🔴';
    label = 'Crowded';
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-instrument font-bold uppercase tracking-wider shadow-warm-sm ${colorClass}`}
    >
      <span className="text-xs">{icon}</span>
      <span>{label}</span>
      <span className="ml-1 opacity-80">{score}</span>
    </motion.div>
  );
}
