'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CustomerTabBar from '@/components/CustomerTabBar';
import DesktopNav from '@/components/DesktopNav';
import FixlaLogo from '@/components/FixlaLogo';

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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
        .select('id, full_name, email, phone')
        .eq('id', data.session.user.id)
        .maybeSingle();
      if (!active) return;
      if (row) {
        setProfile(row as Profile);
      } else {
        const u = data.session.user;
        setProfile({
          id: u.id,
          full_name: (u.user_metadata as { full_name?: string })?.full_name ?? null,
          email: u.email ?? null,
          phone: (u.user_metadata as { phone?: string })?.phone ?? null,
        });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSignOut = async () => {
    if (!window.confirm('Haluatko varmasti kirjautua ulos?')) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace('/');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:teamfixla@gmail.com';
  };

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

      {authState === 'loading' ? (
        <Loading />
      ) : authState === 'signed-out' ? (
        <section className="mx-auto max-w-md px-5 pt-12 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">Profiili</h1>
          <p className="mt-2 text-sm text-gray-600">Kirjaudu sisään hallitaksesi profiiliasi.</p>
          <Link
            href="/kirjaudu?next=/profiili"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-8 text-sm font-semibold text-white hover:bg-fixla-700"
          >
            Kirjaudu sisään
          </Link>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl px-5 pt-8">
          {/* Avatar + name */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fixla-100 text-3xl">
              👤
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-gray-900">
              {profile?.full_name && profile.full_name !== 'Not provided'
                ? profile.full_name
                : 'Tervetuloa!'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">Rooli: Asiakas</p>
          </div>

          {/* Menu */}
          <div className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <MenuLink href="/suosittelut" label="Suosittelut" badge="🎁" />
            <MenuLink href="/yhteystiedot" label="Yhteystiedot" badge="📧" />
            <MenuLink href="/osoitteet" label="Osoitteet" />
            <MenuLink href="/tilaukset" label="Tilaushistoria" />
            <MenuLink href="/asetukset" label="Asetukset" badge="🌐" />
            <MenuButton label="Apu & Tuki" onClick={handleContactSupport} />
            <MenuButton
              label={signingOut ? 'Kirjaudutaan ulos…' : 'Kirjaudu ulos'}
              onClick={handleSignOut}
              danger
            />
          </div>
        </section>
      )}

      <CustomerTabBar />
    </main>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-fixla-600" />
    </div>
  );
}

function MenuLink({ href, label, badge }: { href: string; label: string; badge?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50">
      <span className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        {badge ? <span className="text-base">{badge}</span> : null}
      </span>
      <span className="text-gray-400">→</span>
    </Link>
  );
}

function MenuButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50 ${
        danger ? 'text-red-600' : 'text-gray-900'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={danger ? 'text-red-400' : 'text-gray-400'}>→</span>
    </button>
  );
}
