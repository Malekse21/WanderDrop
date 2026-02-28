-- Add new columns to existing profiles table
ALTER TABLE public.profiles 
  ADD COLUMN gem_coins integer DEFAULT 0 NOT NULL,
  ADD COLUMN gems_posted integer DEFAULT 0 NOT NULL;

-- Add new columns to existing gems table
-- crowd_level enum: 'secret', 'quiet', 'getting_known', 'crowded'
-- status enum: 'unverified', 'verified', 'getting_crowded', 'retired'
ALTER TABLE public.gems
  ADD COLUMN save_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN visit_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN verification_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN crowd_level text DEFAULT 'secret' NOT NULL CHECK (crowd_level IN ('secret', 'quiet', 'getting_known', 'crowded')),
  ADD COLUMN ai_tags text[] DEFAULT '{}'::text[],
  ADD COLUMN ai_summary text,
  ADD COLUMN status text DEFAULT 'unverified' NOT NULL CHECK (status IN ('unverified', 'verified', 'getting_crowded', 'retired'));

-- Create gem_verifications table
CREATE TABLE public.gem_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gem_id uuid REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  still_hidden boolean DEFAULT true NOT NULL,
  note text,
  visited_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(gem_id, user_id)
);

-- Create gem_saves table
CREATE TABLE public.gem_saves (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gem_id uuid REFERENCES public.gems(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(gem_id, user_id)
);

-- Enable RLS
ALTER TABLE public.gem_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gem_saves ENABLE ROW LEVEL SECURITY;

-- RLS for gem_verifications
-- Users can read all verifications for non-retired gems
CREATE POLICY "Anyone can read verifications" ON public.gem_verifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.gems WHERE id = gem_id AND status != 'retired')
  );

-- Users can only insert/update/delete their own verifications
CREATE POLICY "Users manage own verifications" ON public.gem_verifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS for gem_saves
-- Users can only see and manage their own saves
CREATE POLICY "Users manage own saves" ON public.gem_saves
  FOR ALL USING (auth.uid() = user_id);

-- RPC for incrementing gem visits
CREATE OR REPLACE FUNCTION increment_gem_visits(gem_id_val uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.gems
  SET visit_count = visit_count + 1
  WHERE id = gem_id_val;
END;
$$;

-- RPC for incrementing user gem coins
CREATE OR REPLACE FUNCTION increment_gem_coins(user_id_val uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET gem_coins = gem_coins + amount
  WHERE id = user_id_val;
END;
$$;
