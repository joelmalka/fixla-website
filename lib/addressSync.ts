/**
 * Address reconciliation between the order session, customer_addresses, and
 * the localStorage preferred address. The rule the product wants:
 *
 * - First-time customer (no saved addresses): persist the typed session
 *   address into customer_addresses as their primary so it sticks for next time.
 * - Existing customer with saved primary: the saved primary always wins. The
 *   session swaps to it and the preferred address is updated to match.
 *
 * Idempotent — safe to call from multiple pages (/palvelut, /kassa, etc.).
 */

import { supabase } from './supabase';
import { patchOrderSession, OrderSession } from './orderSession';
import { writePreferredAddress } from './preferredAddress';

export async function reconcileAddress(
  userId: string,
  sess: OrderSession,
): Promise<OrderSession> {
  const { data: addrs } = await supabase
    .from('customer_addresses')
    .select(
      'id, label, address_line_1, city, postal_code, country, is_primary, is_service_available',
    )
    .eq('customer_id', userId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  const usable = (addrs ?? []).filter((a) => a.is_service_available !== false);

  if (usable.length === 0) {
    if (sess.address) {
      await supabase.from('customer_addresses').insert({
        customer_id: userId,
        label: 'Koti',
        address_line_1: sess.address,
        city: sess.city ?? null,
        postal_code: sess.postalCode ?? '',
        country: 'Finland',
        is_primary: true,
        is_service_available: true,
      });
    }
    return sess;
  }

  const primary = usable.find((a) => a.is_primary) ?? usable[0];
  const formatted = [
    primary.address_line_1,
    [primary.postal_code, primary.city].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  if (formatted !== sess.address) {
    const next: OrderSession = {
      ...sess,
      address: formatted,
      city: (primary.city as OrderSession['city']) ?? sess.city,
      postalCode: primary.postal_code ?? null,
      country: primary.country ?? 'FI',
      apartment: null,
      floor: null,
    };
    patchOrderSession(next);
    writePreferredAddress({
      address: formatted,
      city: next.city,
      postalCode: next.postalCode,
      country: 'FI',
    });
    return next;
  }
  return sess;
}
