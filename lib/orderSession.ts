/**
 * Order state persisted in sessionStorage so the multi-screen flow survives
 * refreshes (but not new tabs / new sessions).
 */

import { ServiceAreaCity } from './serviceArea';

export interface OrderSession {
  address: string;
  city?: ServiceAreaCity;
  postalCode?: string | null;
  country?: string | null;
  apartment?: string | null;
  floor?: string | null;
  /** Service slug (set on /palvelut click) */
  serviceSlug?: string;
  /** Per-service config payload (window count, hours, etc.) */
  serviceConfig?: Record<string, unknown>;
  /** Computed price for current config in EUR (subtotal, before fee/tip) */
  price?: number;
  /** Scheduled-for ISO string or null for ASAP */
  scheduledFor?: string | null;
  /** Customer-provided notes / extra instructions */
  instructions?: string;
}

const KEY = 'fixla.order';

export function readOrderSession(): OrderSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderSession;
  } catch {
    return null;
  }
}

export function writeOrderSession(next: OrderSession): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function patchOrderSession(patch: Partial<OrderSession>): OrderSession | null {
  const current = readOrderSession();
  if (!current) return null;
  const merged = { ...current, ...patch };
  writeOrderSession(merged);
  return merged;
}

export function clearOrderSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(KEY);
}

/** Display a customer's address including apartment / floor when set. */
export function formatFullAddress(session: OrderSession): string {
  const extras: string[] = [];
  if (session.apartment) extras.push(`As. ${session.apartment}`);
  if (session.floor) extras.push(`${session.floor}. krs`);
  return extras.length > 0 ? `${session.address} · ${extras.join(', ')}` : session.address;
}
