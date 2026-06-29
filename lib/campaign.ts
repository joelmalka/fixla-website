/**
 * Marketing campaigns activated via a deep link, e.g. /?tarjous=siivous30.
 *
 * The campaign token is captured on the landing page, stored in localStorage,
 * and the discount auto-applies at checkout for the matching service — the
 * customer never types a promo code. The campaign's `code` is recorded on the
 * order (via payment metadata) so campaign orders are trackable.
 */

export interface Campaign {
  /** URL token used in ?tarjous=<token> */
  token: string;
  /** Promo code recorded on the order for tracking/reporting */
  code: string;
  /** Service slug the discount applies to (see lib/services.ts) */
  serviceSlug: string;
  /** Percentage off the subtotal (0–100) */
  percent: number;
  /** Short Finnish label shown in banners */
  label: string;
}

export const CAMPAIGNS: Record<string, Campaign> = {
  siivous30: {
    token: 'siivous30',
    code: 'SIIVOUS30',
    serviceSlug: 'siivous',
    percent: 30,
    label: '30 % alennus siivouksesta',
  },
};

const KEY = 'fixla.campaign';

/** Store the campaign for a given ?tarjous= token (if it's a known campaign). */
export function activateCampaignFromToken(token: string | null | undefined): Campaign | null {
  if (!token) return null;
  const c = CAMPAIGNS[token.trim().toLowerCase()];
  if (!c) return null;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, c.token);
    } catch {
      /* ignore */
    }
  }
  return c;
}

/** The campaign currently active on this device, if any. */
export function readCampaign(): Campaign | null {
  if (typeof window === 'undefined') return null;
  try {
    const t = window.localStorage.getItem(KEY);
    return t ? CAMPAIGNS[t] ?? null : null;
  } catch {
    return null;
  }
}

export function clearCampaign(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** The active campaign IF it applies to the given service slug. */
export function campaignForService(slug: string | undefined | null): Campaign | null {
  const c = readCampaign();
  if (!c || !slug) return null;
  return c.serviceSlug === slug ? c : null;
}

/** Discount in euros for a subtotal under the given campaign. */
export function campaignDiscount(c: Campaign, subtotal: number): number {
  return Math.round(subtotal * (c.percent / 100) * 100) / 100;
}

/**
 * One-time-per-user enforcement: true if this account already has an order
 * recorded with the campaign's promo code. RLS lets users read their own
 * orders, so this is checked client-side before the discount is applied (and
 * before the payment intent is created), tying the limit to the account.
 */
export async function campaignAlreadyUsed(
  supabase: { from: (t: string) => any },
  userId: string,
  code: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('orders')
    .select('id')
    .eq('customer_id', userId)
    .eq('promo_code', code)
    .limit(1);
  return Array.isArray(data) && data.length > 0;
}
