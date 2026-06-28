export const SERVICE_AREA_CITIES = ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen'] as const;
export type ServiceAreaCity = (typeof SERVICE_AREA_CITIES)[number];

const NORMALIZED_LOOKUP: Record<string, ServiceAreaCity> = {
  helsinki: 'Helsinki',
  helsingfors: 'Helsinki',
  hki: 'Helsinki',
  espoo: 'Espoo',
  esbo: 'Espoo',
  vantaa: 'Vantaa',
  vanda: 'Vantaa',
  kauniainen: 'Kauniainen',
  grankulla: 'Kauniainen',
};

const POSTAL_TO_CITY: Array<{ prefix: string; city: ServiceAreaCity }> = [
  // Helsinki postal codes start with 00 (excluding 02 which is Espoo)
  { prefix: '00', city: 'Helsinki' },
  // Espoo: 02
  { prefix: '02', city: 'Espoo' },
  // Kauniainen: 02700
  { prefix: '02700', city: 'Kauniainen' },
  // Vantaa: 01
  { prefix: '01', city: 'Vantaa' },
];

/**
 * Validate a structured address (from Google Places). City takes priority over postal.
 */
export function isInServiceAreaFromPlace(input: {
  city?: string | null;
  postalCode?: string | null;
  country?: string | null; // ISO short e.g. "FI"
}): { ok: boolean; city?: ServiceAreaCity } {
  if (input.country && input.country !== 'FI') return { ok: false };

  if (input.city) {
    const normalized = input.city.toLowerCase().trim();
    for (const [needle, city] of Object.entries(NORMALIZED_LOOKUP)) {
      if (normalized === needle || normalized.includes(needle)) {
        return { ok: true, city };
      }
    }
  }

  if (input.postalCode) {
    const postal = input.postalCode.trim();
    const sorted = [...POSTAL_TO_CITY].sort((a, b) => b.prefix.length - a.prefix.length);
    for (const { prefix, city } of sorted) {
      if (postal.startsWith(prefix)) return { ok: true, city };
    }
  }

  return { ok: false };
}

export function isInServiceArea(input: string): { ok: boolean; city?: ServiceAreaCity } {
  if (!input) return { ok: false };
  const normalized = input.toLowerCase().trim();

  for (const [needle, city] of Object.entries(NORMALIZED_LOOKUP)) {
    if (normalized.includes(needle)) return { ok: true, city };
  }

  const postalMatch = normalized.match(/\b(\d{5})\b/);
  if (postalMatch) {
    const postal = postalMatch[1];
    // Check longest prefixes first
    const sorted = [...POSTAL_TO_CITY].sort((a, b) => b.prefix.length - a.prefix.length);
    for (const { prefix, city } of sorted) {
      if (postal.startsWith(prefix)) return { ok: true, city };
    }
  }

  return { ok: false };
}
