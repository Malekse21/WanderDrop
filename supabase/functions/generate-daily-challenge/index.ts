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

    const { city, timezone } = await req.json();
    const targetCity = city || 'Unknown City';

    // 1. Check if challenge already exists for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingChallenge } = await supabaseClient
      .from('daily_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('date_assigned', today)
      .maybeSingle();

    if (existingChallenge) {
      return new Response(JSON.stringify({ challenge: existingChallenge }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Gather context
    // Fetch profile
    const { data: profile } = await supabaseClient
      .from('wanderer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // Determine highest trait
    let highestTrait = 'exploration';
    if (profile) {
      const traits = [
        { name: 'chaos', score: profile.chaos_score },
        { name: 'connection', score: profile.connection_score },
        { name: 'culture', score: profile.culture_score },
        { name: 'sensation', score: profile.sensation_score },
        { name: 'foodie', score: profile.foodie_depth_score },
        { name: 'night_owl', score: profile.night_owl_score },
      ];
      traits.sort((a, b) => b.score - a.score);
      highestTrait = traits[0].name;
    }

    // Fetch last 5 challenges to penalize repeat categories
    const { data: pastChallenges } = await supabaseClient
      .from('daily_challenges')
      .select('template_id, templates:challenge_templates(category)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(5);

    const recentCategories = (pastChallenges || []).map(p => p.templates?.category).filter(Boolean);

    // Fetch local time of day based on timezone
    let currentHour = new Date().getHours();
    if (timezone) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        hour12: false,
      });
      currentHour = parseInt(formatter.format(new Date()), 10);
    }

    let timeOfDay = 'night';
    if (currentHour >= 5 && currentHour < 12) timeOfDay = 'morning';
    else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'afternoon';
    else if (currentHour >= 17 && currentHour < 21) timeOfDay = 'evening';

    // Fetch all active templates
    const { data: templates } = await supabaseClient
      .from('challenge_templates')
      .select('*')
      .eq('active', true);

    if (!templates || templates.length === 0) {
      throw new Error('No active challenge templates found');
    }

    // 3. Score templates
    let topTemplate = templates[0];
    let topScore = -999;

    templates.forEach(t => {
      let score = 0;
      if (t.time_of_day_affinity === timeOfDay || t.time_of_day_affinity === 'any') score += 30;
      if (t.trait_affinity === highestTrait) score += 20;
      
      const recentCategoryCount = recentCategories.filter(c => c === t.category).length;
      score -= (recentCategoryCount * 15);
      
      if (t.difficulty === 'medium') score += 10;
      
      // small random factor to break ties
      score += Math.random() * 5;

      if (score > topScore) {
        topScore = score;
        topTemplate = t;
      }
    });

    // 4. Hit Groq to rewrite to match city
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) throw new Error('Missing GROQ_API_KEY');

    const prompt = `
You are a creative travel AI. Your task is to personalize a daily challenge template for a user currently in: ${targetCity}.
The user's archetype is: ${profile?.archetype || 'The Curious Explorer'}.
Template Title: "${topTemplate.title}"
Template Description: "${topTemplate.description}"

Rewrite this challenge so it feels specific to ${targetCity}. Reference real characteristics, culture, or general vibes of ${targetCity} without being generic.
Preserve the spirit and difficulty of the original template.
Write the description in the second person present tense.
IMPORTANT: The description MUST NOT be longer than 40 words.

Return ONLY a valid JSON object with EXACTLY two string keys: "personalized_title" and "personalized_description". No markdown wrapping.
`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
    });

    if (!groqRes.ok) {
      console.error('Groq failure', await groqRes.text());
      throw new Error('Failed to generate personalized challenge payload');
    }

    const groqData = await groqRes.json();
    const customized = JSON.parse(groqData.choices[0].message.content);

    // 5. Insert new challenge
    const { data: newChallenge, error: insertError } = await supabaseClient
      .from('daily_challenges')
      .insert({
        user_id: user.id,
        template_id: topTemplate.id,
        date_assigned: today,
        city: targetCity,
        personalized_title: customized.personalized_title,
        personalized_description: customized.personalized_description,
        xp_reward: topTemplate.xp_reward,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ challenge: newChallenge }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('generate-daily-challenge error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
