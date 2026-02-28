/* ── Enums ── */
export type ChallengeCategory = 'food' | 'culture' | 'social' | 'nature' | 'night' | 'exploration';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'pending' | 'completed' | 'skipped';
export type TimeOfDayAffinity = 'morning' | 'afternoon' | 'evening' | 'any';

export type GemType = 'food' | 'stay' | 'nature' | 'culture' | 'night' | 'vibe' | 'secret';
export type DropStatus = 'generating' | 'active' | 'revealed' | 'completed';
export type Currency = 'USD' | 'EUR' | 'TND';
export type Climate = 'Mediterranean' | 'Desert (Sahara)' | 'Steppe-Arid' | 'Highlands';
export type TravelStyle = 'Roman Heritage' | 'Souks & Medinas' | 'Sahara Expeditions' | 'Island Life' | 'Culinary Discovery' | 'Modern Vibe';
export type SlotType = 'local_gem' | 'tourist_highlight';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

/* ── Database Models ── */
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_discoverable: boolean;
  match_notification: boolean;
  profile_tagline: string | null;
  gem_access_tier: number;
  created_at: string;
}

export type Archetype = 
  | 'The Lone Wolf'
  | 'The Culture Vulture'
  | 'The Chaos Tourist'
  | 'The Slow Traveler'
  | 'The Midnight Roamer'
  | 'The Hidden Gem Hunter'
  | 'The Social Butterfly'
  | 'The Comfort Seeker';

export interface WandererProfile {
  user_id: string;
  chaos_score: number;
  connection_score: number;
  culture_score: number;
  sensation_score: number;
  foodie_depth_score: number;
  night_owl_score: number;
  archetype: Archetype | null;
  archetype_description: string | null;
  total_activity_count: number;
  last_calculated_at: string;
}

export interface CompanionMatch {
  id: string;
  requester_id: string;
  matched_user_id: string;
  compatibility_score: number;
  compatibility_blurb: string | null;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  
  // Joined fields for UI
  username?: string;
  archetype?: Archetype;
}

export interface ProfileShare {
  user_id: string;
  share_token: string;
  view_count: number;
  created_at: string;
}

export type CrowdLevel = 'secret' | 'quiet' | 'getting_known' | 'crowded';
export type GemStatus = 'unverified' | 'verified' | 'getting_crowded' | 'retired';

export interface Gem {
  id: string;
  author_id: string;
  title: string;
  description: string;
  gem_type: GemType;
  city: string;
  country: string;
  coordinates: { lat: number; lng: number } | null;
  photos: string[];
  best_time: string | null;
  avoid_time: string | null;
  address_hint: string | null;
  open_for_hosting: boolean;
  
  // Computed/AI fields
  authenticity_score: number;
  crowd_level: CrowdLevel;
  ai_tags: string[];
  ai_summary: string | null;
  status: GemStatus;
  
  // Counters
  save_count: number;
  visit_count: number;
  verification_count: number;
  
  created_at: string;
}

export interface GemVerification {
  id: string;
  gem_id: string;
  user_id: string;
  rating: number;
  still_hidden: boolean;
  note: string | null;
  visited_at: string;
  created_at: string;
}

export interface GemSave {
  id: string;
  gem_id: string;
  user_id: string;
  created_at: string;
}

/* ── Daily Challenges ── */
export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  xp_reward: number;
  time_of_day_affinity: TimeOfDayAffinity;
  trait_affinity: string; // Refers to the keys/axes, e.g. 'chaos', 'connection'
  active: boolean;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  user_id: string;
  template_id: string;
  date_assigned: string; // YYYY-MM-DD
  city: string;
  category?: ChallengeCategory;
  difficulty?: ChallengeDifficulty;
  personalized_title: string;
  personalized_description: string;
  xp_reward: number;
  status: ChallengeStatus;
  completed_at: string | null;
  completion_note: string | null;
  completion_photo_url: string | null;
  mood_rating: number | null; // 1-5
  created_at: string;
}

export interface ChallengeStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  total_completed: number;
  updated_at: string;
}

export interface ChallengeUnlock {
  id: string;
  user_id: string;
  unlock_tier: number;
  unlocked_at: string;
}

export interface XPLogEntry {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  reference_id: string | null;
  created_at: string;
}

/* ── Itinerary Structures ── */
export interface TimeSlot {
  time: TimeOfDay;
  title: string;
  description: string;
  duration: string;
  cost: string;
  type: SlotType;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  slots: TimeSlot[];
}

export interface Hint {
  emoji: string;
  text: string;
}

/* ── Drop (from drops_safe view) ── */
export interface Drop {
  id: string;
  user_id: string;

  /* User inputs */
  budget_min: number;
  budget_max: number;
  currency: Currency;
  duration_days: number;
  departure_date: string;
  departure_city: string;
  climate_preferences: Climate[];
  travel_style: TravelStyle[];
  excluded_countries: string[];

  /* AI outputs — null until revealed via drops_safe view */
  destination_city: string | null;
  destination_country: string | null;
  airport_code: string | null;
  itinerary: ItineraryDay[] | null;
  ai_reasoning: string | null;

  /* Always visible */
  welcome_challenge: string | null;
  hints: Hint[] | null;
  vibe_line: string | null;
  reveal_at: string | null;
  revealed_at: string | null;
  status: DropStatus;

  created_at: string;
}

/* ── Form Input ── */
export interface DropFormData {
  departure_city: string;
  departure_date: string;
  duration_days: number;
  budget_min: number;
  budget_max: number;
  currency: Currency;
  climate_preferences: Climate[];
  travel_style: TravelStyle[];
  excluded_countries: string;
}
