'use client';

import { useEffect, useState } from 'react';
import { Campaign, readCampaign, campaignAlreadyUsed } from '@/lib/campaign';
import { supabase } from '@/lib/supabase';

/**
 * Thin promo strip shown when a marketing campaign (e.g. ?tarjous=siivous30)
 * is active. Reads from localStorage on mount (avoids hydration mismatch) and
 * hides itself for accounts that have already redeemed the offer (one-time).
 */
export default function CampaignBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const c = readCampaign();
    if (!c) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (cancelled) return;
      if (user && (await campaignAlreadyUsed(supabase, user.id, c.code))) return;
      if (!cancelled) setCampaign(c);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!campaign) return null;

  return (
    <div className="bg-fixla-600 px-5 py-2 text-center text-sm font-semibold text-white">
      🎉 {campaign.label} — etu lisätään automaattisesti kassalla
    </div>
  );
}
