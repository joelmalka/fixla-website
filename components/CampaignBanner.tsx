'use client';

import { useEffect, useState } from 'react';
import { Campaign, readCampaign } from '@/lib/campaign';

/**
 * Thin promo strip shown when a marketing campaign (e.g. ?tarjous=siivous30)
 * is active. Reads from localStorage on mount to avoid hydration mismatch.
 */
export default function CampaignBanner() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    setCampaign(readCampaign());
  }, []);

  if (!campaign) return null;

  return (
    <div className="bg-fixla-600 px-5 py-2 text-center text-sm font-semibold text-white">
      🎉 {campaign.label} — etu lisätään automaattisesti kassalla
    </div>
  );
}
