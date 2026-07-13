/**
 * Promo codes the customer can type at checkout on the web. Percentage or
 * fixed discount, optionally scoped to a service, with an expiry and optional
 * one-time-per-account enforcement (checked against the user's order history,
 * same mechanism as campaigns — see campaignAlreadyUsed in lib/campaign.ts).
 *
 * Mirror of the mobile app's promo codes for the ones offered on both.
 */

export interface WebPromo {
  code: string;
  discountType: 'percentage' | 'fixed';
  /** Percent (0–100) for 'percentage', euros for 'fixed'. */
  discountValue: number;
  /** Service slugs the code applies to; undefined = all services. */
  serviceSlugs?: string[];
  /** ISO datetime; the code is invalid after this instant. */
  expiry?: string;
  /** If true, only usable once per account. */
  oneTimeUse?: boolean;
}

export const WEB_PROMOS: WebPromo[] = [
  {
    code: 'SIIVOO50',
    discountType: 'percentage',
    discountValue: 50,
    serviceSlugs: ['siivous'],
    expiry: '2026-12-31T23:59:59',
    oneTimeUse: true,
  },
  // Existing simple codes (fixed euro, any service)
  { code: 'KIITOS30', discountType: 'fixed', discountValue: 30 },
  { code: 'TERVETULOA', discountType: 'fixed', discountValue: 10 },
];

export function findWebPromo(code: string): WebPromo | undefined {
  const c = code.trim().toUpperCase();
  return WEB_PROMOS.find((p) => p.code === c);
}

/** Discount in euros for a subtotal (kept below subtotal so total stays ≥ 1€). */
export function webPromoDiscount(p: WebPromo, subtotal: number): number {
  const raw =
    p.discountType === 'percentage'
      ? subtotal * (p.discountValue / 100)
      : p.discountValue;
  const capped = Math.min(raw, Math.max(0, subtotal - 1));
  return Math.round(capped * 100) / 100;
}
