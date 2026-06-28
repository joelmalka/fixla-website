'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import CustomerTabBar from '@/components/CustomerTabBar';

export default function ReferralsPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        setAuthState('signed-out');
        return;
      }
      setAuthState('signed-in');
      const { data: row } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', data.session.user.id)
        .maybeSingle();
      if (!active) return;
      setCode(row?.referral_code ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    if (!code) return;
    const url = `https://www.fixla.fi/sivut/lataa?ref=${code}`;
    const message = `Kokeile Fixla-sovellusta ja saat 5€ alennusta ensimmäisestä palvelusta!\n\n${url}\n\nTai käytä koodiani: ${code}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Fixla', text: message, url });
        return;
      } catch {
        /* fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-32 md:pb-12">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 px-5 py-4 md:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Takaisin"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <BackArrow />
          </button>
          <h1 className="text-base font-bold text-gray-900">Suosittelut</h1>
        </div>
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/palvelut" className="shrink-0">
            <FixlaLogo size={44} />
          </Link>
          <DesktopNav />
        </div>
      </header>

      {authState === 'loading' ? (
        <Loading />
      ) : authState === 'signed-out' ? (
        <SignedOut />
      ) : (
        <section className="mx-auto max-w-2xl px-5 pt-6">
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
            Saat 5€ alennusta kun suosittelet kavereille
          </h1>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            Jaa koodisi. Kun kaverisi käyttää sen kassalla ja maksaa, kumpikin saa 5€ alennuksen seuraavasta tilauksesta.
          </p>

          {/* Your code */}
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Sinun koodisi</p>
            <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-fixla-600/40 bg-fixla-50 px-5 py-4">
              <span className="truncate font-mono text-2xl font-extrabold tracking-widest text-fixla-700">
                {code ?? '——————'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!code}
                className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-4 text-xs font-semibold transition ${
                  copied
                    ? 'bg-fixla-600 text-white'
                    : 'bg-white text-fixla-700 ring-1 ring-fixla-600/30 hover:bg-fixla-100 disabled:cursor-not-allowed disabled:opacity-50'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon /> Kopioitu
                  </>
                ) : (
                  'Kopioi'
                )}
              </button>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <BenefitRow
              icon="🎁"
              title="Saat 5€ alennuksen seuraavasta tilauksestasi"
              detail="20€ minimitilaus"
            />
            <BenefitRow
              icon="👥"
              title="Kaverisi saa 5€ alennuksen ensimmäisestä tilauksestaan"
              detail="20€ minimitilaus · Voimassa 90 päivää"
            />
          </div>

          {/* Auto-apply note */}
          <p className="mt-4 rounded-xl bg-gray-100 px-4 py-3 text-xs text-gray-600">
            Alennukset käytetään automaattisesti seuraavaan tilaukseesi.
          </p>
        </section>
      )}

      {/* Sticky invite CTA */}
      {authState === 'signed-in' ? (
        <div className="fixed bottom-16 left-0 right-0 z-20 border-t border-gray-100 bg-white/95 px-5 py-3 backdrop-blur md:bottom-0">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={handleShare}
              disabled={!code}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 text-sm font-semibold text-white hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Kutsu kavereita
            </button>
          </div>
        </div>
      ) : null}

      <CustomerTabBar />
    </main>
  );
}

function BenefitRow({ icon, title, detail }: { icon: string; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <span className="text-2xl">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{detail}</p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-fixla-600" />
    </div>
  );
}

function SignedOut() {
  return (
    <section className="mx-auto max-w-md px-5 pt-12 text-center">
      <h1 className="text-2xl font-extrabold text-gray-900">Suosittelut</h1>
      <p className="mt-2 text-sm text-gray-600">Kirjaudu sisään nähdäksesi suosittelukoodisi.</p>
      <Link
        href="/kirjaudu?next=/suosittelut"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-8 text-sm font-semibold text-white hover:bg-fixla-700"
      >
        Kirjaudu sisään
      </Link>
    </section>
  );
}

function BackArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-700">
      <path
        fillRule="evenodd"
        d="M11.78 5.22a.75.75 0 0 1 0 1.06L6.81 11.25H21a.75.75 0 0 1 0 1.5H6.81l4.97 4.97a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
