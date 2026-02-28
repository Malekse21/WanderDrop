-- ========================================
-- WanderDrop Database Schema
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enum Types ──
CREATE TYPE gem_type AS ENUM ('food', 'stay', 'nature', 'culture', 'night', 'vibe', 'secret');
CREATE TYPE drop_status AS ENUM ('generating', 'active', 'revealed', 'completed');

-- ── Profiles Table ──
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gems Table ──
CREATE TABLE IF NOT EXISTS gems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  gem_type gem_type NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  coordinates JSONB,          -- { lat, lng }
  photos TEXT[] DEFAULT '{}',
  best_time TEXT,
  authenticity_score INTEGER DEFAULT 85,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Drops Table ──
CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User input preferences
  budget_min NUMERIC NOT NULL,
  budget_max NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  duration_days INTEGER NOT NULL,
  departure_date DATE NOT NULL,
  departure_city TEXT NOT NULL,
  climate_preferences TEXT[] DEFAULT '{}',
  travel_style TEXT[] DEFAULT '{}',
  excluded_countries TEXT[] DEFAULT '{}',

  -- AI-generated outputs
  destination_city TEXT,
  destination_country TEXT,
  airport_code TEXT,
  itinerary JSONB,            -- ItineraryDay[]
  ai_reasoning TEXT,

  -- Hints & vibe
  hints JSONB,                -- Hint[] (array of { emoji, text })
  vibe_line TEXT,

  -- Reveal timing
  reveal_at TIMESTAMPTZ,
  revealed_at TIMESTAMPTZ,

  -- Status
  status drop_status NOT NULL DEFAULT 'generating',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Drops Safe View ──
-- The frontend ONLY queries this view. Destination & itinerary are null until revealed.
CREATE OR REPLACE VIEW drops_safe AS
SELECT
  id,
  user_id,
  budget_min,
  budget_max,
  currency,
  duration_days,
  departure_date,
  departure_city,
  climate_preferences,
  travel_style,
  excluded_countries,
  hints,
  vibe_line,
  reveal_at,
  revealed_at,
  status,
  created_at,
  -- Only expose sensitive fields after reveal
  CASE WHEN status IN ('revealed', 'completed') THEN destination_city ELSE NULL END AS destination_city,
  CASE WHEN status IN ('revealed', 'completed') THEN destination_country ELSE NULL END AS destination_country,
  CASE WHEN status IN ('revealed', 'completed') THEN airport_code ELSE NULL END AS airport_code,
  CASE WHEN status IN ('revealed', 'completed') THEN itinerary ELSE NULL END AS itinerary,
  CASE WHEN status IN ('revealed', 'completed') THEN ai_reasoning ELSE NULL END AS ai_reasoning
FROM drops;

-- ========================================
-- Row Level Security
-- ========================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Gems RLS
ALTER TABLE gems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gems"
  ON gems FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert gems"
  ON gems FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Drops RLS
ALTER TABLE drops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drops"
  ON drops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drops"
  ON drops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drops"
  ON drops FOR UPDATE
  USING (auth.uid() = user_id);

-- ── Auto-create profile on signup ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
