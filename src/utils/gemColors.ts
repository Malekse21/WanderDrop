import type { GemType } from '../types';

export const getGemTypeColor = (type: GemType): string => {
  switch (type) {
    case 'food':
      return 'bg-clay text-cream';
    case 'stay':
      return 'bg-moss text-cream';
    case 'nature':
      return 'bg-moss text-cream'; // Using moss as sage
    case 'culture':
      return 'bg-sand text-ink';
    case 'night':
      return 'bg-ink text-sand';
    case 'vibe':
      return 'bg-terracotta text-cream';
    case 'secret':
      return 'bg-clay text-cream';
    default:
      return 'bg-parchment text-ink';
  }
};

export const getGemTypeEmoji = (type: GemType): string => {
  switch (type) {
    case 'food': return '🍽️';
    case 'stay': return '🛏️';
    case 'nature': return '🌿';
    case 'culture': return '🏛️';
    case 'night': return '🌙';
    case 'vibe': return '✨';
    case 'secret': return '🔒';
    default: return '💎';
  }
};
