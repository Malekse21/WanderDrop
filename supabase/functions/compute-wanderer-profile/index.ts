import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get Auth user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");
    const userId = user.id;

    // 1. Gather User Activity Signals
    const [dropsRes, savedGemsRes, postedGemsRes, verificationsRes, profileRes] = await Promise.all([
      supabaseClient.from("drops").select("climate_preferences, travel_style, budget_max").eq("user_id", userId),
      supabaseClient.from("gem_saves").select("gems(gem_type)").eq("user_id", userId),
      supabaseClient.from("gems").select("gem_type, description").eq("user_id", userId),
      supabaseClient.from("gem_verifications").select("rating, still_hidden, note").eq("user_id", userId),
      supabaseClient.from("profiles").select("profile_tagline").eq("id", userId).single()
    ]);

    const activityCount =
      (dropsRes.data?.length || 0) +
      (savedGemsRes.data?.length || 0) +
      (postedGemsRes.data?.length || 0) +
      (verificationsRes.data?.length || 0);

    // 2. Return building status if insufficient data
    if (activityCount < 3) {
      return new Response(JSON.stringify({ status: "building", activityCount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Prepare payload for Groq
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) throw new Error("Missing GROQ_API_KEY");

    const signalsPayload = JSON.stringify({
      drops: dropsRes.data,
      saved_gems: savedGemsRes.data,
      posted_gems: postedGemsRes.data,
      verifications: verificationsRes.data,
      tagline: profileRes.data?.profile_tagline
    });

    const prompt = `Analyze this traveler's app activity data to build their psychological "Wanderer Profile". 
User Data payload: ${signalsPayload}

Generate:
1. Six trait scores (integer 0-100). Scores MUST be highly differentiated and polarized based on the data. Do NOT average them out to 50. 
   - chaos_score (0=structured planner, 100=pure spontaneity/chaos)
   - connection_score (0=solo lone wolf, 100=pack animal/social butterfly)
   - culture_score (0=nature only, 100=museums and ruins only)
   - sensation_score (0=slow/calm comfort, 100=extreme adrenaline)
   - foodie_depth_score (0=eats to survive, 100=travels entirely for local underground eats)
   - night_owl_score (0=dawn hiker, 100=techno club until sunrise)
2. An "archetype" selected exactly from this list: The Lone Wolf, The Culture Vulture, The Chaos Tourist, The Slow Traveler, The Midnight Roamer, The Hidden Gem Hunter, The Social Butterfly, The Comfort Seeker.
3. An "archetype_description" (2 sentences, written in second-person "You...", slightly poetic, capturing their soul).
4. A "profile_tagline" (1 short sentence, max 60 chars) if the user data didn't provide one.

Output strictly as a JSON object with these keys: chaos_score, connection_score, culture_score, sensation_score, foodie_depth_score, night_owl_score, archetype, archetype_description, profile_tagline. No markdown.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) throw new Error("Groq API failed");

    const groqData = await groqResponse.json();
    const profileData = JSON.parse(groqData.choices[0].message.content);

    // 4. Upsert into Supabase
    // Using service role solely to guarantee upsert ignoring potential RLS collisions during concurrent debounced fires
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: upsertError } = await supabaseAdmin
      .from("wanderer_profiles")
      .upsert({
        user_id: userId,
        chaos_score: profileData.chaos_score,
        connection_score: profileData.connection_score,
        culture_score: profileData.culture_score,
        sensation_score: profileData.sensation_score,
        foodie_depth_score: profileData.foodie_depth_score,
        night_owl_score: profileData.night_owl_score,
        archetype: profileData.archetype,
        archetype_description: profileData.archetype_description,
        total_activity_count: activityCount,
        last_calculated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) throw upsertError;
    
    // Update tagline in profiles if generated
    if (profileData.profile_tagline && !profileRes.data?.profile_tagline) {
        await supabaseAdmin.from("profiles").update({ profile_tagline: profileData.profile_tagline }).eq('id', userId);
    }

    return new Response(JSON.stringify({ status: "complete", profile: profileData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
