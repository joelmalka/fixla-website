/**
 * The user's most recent address — kept in localStorage so they never have to
 * retype it on subsequent visits. Distinct from the per-cart `fixla.order` in
 * sessionStorage.
 */

import type { ServiceAreaCity } from './serviceArea';

export interface PreferredAddress {
  address: string;
  city?: ServiceAreaCity;
  postalCode?: string | null;
  country?: string | null;
  apartment?: string | null;
  floor?: string | null;
}

const KEY = 'fixla.preferred_address';

export function readPreferredAddress(): PreferredAddress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PreferredAddress;
  } catch {
    return null;
  }
}

export function writePreferredAddress(addr: PreferredAddress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(addr));
}

export function clearPreferredAddress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
