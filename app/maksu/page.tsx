'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { readOrderSession, formatFullAddress, OrderSession } from '@/lib/orderSession';
import { getServiceBySlug } from '@/lib/services';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import CustomerTabBar from '@/components/CustomerTabBar';
import PaymentForm from './PaymentForm';

export default function PaymentPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<OrderSession | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = readOrderSession();
    if (!s?.address || !s.serviceSlug) {
      router.replace('/palvelut');
      return;
    }
    const total = (s.serviceConfig as { total?: number } | undefined)?.total;
    if (typeof total !== 'number' || total <= 0) {
      router.replace('/kassa');
      return;
    }
    setSession(s);
    setHydrated(true);
  }, [router]);

  useEffect(() => {
    if (!session) return;
    const cfg = session.serviceConfig as {
      total: number;
      tip?: number;
      promoCode?: string | null;
      promoDiscount?: number;
      duration?: string;
    };
    const total = cfg.total;
    const service = getServiceBySlug(session.serviceSlug!);
    let cancelled = false;
    (async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData.user;
        if (!user) {
          setError('Kirjautuminen vaaditaan');
          return;
        }
        const { data, error: invokeError } = await supabase.functions.invoke(
          'create-payment-intent',
          {
            body: {
              amount: total,
              currency: 'eur',
              metadata: {
                user_id: user.id,
                user_email: user.email,
                service_type: service?.dbName ?? 'Service',
                location: formatFullAddress(session),
                scheduled_for: session.scheduledFor,
                instructions: session.instructions ?? '',
                tip_amount: String(cfg.tip ?? 0),
                equipment_provider: 'customer',
                ...(cfg.promoCode ? { promo_code: cfg.promoCode } : {}),
                ...(cfg.promoDiscount ? { discount_amount: String(cfg.promoDiscount) } : {}),
                ...(cfg.duration ? { duration: cfg.duration } : {}),
                device_platform: 'web',
              },
            },
          },
        );
        if (cancelled) return;
        if (invokeError) throw invokeError;
        if (!data?.clientSecret) throw new Error('No client secret');
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId ?? null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Maksun alustus epäonnistui';
        setError(msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const options = useMemo<StripeElementsOptions | null>(() => {
    if (!clientSecret) return null;
    return {
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#00b3a4',
          colorBackground: '#ffffff',
          colorText: '#111827',
          borderRadius: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        },
      },
    };
  }, [clientSecret]);

  if (!hydrated || !session) {
    return <div className="min-h-screen bg-white" />;
  }

  const total = (session.serviceConfig as { total: number }).total;
  const service = getServiceBySlug(session.serviceSlug!);

  return (
    <main className="min-h-screen bg-gray-50 pb-40 md:pb-12">
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

      <section className="mx-auto max-w-2xl px-5 pt-6 md:pt-10">
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
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Maksa</h1>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-gray-500">{service?.name}</p>
              <p className="truncate text-sm text-gray-700">{formatFullAddress(session)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">Yhteensä</p>
              <p className="text-2xl font-extrabold text-gray-900">{total.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">
          {error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : !options ? (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-fixla-600" />
              Alustetaan maksua…
            </div>
          ) : (
            <Elements stripe={getStripe()} options={options}>
              <PaymentForm total={total} paymentIntentId={paymentIntentId} />
            </Elements>
          )}
        </div>

        <p className="mt-3 text-center text-xs text-gray-500">
          Maksun käsittelee Stripe. Korttitietoja ei tallenneta Fixlalle.
        </p>
      </section>

      <CustomerTabBar />
    </main>
  );
}
