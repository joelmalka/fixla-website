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
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fixla-600 text-white">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path
              fillRule="evenodd"
              d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-fixla-800">
            🎉 {campaign.label} lunastettu!
          </p>
          <p className="mt-0.5 text-sm text-fixla-700">
            Etu on käytössä tässä tilauksessa — {campaign.percent} % alennus lisätään
            automaattisesti, kun tilaat siivouksen. Aloita valitsemalla osoite alta.
          </p>
        </div>
      </div>
    </div>
  );
}
