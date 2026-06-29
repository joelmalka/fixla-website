'use client';

import { useEffect, useState } from 'react';
import { Campaign, readCampaign, campaignAlreadyUsed } from '@/lib/campaign';
import { supabase } from '@/lib/supabase';

/**
 * Prominent "offer claimed" card shown on the landing screen when the visitor
 * arrived via an ad link (e.g. ?tarjous=siivous30). Reassures them the discount
 * is locked in for this order so they don't bounce. Hidden for accounts that
 * already redeemed the offer (one-time).
 */
export default function CampaignHeroCallout() {
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
    <div className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-fixla-600/30 bg-fixla-50 p-4 text-left md:mx-0">
      <p className="text-sm font-extrabold text-fixla-800">{campaign.label} lunastettu!</p>
      <p className="mt-0.5 text-sm text-fixla-700">
        Etu on käytössä tässä tilauksessa — {campaign.percent} % alennus lisätään
        automaattisesti, kun tilaat siivouksen. Aloita valitsemalla osoite alta.
      </p>
    </div>
  );
}
