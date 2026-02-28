import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Not authorized');

    const { challenge_id, completion_note, photo_url, mood_rating } = await req.json();
    if (!challenge_id) throw new Error('Missing challenge_id');

    // 1. Verify challenge belongs to user and is pending
    const { data: challenge, error: challengeError } = await supabaseClient
      .from('daily_challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (challengeError || !challenge) {
      throw new Error('Challenge not found or already completed/skipped');
    }

    // 2. Update challenge to completed
    const completionDate = new Date().toISOString();
    const { error: updateError } = await supabaseClient
      .from('daily_challenges')
      .update({
        status: 'completed',
        completed_at: completionDate,
        completion_note: completion_note || null,
        completion_photo_url: photo_url || null,
        mood_rating: mood_rating || null
      })
      .eq('id', challenge_id);

    if (updateError) throw updateError;

    // 3. Call award_xp Postgres function
    // award_xp(p_user_id, p_amount, p_source, p_reference_id)
    const { data: xpData, error: xpError } = await supabaseClient.rpc('award_xp', {
      p_user_id: user.id,
      p_amount: challenge.xp_reward,
      p_source: 'challenge_complete',
      p_reference_id: challenge_id
    });

    if (xpError) throw xpError;

    // 4. Call update_streak Postgres function
    // Postgres Date format: 'YYYY-MM-DD'
    const todayStr = completionDate.split('T')[0];
    const { error: streakError } = await supabaseClient.rpc('update_streak', {
      p_user_id: user.id,
      p_completion_date: todayStr
    });

    if (streakError) throw streakError;

    // Fetch the updated streak count
    const { data: streakRow } = await supabaseClient
      .from('challenge_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .single();

    const currentStreak = streakRow?.current_streak || 1;
    const isStreakMilestone = currentStreak > 0 && currentStreak % 7 === 0;

    return new Response(
      JSON.stringify({
        new_xp: xpData.new_xp,
        new_tier: xpData.new_tier,
        tier_unlocked: xpData.tier_unlocked,
        new_streak: currentStreak,
        streak_milestone: isStreakMilestone
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('complete-challenge error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
