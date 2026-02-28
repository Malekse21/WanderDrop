import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

serve(async () => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch all active gems
    const { data: gems, error: fetchError } = await supabaseAdmin
      .from("gems")
      .select("id, author_id, visit_count, verification_count, created_at, status")
      .neq("status", "retired");

    if (fetchError) throw fetchError;
    if (!gems || gems.length === 0) return new Response("No gems to process");

    const nowStr = new Date().toISOString();
    let updatedCount = 0;

    for (const gem of gems) {
      // Calculate days since posting
      const daysSincePosting = Math.max(
        0,
        Math.floor((new Date(nowStr).getTime() - new Date(gem.created_at).getTime()) / (1000 * 60 * 60 * 24))
      );

      // Score formula
      // 100 - (visits * 0.8)[max 40] - (days * 0.3)[max 15] + (verifications * 3)[max 12]
      const visitPenalty = Math.min(40, gem.visit_count * 0.8);
      const timePenalty = Math.min(15, daysSincePosting * 0.3);
      const verificationBonus = Math.min(12, gem.verification_count * 3);

      let newScore = Math.floor(100 - visitPenalty - timePenalty + verificationBonus);
      if (newScore < 0) newScore = 0;
      if (newScore > 100) newScore = 100;

      // Determine new crowd level
      let newCrowdLevel = "secret";
      if (newScore < 30) newCrowdLevel = "crowded";
      else if (newScore < 55) newCrowdLevel = "getting_known";
      else if (newScore < 75) newCrowdLevel = "quiet";

      // Determine new status
      let newStatus = gem.status;
      if (newScore < 20) {
        newStatus = "retired";
      } else if (newScore < 55 && gem.status === "verified") {
        newStatus = "getting_crowded";
      }

      // Update gem
      const { error: updateError } = await supabaseAdmin
        .from("gems")
        .update({
          authenticity_score: newScore,
          crowd_level: newCrowdLevel,
          status: newStatus,
        })
        .eq("id", gem.id);

      if (updateError) {
        console.error(`Failed to update gem ${gem.id}:`, updateError);
        continue;
      }

      // Award coins to author (equal to verification count)
      if (gem.verification_count > 0) {
        await supabaseAdmin.rpc("increment_gem_coins", {
          user_id_val: gem.author_id,
          amount: gem.verification_count,
        });
      }

      updatedCount++;
    }

    return new Response(JSON.stringify({ success: true, updatedCount }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
