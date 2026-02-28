export function awardMockXP(amount: number, source: string, reference_id: string | null = null) {
  // 1. Update Profile XP & Tier
  let profiles: Record<string, any> = {};
  try {
    const pStr = localStorage.getItem('wanderdrop_profiles');
    profiles = pStr ? JSON.parse(pStr) : {};
  } catch (e) {
    console.error('Failed to parse profiles in mockXp', e);
  }
  const prof = (profiles && profiles['local-user']) || { wanderer_xp: 0, gem_access_tier: 0 };
  
  const oldTier = prof.gem_access_tier || 0;
  prof.wanderer_xp = (prof.wanderer_xp || 0) + amount;
  
  let newTier = 0;
  if (prof.wanderer_xp >= 3000) newTier = 3;
  else if (prof.wanderer_xp >= 1500) newTier = 2;
  else if (prof.wanderer_xp >= 500) newTier = 1;

  prof.gem_access_tier = Math.max(oldTier, newTier);
  profiles['local-user'] = prof;
  localStorage.setItem('wanderdrop_profiles', JSON.stringify(profiles));

  // 2. Append to XP Log
  let xLogs = [];
  try {
    const xLogStr = localStorage.getItem('wanderdrop_xp_log');
    const parsed = xLogStr ? JSON.parse(xLogStr) : [];
    xLogs = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse XP log', e);
  }
  xLogs.push({
    id: `xp-${Date.now()}`,
    user_id: 'local-user',
    amount,
    source,
    reference_id,
    created_at: new Date().toISOString()
  });
  localStorage.setItem('wanderdrop_xp_log', JSON.stringify(xLogs));

  // 3. Trigger Global Events
  window.dispatchEvent(new Event('challenge-update'));
  window.dispatchEvent(new Event('dashboard-update'));
  
  if (newTier > oldTier) {
    window.dispatchEvent(new CustomEvent('tier-unlocked', { detail: { newTier } }));
  }

  return {
    new_xp: prof.wanderer_xp,
    tier_unlocked: newTier > oldTier,
    new_tier: newTier
  };
}
