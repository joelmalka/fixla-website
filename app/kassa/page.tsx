'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  readOrderSession,
  patchOrderSession,
  formatFullAddress,
  OrderSession,
} from '@/lib/orderSession';
import { reconcileAddress } from '@/lib/addressSync';
import { getServiceBySlug } from '@/lib/services';
import { campaignForService, campaignDiscount, campaignAlreadyUsed } from '@/lib/campaign';
import { supabase } from '@/lib/supabase';
import { readPendingPhone, clearPendingPhone } from '@/lib/pendingPhone';
import CustomerTabBar from '@/components/CustomerTabBar';
import DesktopNav from '@/components/DesktopNav';
import FixlaLogo from '@/components/FixlaLogo';

const TIP_OPTIONS = [0, 5, 10, 15] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<OrderSession | null>(null);

  // Promo
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Tip
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>('');

  useEffect(() => {
    const s = readOrderSession();
    if (!s?.address || !s.serviceSlug || typeof s.price !== 'number') {
      router.replace('/palvelut');
      return;
    }
    // Auth gate — orders require customer_id, so block here at the start of checkout
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace('/kirjaudu?next=/kassa');
        return;
      }
      const userId = data.session.user.id;

      // Apply any pending phone captured pre-OAuth on the sign-up screen
      const pending = readPendingPhone();
      if (pending.phone) {
        const meta = (data.session.user.user_metadata ?? {}) as { phone?: string };
        if (!meta.phone) {
          await supabase.auth.updateUser({
            data: { phone: pending.phone, email_opt_in: pending.emailOptIn },
          });
        }
        clearPendingPhone();
      }

      // Reconcile the typed address vs. what the user has saved on file
      const reconciled = await reconcileAddress(userId, s);
      setSession(reconciled);
      setHydrated(true);
    });
  }, [router]);

  // Auto-apply a marketing campaign discount (e.g. /?tarjous=siivous30) for the
  // matching service — no promo code needed. One-time per account: skip if this
  // user already has an order with the campaign code.
  useEffect(() => {
    if (!session) return;
    const c = campaignForService(session.serviceSlug);
    if (!c || appliedPromo) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || cancelled) return;
      if (await campaignAlreadyUsed(supabase, user.id, c.code)) {
        return; // one-time per account — already redeemed, no discount
      }
      if (!cancelled) {
        setAppliedPromo({ code: c.code, discount: campaignDiscount(c, session.price ?? 0) });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const service = session ? getServiceBySlug(session.serviceSlug!) : null;
  const subtotal = session?.price ?? 0;

  const discount = appliedPromo?.discount ?? 0;
  const discountedSubtotal = Math.max(1, subtotal - discount);
  const serviceFee = useMemo(
    () => Math.round(discountedSubtotal * 0.09 * 100) / 100,
    [discountedSubtotal],
  );

  const tipAmount = useMemo(() => {
    if (tipPercent === -1) {
      const v = parseFloat(customTip.replace(',', '.'));
      return isNaN(v) ? 0 : Math.max(0, Math.round(v * 100) / 100);
    }
    return Math.round(discountedSubtotal * (tipPercent / 100) * 100) / 100;
  }, [tipPercent, customTip, discountedSubtotal]);

  const total = useMemo(
    () => Math.round((discountedSubtotal + serviceFee + tipAmount) * 100) / 100,
    [discountedSubtotal, serviceFee, tipAmount],
  );

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoError('');
    // Minimal client-side validation — full validation happens at order insert.
    // Hardcoded promos that work on first order:
    if (code === 'KIITOS30') {
      setAppliedPromo({ code, discount: Math.min(30, subtotal - 1) });
      return;
    }
    if (code === 'TERVETULOA') {
      setAppliedPromo({ code, discount: Math.min(10, subtotal - 1) });
      return;
    }
    setPromoError('Koodi ei kelpaa');
  };

  const handleContinue = () => {
    patchOrderSession({
      // keep subtotal as `price`; final totals stored in serviceConfig
      price: subtotal,
      serviceConfig: {
        ...(session?.serviceConfig ?? {}),
        promoCode: appliedPromo?.code ?? null,
        promoDiscount: discount,
        tip: tipAmount,
        serviceFee,
        total,
      },
    });
    router.push('/maksu');
  };

  if (!hydrated || !session || !service) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-48 md:pb-12">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex flex-col items-center gap-3 px-5 py-4 md:hidden">
          <FixlaLogo size={50} />
        </div>
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/palvelut" className="shrink-0">
            <FixlaLogo size={44} />
          </Link>
          <DesktopNav />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 pt-6 md:px-6 md:pt-10">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Takaisin"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M11.78 5.22a.75.75 0 0 1 0 1.06L6.81 11.25H21a.75.75 0 0 1 0 1.5H6.81l4.97 4.97a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Kassalle</h1>
        </div>

        <div className="md:grid md:grid-cols-5 md:gap-8">
          {/* Left: form */}
          <div className="space-y-5 md:col-span-3">
            {/* Order summary card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tilauksen yhteenveto
              </h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Palvelu</span>
                  <span className="font-semibold text-gray-900">{service.name}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-600">Osoite</span>
                  <span className="max-w-[60%] text-right font-medium text-gray-900">
                    {formatFullAddress(session)}
                  </span>
                </div>
                {session.serviceConfig?.duration ? (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600">Kesto</span>
                    <span className="font-semibold text-gray-900">
                      {String(session.serviceConfig.duration)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-600">Aikataulu</span>
                  <span className="font-semibold text-gray-900">
                    {session.scheduledFor
                      ? new Date(session.scheduledFor).toLocaleString('fi-FI', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Heti'}
                  </span>
                </div>
              </div>
            </div>

            {/* Promo */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-bold text-gray-900">Alennuskoodi</h2>
              {appliedPromo ? (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-fixla-50 px-4 py-3 ring-1 ring-fixla-600/30">
                  <div>
                    <p className="text-sm font-bold text-fixla-700">{appliedPromo.code}</p>
                    <p className="text-xs text-fixla-700/80">
                      −{appliedPromo.discount.toFixed(2)}€
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedPromo(null);
                      setPromoInput('');
                    }}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                  >
                    Poista
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError('');
                      }}
                      placeholder="Lisää koodi"
                      className="h-12 flex-1 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="h-12 shrink-0 rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      Käytä
                    </button>
                  </div>
                  {promoError ? (
                    <p className="mt-2 text-xs text-red-600">{promoError}</p>
                  ) : null}
                </>
              )}
            </div>

            {/* Tip */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-bold text-gray-900">Tippi (valinnainen)</h2>
              <p className="mt-1 text-sm text-gray-600">Kiitä tekijää hyvästä työstä.</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {TIP_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setTipPercent(p);
                      setCustomTip('');
                    }}
                    className={`h-11 rounded-xl border text-sm font-semibold transition ${
                      tipPercent === p
                        ? 'border-fixla-600 bg-fixla-50 text-fixla-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {p === 0 ? 'Ei' : `${p}%`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTipPercent(-1)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition ${
                    tipPercent === -1
                      ? 'border-fixla-600 bg-fixla-50 text-fixla-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Muu
                </button>
              </div>
              {tipPercent === -1 ? (
                <div className="mt-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    placeholder="Tippi €"
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: totals + CTA (desktop sidebar) */}
          <aside className="mt-6 md:col-span-2 md:mt-0">
            <div className="md:sticky md:top-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Yhteenveto
                </h2>
                <div className="mt-3 space-y-2 text-sm">
                  <Row label="Hinta" value={`${subtotal.toFixed(2)}€`} />
                  {discount > 0 ? (
                    <Row label="Alennus" value={`−${discount.toFixed(2)}€`} accent />
                  ) : null}
                  <Row label="Palvelumaksu (9%)" value={`${serviceFee.toFixed(2)}€`} />
                  {tipAmount > 0 ? (
                    <Row label="Tippi" value={`${tipAmount.toFixed(2)}€`} />
                  ) : null}
                  <div className="my-2 border-t border-gray-100" />
                  <Row label="Yhteensä" value={`${total.toFixed(2)}€`} bold />
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-5 hidden h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700 md:inline-flex"
                >
                  Maksa {total.toFixed(2)}€
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 px-5 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Yhteensä</p>
            <p className="text-xl font-extrabold text-gray-900">{total.toFixed(2)}€</p>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="h-12 shrink-0 rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
          >
            Maksa
          </button>
        </div>
      </div>

      <CustomerTabBar />
    </main>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={accent ? 'text-fixla-700' : 'text-gray-600'}>{label}</span>
      <span
        className={`${bold ? 'text-base font-extrabold text-gray-900' : 'font-semibold text-gray-900'} ${
          accent ? 'text-fixla-700' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
