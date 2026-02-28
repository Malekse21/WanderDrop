import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const groqApiKey = Deno.env.get("GROQ_API_KEY");

    if (!groqApiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create service-role client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user JWT
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Get drop_id from body ──
    const body = await req.json();
    const { drop_id } = body;
    if (!drop_id) {
      return new Response(
        JSON.stringify({ error: "drop_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Fetch the drop ──
    const { data: drop, error: dropError } = await supabase
      .from("drops")
      .select("*")
      .eq("id", drop_id)
      .eq("user_id", user.id)
      .single();

    if (dropError || !drop) {
      return new Response(
        JSON.stringify({ error: "Drop not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── GROQ CALL 1: Pick destination ──
    const destinationPrompt = `You are a bold travel advisor for adventurous Gen Z travelers. Pick an underrated, surprising destination city — NOT obvious tourist capitals like Paris, London, Rome, New York, Tokyo, or Bangkok.

Traveler preferences:
- Budget: ${drop.budget_min}–${drop.budget_max} ${drop.currency} total
- Duration: ${drop.duration_days} days
- Departing from: ${drop.departure_city}
- Climate preference: ${(drop.climate_preferences || []).join(", ") || "any"}
- Travel style: ${(drop.travel_style || []).join(", ") || "any"}
- Countries to avoid: ${(drop.excluded_countries || []).join(", ") || "none"}

Choose a city that matches these preferences. Be bold and pick underrated gems — places like Tbilisi, Oaxaca, Mostar, Chefchaouen, Luang Prabang, Porto, Medellín, Valletta, etc.

Return ONLY a valid JSON object in this exact format with no extra text:
{"destination_city": "City Name", "destination_country": "Country Name", "airport_code": "XXX"}`;

    const destinationResponse = await callGroq(groqApiKey, destinationPrompt);
    const destination = parseJSON(destinationResponse);

    if (!destination?.destination_city) {
      throw new Error("Failed to parse destination from AI response");
    }

    // ── Query local gems in that destination ──
    const { data: gems } = await supabase
      .from("gems")
      .select("title, description, gem_type, best_time")
      .eq("verified", true)
      .or(`city.ilike.%${destination.destination_city}%,country.ilike.%${destination.destination_country}%`)
      .limit(10);

    const gemsContext =
      gems && gems.length > 0
        ? `\n\nLocal gems from our community database for this destination:\n${gems.map((g: { title: string; description: string; gem_type: string; best_time: string | null }) => `- ${g.title} (${g.gem_type}): ${g.description}${g.best_time ? ` — Best time: ${g.best_time}` : ""}`).join("\n")}`
        : "";

    // ── GROQ CALL 2: Generate hints, vibe, reasoning, itinerary ──
    const itineraryPrompt = `You are generating a secret travel experience for a Gen Z traveler going to ${destination.destination_city}, ${destination.destination_country}.

Trip details:
- Duration: ${drop.duration_days} days
- Budget: ${drop.budget_min}–${drop.budget_max} ${drop.currency}
- Travel style: ${(drop.travel_style || []).join(", ") || "any"}
${gemsContext}

Generate ALL of the following in ONE JSON response:

1. "hints": An array of exactly 5 cryptic, poetic hint objects. Each hint has an "emoji" (single emoji) and "text" (a short poetic phrase that teases the destination WITHOUT naming the city or country). These should be mysterious and evocative.

2. "vibe_line": One atmospheric sentence, maximum 18 words. Use ONLY sensory language (sounds, sights, smells, textures, tastes). No place names allowed.

3. "ai_reasoning": Exactly 2 sentences explaining why this destination fits this particular traveler's preferences and style.

4. "itinerary": An array with ${drop.duration_days} day objects. Each day has:
   - "day": day number (1, 2, 3...)
   - "theme": a short thematic title for the day
   - "slots": an array of exactly 3 slot objects for morning, afternoon, and evening. Each slot has:
     - "time": "morning", "afternoon", or "evening"
     - "title": activity name (if using a local gem from the database, use its EXACT title)
     - "description": 1-2 sentence description
     - "duration": estimated time (e.g. "2 hours")
     - "cost": estimated cost with currency (e.g. "$25")
     - "type": "local_gem" if it uses a local gem from the database list above, otherwise "tourist_highlight"

Return ONLY a valid JSON object with these 4 keys. No extra text.`;

    const itineraryResponse = await callGroq(groqApiKey, itineraryPrompt);
    const generated = parseJSON(itineraryResponse);

    if (!generated?.hints || !generated?.itinerary) {
      throw new Error("Failed to parse itinerary from AI response");
    }

    // ── Calculate reveal timestamp (48 hours before departure) ──
    const departureDate = new Date(drop.departure_date + "T00:00:00Z");
    const revealAt = new Date(departureDate.getTime() - 48 * 60 * 60 * 1000);

    // ── Update the drop record ──
    const { error: updateError } = await supabase
      .from("drops")
      .update({
        destination_city: destination.destination_city,
        destination_country: destination.destination_country,
        airport_code: destination.airport_code,
        itinerary: generated.itinerary,
        ai_reasoning: generated.ai_reasoning,
        hints: generated.hints,
        vibe_line: generated.vibe_line,
        reveal_at: revealAt.toISOString(),
        status: "active",
      })
      .eq("id", drop_id);

    if (updateError) {
      throw updateError;
    }

    // ── Return ONLY safe data (hints, vibe, reveal_at) ──
    return new Response(
      JSON.stringify({
        hints: generated.hints,
        vibe_line: generated.vibe_line,
        reveal_at: revealAt.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("generate-drop error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ── Groq API Helper ──
async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a travel planning AI. You always respond with valid JSON only. No markdown, no extra text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ── Safe JSON parser ──
function parseJSON(text: string): Record<string, unknown> | null {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch {
    // Try to extract JSON from potential markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    // Try to find first { ... } block
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
