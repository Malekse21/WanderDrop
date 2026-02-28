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

    // ── Get drop_id and user_id from body ──
    const body = await req.json();
    const { drop_id, user_id } = body;

    if (!drop_id || !user_id) {
      return new Response(
        JSON.stringify({ error: "drop_id and user_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user_id matches the JWT
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Fetch the drop ──
    const { data: drop, error: dropError } = await supabase
      .from("drops")
      .select("*")
      .eq("id", drop_id)
      .eq("user_id", user_id)
      .single();

    if (dropError || !drop) {
      return new Response(
        JSON.stringify({ error: "Drop not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Check if time has passed ──
    const now = new Date();
    const revealAt = new Date(drop.reveal_at);

    if (now < revealAt) {
      const hoursRemaining = Math.ceil(
        (revealAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      );
      return new Response(
        JSON.stringify({
          error: `Too early! ${hoursRemaining} hour(s) remaining until reveal.`,
          hours_remaining: hoursRemaining,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Update status to revealed ──
    const { error: updateError } = await supabase
      .from("drops")
      .update({
        status: "revealed",
        revealed_at: now.toISOString(),
      })
      .eq("id", drop_id);

    if (updateError) {
      throw updateError;
    }

    // ── Return the full destination data ──
    return new Response(
      JSON.stringify({
        destination_city: drop.destination_city,
        destination_country: drop.destination_country,
        airport_code: drop.airport_code,
        ai_reasoning: drop.ai_reasoning,
        itinerary: drop.itinerary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("reveal-drop error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
