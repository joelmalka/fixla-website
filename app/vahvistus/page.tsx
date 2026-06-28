'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { clearOrderSession } from '@/lib/orderSession';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import CustomerTabBar from '@/components/CustomerTabBar';

function ConfirmationInner() {
  const router = useRouter();
  const params = useSearchParams();
  const piParam = params.get('pi') ?? params.get('payment_intent');
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!piParam) {
      router.replace('/palvelut');
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 15; // ~30s

    const check = async () => {
      attempts++;
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', piParam)
        .maybeSingle();
      if (cancelled) return;
      if (data?.id) {
        setOrderId(data.id);
        setStatus('ok');
        clearOrderSession();
        return;
      }
      if (attempts >= maxAttempts) {
        setStatus('error');
        return;
      }
      setTimeout(check, 2000);
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [piParam, router]);

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex flex-col items-center px-5 py-4 md:hidden">
          <FixlaLogo size={50} />
        </div>
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/palvelut" className="shrink-0">
            <FixlaLogo size={44} />
          </Link>
          <DesktopNav />
        </div>
      </header>

      <section className="mx-auto max-w-md px-5 pt-12 text-center">
        {status === 'pending' ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fixla-50">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-fixla-200 border-t-fixla-600" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Vahvistetaan tilausta…</h1>
            <p className="mt-2 text-sm text-gray-600">
              Maksu on käsitelty. Odotamme vahvistuksen Stripeltä — tämä kestää yleensä alle 30
              sekuntia.
            </p>
          </>
        ) : status === 'ok' ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fixla-50">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-fixla-600">
                <path
                  fillRule="evenodd"
                  d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Tilaus vahvistettu</h1>
            <p className="mt-2 text-sm text-gray-600">
              Kiitos! Etsimme sinulle tekijää ja ilmoitamme heti, kun joku hyväksyy työn.
            </p>
            {orderId ? (
              <p className="mt-4 text-xs text-gray-500">Tilaus #{orderId.slice(0, 8)}</p>
            ) : null}
            <div className="mt-8 flex flex-col gap-2">
              <Link
                href="/tilaukset"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
              >
                Näytä tilaukseni
              </Link>
              <Link
                href="/palvelut"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                Takaisin etusivulle
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-amber-600">
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.999-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.501-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 1 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
              Vahvistus viivästyy
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Maksu meni läpi, mutta tilauksen luonti kesti odotettua kauemmin. Tilauksesi
              näkyy pian Tilaukset-sivulla — ole yhteydessä jos se ei ilmesty 5 minuutissa.
            </p>
            <Link
              href="/tilaukset"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
            >
              Tilauksiin
            </Link>
          </>
        )}
      </section>

      <CustomerTabBar />
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ConfirmationInner />
    </Suspense>
  );
}
