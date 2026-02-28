-- Add columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN is_discoverable boolean DEFAULT true NOT NULL,
  ADD COLUMN match_notification boolean DEFAULT true NOT NULL,
  ADD COLUMN profile_tagline text CHECK (char_length(profile_tagline) <= 60);

-- Create wanderer_profiles table
CREATE TABLE public.wanderer_profiles (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  chaos_score integer DEFAULT 0 NOT NULL CHECK (chaos_score >= 0 AND chaos_score <= 100),
  connection_score integer DEFAULT 0 NOT NULL CHECK (connection_score >= 0 AND connection_score <= 100),
  culture_score integer DEFAULT 0 NOT NULL CHECK (culture_score >= 0 AND culture_score <= 100),
  sensation_score integer DEFAULT 0 NOT NULL CHECK (sensation_score >= 0 AND sensation_score <= 100),
  foodie_depth_score integer DEFAULT 0 NOT NULL CHECK (foodie_depth_score >= 0 AND foodie_depth_score <= 100),
  night_owl_score integer DEFAULT 0 NOT NULL CHECK (night_owl_score >= 0 AND night_owl_score <= 100),
  archetype text,
  archetype_description text,
  total_activity_count integer DEFAULT 0 NOT NULL,
  last_calculated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create companion_matches table
CREATE TABLE public.companion_matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  matched_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  compatibility_score integer NOT NULL CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  compatibility_blurb text,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(requester_id, matched_user_id)
);

-- Create profile_shares table
CREATE TABLE public.profile_shares (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  share_token text UNIQUE NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.wanderer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_shares ENABLE ROW LEVEL SECURITY;

-- Wanderer Profiles RLS: Read/Update own
CREATE POLICY "Users view own wanderer profile" ON public.wanderer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own wanderer profile" ON public.wanderer_profiles
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users insert own wanderer profile" ON public.wanderer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Companion Matches RLS: Read if involved, insert if requester
CREATE POLICY "Users view involved matches" ON public.companion_matches
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users create requests" ON public.companion_matches
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users update involved matches" ON public.companion_matches
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = matched_user_id);

-- Profile Shares RLS: Anyone can read, users manage own
CREATE POLICY "Anyone can read shared profiles" ON public.profile_shares
  FOR SELECT USING (true);

CREATE POLICY "Users manage own shares" ON public.profile_shares
  FOR ALL USING (auth.uid() = user_id);

-- Function: Compatibility Score Calculation
CREATE OR REPLACE FUNCTION calculate_compatibility(profile_a public.wanderer_profiles, profile_b public.wanderer_profiles)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  chaos_diff integer;
  connection_diff integer;
  night_owl_diff integer;
  culture_diff integer;
  foodie_diff integer;
  
  tension_score integer := 0;
  similarity_score integer := 0;
  total_score integer := 0;
BEGIN
  -- Tension axes (Chaos, Connection, Night Owl) - Reward difference of 30-60 points
  chaos_diff := abs(profile_a.chaos_score - profile_b.chaos_score);
  IF chaos_diff >= 30 AND chaos_diff <= 60 THEN tension_score := tension_score + 100;
  ELSIF chaos_diff > 60 THEN tension_score := tension_score + 50; -- Too different
  ELSE tension_score := tension_score + 30; END IF; -- Too similar

  connection_diff := abs(profile_a.connection_score - profile_b.connection_score);
  IF connection_diff >= 30 AND connection_diff <= 60 THEN tension_score := tension_score + 100;
  ELSIF connection_diff > 60 THEN tension_score := tension_score + 50;
  ELSE tension_score := tension_score + 30; END IF;

  night_owl_diff := abs(profile_a.night_owl_score - profile_b.night_owl_score);
  IF night_owl_diff >= 30 AND night_owl_diff <= 60 THEN tension_score := tension_score + 100;
  ELSIF night_owl_diff > 60 THEN tension_score := tension_score + 50;
  ELSE tension_score := tension_score + 30; END IF;

  -- Similarity axes (Culture, Foodie, Sensation) - Reward similarity
  culture_diff := abs(profile_a.culture_score - profile_b.culture_score);
  similarity_score := similarity_score + (100 - (culture_diff * 1.5));

  foodie_diff := abs(profile_a.foodie_depth_score - profile_b.foodie_depth_score);
  similarity_score := similarity_score + (100 - (foodie_diff * 1.5));
  
  -- Calculate weighted average (3 tension axes, 2 similarity axes)
  total_score := (tension_score + similarity_score) / 5;
  
  -- Clamp between 0 and 100
  IF total_score < 0 THEN return 0; END IF;
  IF total_score > 100 THEN return 100; END IF;
  
  RETURN total_score;
END;
$$;
