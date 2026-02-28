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

    const { gem_id } = await req.json();

    // 1. Fetch gem details
    const { data: gem, error: gemError } = await supabaseClient
      .from("gems")
      .select("title, description, gem_type, city, best_time")
      .eq("id", gem_id)
      .single();

    if (gemError || !gem) throw new Error("Gem not found");

    // 2. Call Groq to analyze the gem
    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) throw new Error("Missing GROQ_API_KEY");

    const prompt = `Analyze this user-submitted hidden gem:
Title: ${gem.title}
Type: ${gem.gem_type}
City: ${gem.city}
Best Time: ${gem.best_time}
Description: ${gem.description}

Output a strictly formatted JSON object with exactly these four keys:
- "ai_tags": Array of 3 to 5 short vibe strings (max 2 words each) capturing the feeling.
- "ai_summary": One atmospheric sentence (max 18 words) describing the experience using sensory language only, NO place names.
- "authenticity_score": Integer between 60 and 100. Lower for generic descriptions, higher for highly specific, personal details revealing deep local knowledge.
- "crowd_level": String, must be one of: "secret", "quiet", "getting_known", "crowded". Judge based on the description's tone.

Output ONLY the JSON object. No markdown, no explanations.`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqResponse.ok) throw new Error("Groq API failed");

    const groqData = await groqResponse.json();
    const content = groqData.choices[0].message.content;
    const analysis = JSON.parse(content);

    // 3. Update the gem record via service role bypass (since user may not have blanket update permission)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseAdmin
      .from("gems")
      .update({
        ai_tags: analysis.ai_tags,
        ai_summary: analysis.ai_summary,
        authenticity_score: analysis.authenticity_score,
        crowd_level: analysis.crowd_level,
      })
      .eq("id", gem_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
