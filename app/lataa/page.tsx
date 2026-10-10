'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';

// Keep in sync with the mobile app (eas.json ascAppId / app.json package)
const APP_STORE_URL = 'https://apps.apple.com/fi/app/fixla/id6751362626';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.joelmalka.fixla';

type Platform = 'ios' | 'android' | 'other';

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>('other');
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios');
    else if (/Android/i.test(ua)) setPlatform('android');

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral');
    if (ref) setRefCode(ref.toUpperCase());
  }, []);

  const appStore = <StoreButton key="ios" href={APP_STORE_URL} store="ios" />;
  const playStore = <StoreButton key="android" href={PLAY_STORE_URL} store="android" />;
  // Show the visitor's own store first
  const buttons = platform === 'android' ? [playStore, appStore] : [appStore, playStore];

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex items-center justify-center px-5 py-4 md:hidden">
          <Link href="/">
            <FixlaLogo size={50} />
          </Link>
        </div>
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/">
            <FixlaLogo size={44} />
          </Link>
          <DesktopNav />
        </div>
      </header>

      <section className="mx-auto max-w-md px-5 pt-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Lataa Fixla</h1>
        <p className="mt-3 text-base text-gray-600">
          Tilaa kotipalvelut helposti puhelimellasi. Saatavilla iPhonelle ja Androidille.
        </p>

        {refCode ? (
          <div className="mt-6 rounded-2xl bg-fixla-600 px-5 py-4 text-white">
            <p className="text-base font-semibold">Saat 5€ alennusta ensimmäisestä palvelusta!</p>
            <p className="mt-1 text-sm opacity-90">
              Käytä suosittelukoodia <strong className="tracking-wide">{refCode}</strong> sovelluksessa
            </p>
          </div>
        ) : null}

        <div className="mt-8 space-y-3">{buttons}</div>

        <p className="mt-8 text-sm text-gray-500">
          Haluatko tilata selaimella?{' '}
          <Link href="/" className="font-semibold text-fixla-600 hover:underline">
            Tilaa verkossa
          </Link>
        </p>
      </section>
    </main>
  );
}

function StoreButton({ href, store }: { href: string; store: 'ios' | 'android' }) {
  const isIos = store === 'ios';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gray-900 px-5 py-4 text-white transition hover:bg-gray-800"
    >
      {isIos ? <AppleIcon /> : <PlayIcon />}
      <span className="text-left leading-tight">
        <span className="block text-xs opacity-80">{isIos ? 'Lataa' : 'Hanki se'}</span>
        <span className="block text-lg font-semibold">{isIos ? 'App Storesta' : 'Google Playsta'}</span>
      </span>
    </a>
  );
}

function AppleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.78c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.77-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.23-.02 2.01-1.12 2.76-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.42-3.65zM14.1 6.03c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.27z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#34A853" d="M3.6 1.8 13.5 12 3.6 22.2c-.36-.2-.6-.6-.6-1.07V2.87c0-.47.24-.87.6-1.07z" />
      <path fill="#FBBC04" d="m17 8.5-3.5 3.5L17 15.5l3.9-2.2c.8-.46.8-1.6 0-2.06L17 8.5z" />
      <path fill="#4285F4" d="M3.6 1.8c.27-.15.61-.17.93 0L17 8.5 13.5 12 3.6 1.8z" />
      <path fill="#EA4335" d="M13.5 12 17 15.5 4.53 22.2c-.32.17-.66.15-.93 0L13.5 12z" />
    </svg>
  );
}
