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
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");
    const userId = user.id;

    // Use admin client for matching search to bypass row level policies on other profiles
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Fetch requester's profile
    const { data: requesterProfile, error: pError } = await supabaseAdmin
      .from("wanderer_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (pError || !requesterProfile) throw new Error("Must have a computed profile first");

    // 2. Fetch candidates (discoverable, have profiles, not self, limit 50)
    const { data: candidates, error: cError } = await supabaseAdmin
      .from("profiles")
      .select(`
        id, 
        username,
        wanderer_profiles(*)
      `)
      .eq("is_discoverable", true)
      .neq("id", userId)
      .not("wanderer_profiles", "is", null)
      .limit(50);

    if (cError || !candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Filter candidates using Postgres capability RPC mock in JS (for the edge function map)
    const scoredCandidates = candidates.map(c => {
      const pB = c.wanderer_profiles[0];
      const pA = requesterProfile;
      
      // Mirroring the postgres logic for local JS edge function execution
      let tension = 0;
      let sim = 0;

      const cDiff = Math.abs(pA.chaos_score - pB.chaos_score);
      if (cDiff >= 30 && cDiff <= 60) tension += 100;
      else if (cDiff > 60) tension += 50;
      else tension += 30;

      const conDiff = Math.abs(pA.connection_score - pB.connection_score);
      if (conDiff >= 30 && conDiff <= 60) tension += 100;
      else if (conDiff > 60) tension += 50;
      else tension += 30;

      const nDiff = Math.abs(pA.night_owl_score - pB.night_owl_score);
      if (nDiff >= 30 && nDiff <= 60) tension += 100;
      else if (nDiff > 60) tension += 50;
      else tension += 30;

      const culDiff = Math.abs(pA.culture_score - pB.culture_score);
      sim += (100 - (culDiff * 1.5));

      const fDiff = Math.abs(pA.foodie_depth_score - pB.foodie_depth_score);
      sim += (100 - (fDiff * 1.5));

      const totalScore = Math.floor((tension + sim) / 5);
      
      return {
        matched_user_id: c.id,
        username: c.username,
        archetype: pB.archetype,
        compatibility_score: totalScore
      };
    }).filter(c => c.compatibility_score >= 60).sort((a,b) => b.compatibility_score - a.compatibility_score).slice(0, 5);

    if (scoredCandidates.length === 0) {
      return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 4. Groq call to generate clever blurbs
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) throw new Error("Missing GROQ_API_KEY");

    const prompt = `Write a short 1-sentence compatibility blurb for each pair of travel companions explaining their dynamic in a witty tone. Focus on complementary tension.
Requester: ${requesterProfile.archetype}

Candidates to pair with requester:
${scoredCandidates.map((c, i) => `[${i}] Match: ${c.archetype}, Score: ${c.compatibility_score}%`).join('\n')}

Output strictly as a JSON object with a single array key "blurbs" containing strings matching the Candidate index order.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${groqApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) throw new Error("Groq API failed");
    const groqData = await groqResponse.json();
    const blurbs = JSON.parse(groqData.choices[0].message.content).blurbs;

    // 5. Upsert into matches table
    const inserts = scoredCandidates.map((c, i) => ({
      requester_id: userId,
      matched_user_id: c.matched_user_id,
      compatibility_score: c.compatibility_score,
      compatibility_blurb: blurbs[i] || "Travel twins.",
      status: "pending"
    }));

    await supabaseAdmin.from("companion_matches")
      .upsert(inserts, { onConflict: 'requester_id,matched_user_id' });

    // Return decorated matches for frontend
    return new Response(JSON.stringify({ matches: inserts.map((ins, i) => ({ ...ins, username: scoredCandidates[i].username, archetype: scoredCandidates[i].archetype })) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
