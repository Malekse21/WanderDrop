-- 004_daily_challenges.sql
-- Adds the Daily Challenges and XP Unlock system infrastructure

-- Add new columns to existing tables
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gem_access_tier integer DEFAULT 0 NOT NULL;
ALTER TABLE public.drops ADD COLUMN IF NOT EXISTS welcome_challenge text;

-- Challenge Templates
CREATE TABLE public.challenge_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('food', 'culture', 'social', 'nature', 'night', 'exploration')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward integer NOT NULL,
  time_of_day_affinity text NOT NULL CHECK (time_of_day_affinity IN ('morning', 'afternoon', 'evening', 'any')),
  trait_affinity text NOT NULL CHECK (trait_affinity IN ('chaos', 'connection', 'culture', 'sensation', 'foodie', 'night_owl')),
  active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Challenges (Assigned to users)
CREATE TABLE public.daily_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id uuid REFERENCES public.challenge_templates(id) ON DELETE CASCADE NOT NULL,
  date_assigned date NOT NULL,
  city text NOT NULL,
  personalized_title text NOT NULL,
  personalized_description text NOT NULL,
  xp_reward integer NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at timestamp with time zone,
  completion_note text,
  completion_photo_url text,
  mood_rating integer CHECK (mood_rating >= 1 AND mood_rating <= 5),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date_assigned)
);

-- Challenge Streaks
CREATE TABLE public.challenge_streaks (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak integer DEFAULT 0 NOT NULL,
  longest_streak integer DEFAULT 0 NOT NULL,
  last_completed_date date,
  total_completed integer DEFAULT 0 NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Challenge Unlocks
CREATE TABLE public.challenge_unlocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unlock_tier integer NOT NULL CHECK (unlock_tier IN (1, 2, 3)),
  unlocked_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, unlock_tier)
);

-- XP Log
CREATE TABLE public.xp_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL,
  reference_id uuid,  -- Can point to a daily_challenge_id, a gem_id, etc.
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Seed Data for Challenge Templates
INSERT INTO public.challenge_templates (title, description, category, difficulty, xp_reward, time_of_day_affinity, trait_affinity) VALUES
('The Unspoken Story', 'Find a street musician and learn one thing about their story.', 'social', 'medium', 100, 'morning', 'connection'),
('Menu Roulette', 'Eat something you cannot identify on the menu at a local eatery.', 'food', 'medium', 120, 'any', 'chaos'),
('Time Traveler', 'Ask a local elder what this neighborhood was called 20 years ago.', 'culture', 'hard', 200, 'afternoon', 'culture'),
('The Silent Observer', 'Find the best view nobody talks about. Photograph it but do not share the location.', 'exploration', 'medium', 150, 'evening', 'chaos'),
('Language of Gestures', 'Have a full conversation with someone using only gestures and expressions.', 'social', 'hard', 250, 'any', 'connection'),
('Doorways to History', 'Find a door that looks like it has a story. Photograph it.', 'culture', 'easy', 50, 'morning', 'culture'),
('Dime Dining', 'Order the cheapest thing on the menu at the most local place you can find.', 'food', 'easy', 80, 'any', 'foodie'),
('Digital Detox', 'Stay completely off your phone for two hours and document what you notice instead.', 'exploration', 'hard', 300, 'any', 'chaos'),
('Sunrise Stretch', 'Find an elevated public spot and watch the sunrise while stretching.', 'nature', 'medium', 120, 'morning', 'sensation'),
('Midnight Snack', 'Find a 24-hour food stall and ask the vendor what their favorite item is.', 'night', 'medium', 150, 'night', 'night_owl'),
('The Texture Walk', 'Find three different natural textures in an urban environment.', 'nature', 'easy', 60, 'afternoon', 'sensation'),
('Local Caffeine', 'Drink a coffee or tea prepared in the most traditional local method.', 'food', 'easy', 70, 'morning', 'foodie'),
('Echoes of the Past', 'Find a plaque entirely in the local language and try to translate it using context.', 'culture', 'easy', 60, 'any', 'culture'),
('The Art of Bartering', 'Successfully haggle for a small trinket or piece of fruit at a market.', 'social', 'medium', 130, 'morning', 'connection'),
('Neon Glow', 'Take a walk after dark and photograph the most interesting neon sign you see.', 'night', 'easy', 50, 'night', 'night_owl'),
('Lost in the Maze', 'Take 5 left turns and 5 right turns in a dense neighborhood and see where you end up. Have a drink there.', 'exploration', 'medium', 140, 'afternoon', 'chaos'),
('Spicy Challenge', 'Ask a waiter for something "spicy the way locals eat it".', 'food', 'hard', 200, 'evening', 'foodie'),
('Public Solitude', 'Find a busy plaza and sit quietly observing people for 20 uninterrupted minutes.', 'sensation', 'medium', 110, 'afternoon', 'sensation'),
('The Hidden Green', 'Find a public park or garden that doesn''t show up prominently on the map.', 'nature', 'medium', 120, 'any', 'exploration'),
('Architectural Anomaly', 'Find a building that looks completely out of place compared to its neighbors.', 'culture', 'medium', 100, 'any', 'culture'),
('Night Markets', 'Visit a market or gathering that only happens after the sun goes down.', 'night', 'hard', 220, 'night', 'night_owl'),
('Street Art Safari', 'Find a piece of street art or graffiti and write a short interpretation of its meaning.', 'exploration', 'easy', 60, 'any', 'chaos'),
('The First Hello', 'Be the first to say a greeting in the local language to 3 strangers today.', 'social', 'medium', 100, 'morning', 'connection'),
('Botanical Hunt', 'Find a type of flower or plant you''ve never seen in your home country.', 'nature', 'easy', 50, 'morning', 'sensation'),
('Soundscape Recording', 'Close your eyes at a busy intersection and identify 5 distinct sounds.', 'sensation', 'easy', 70, 'evening', 'sensation'),
('Ancestral Flavors', 'Find a dish that has been cooked the same way for at least 100 years.', 'food', 'hard', 200, 'evening', 'foodie'),
('The Local Read', 'Go to a local bookstore or newsstand and buy any printed item in the native language.', 'culture', 'easy', 50, 'afternoon', 'culture'),
('Shadow Play', 'Photograph an interesting shadow cast by architecture during golden hour.', 'exploration', 'easy', 80, 'evening', 'chaos'),
('Midnight Echoes', 'Stand in a completely empty street at midnight and listen to the silence.', 'night', 'medium', 140, 'night', 'night_owl'),
('The Stray Friend', 'Safely feed or respectfully photograph a local stray cat or dog.', 'nature', 'easy', 60, 'any', 'connection');

-- Postgres Functions

-- Function: update_streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id uuid, p_completion_date date)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak record;
  v_is_yesterday boolean;
  v_is_today boolean;
BEGIN
  -- Insert a default record if it doesn't exist
  INSERT INTO public.challenge_streaks (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Fetch current streak data
  SELECT * INTO v_streak FROM public.challenge_streaks WHERE user_id = p_user_id;
  
  v_is_yesterday := (v_streak.last_completed_date = (p_completion_date - INTERVAL '1 day')::date);
  v_is_today := (v_streak.last_completed_date = p_completion_date);
  
  -- If they already completed one today, don't increment streak again
  IF v_is_today THEN
    RETURN;
  END IF;
  
  -- Update streak counts
  IF v_is_yesterday THEN
    -- Continue streak
    UPDATE public.challenge_streaks
    SET 
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_completed_date = p_completion_date,
      total_completed = total_completed + 1,
      updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id;
  ELSE
    -- Reset streak but increment total
    UPDATE public.challenge_streaks
    SET 
      current_streak = 1,
      longest_streak = GREATEST(longest_streak, 1),
      last_completed_date = p_completion_date,
      total_completed = total_completed + 1,
      updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Function: award_xp
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid, 
  p_amount integer, 
  p_source text, 
  p_reference_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_xp integer;
  v_new_xp integer;
  v_current_tier integer;
  v_new_tier integer := 0;
  v_tier_unlocked boolean := false;
BEGIN
  -- Insert into xp log
  INSERT INTO public.xp_log (user_id, amount, source, reference_id)
  VALUES (p_user_id, p_amount, p_source, p_reference_id);
  
  -- Fetch current xp and tier
  SELECT wanderer_xp, gem_access_tier INTO v_current_xp, v_current_tier
  FROM public.profiles
  WHERE id = p_user_id;
  
  v_new_xp := COALESCE(v_current_xp, 0) + p_amount;
  
  -- Determine new tier
  IF v_new_xp >= 3000 THEN
    v_new_tier := 3;
  ELSIF v_new_xp >= 1500 THEN
    v_new_tier := 2;
  ELSIF v_new_xp >= 500 THEN
    v_new_tier := 1;
  ELSE
    v_new_tier := 0;
  END IF;
  
  -- Check if tier actually increased
  IF v_new_tier > COALESCE(v_current_tier, 0) THEN
    v_tier_unlocked := true;
    
    -- Log the highest tier unlock (could technically skip a tier, we just log highest)
    INSERT INTO public.challenge_unlocks (user_id, unlock_tier)
    VALUES (p_user_id, v_new_tier)
    ON CONFLICT (user_id, unlock_tier) DO NOTHING;
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET 
    wanderer_xp = v_new_xp,
    gem_access_tier = GREATEST(COALESCE(gem_access_tier, 0), v_new_tier)
  WHERE id = p_user_id;
  
  RETURN json_build_object(
    'new_xp', v_new_xp,
    'tier_unlocked', v_tier_unlocked,
    'new_tier', v_new_tier
  );
END;
$$;

-- RLS Policies
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Challenge templates are readable by everyone" ON public.challenge_templates FOR SELECT USING (true);
CREATE POLICY "Users can insert their own assigned daily challenges" ON public.daily_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own daily challenges" ON public.daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own daily challenges" ON public.daily_challenges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" ON public.challenge_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own streaks" ON public.challenge_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own unlocks" ON public.challenge_unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own xp log" ON public.xp_log FOR SELECT USING (auth.uid() = user_id);
