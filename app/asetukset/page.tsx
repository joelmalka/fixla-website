'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import CustomerTabBar from '@/components/CustomerTabBar';

type NotifPrefs = {
  job_accepted?: boolean;
  job_reminders?: boolean;
  marketing?: boolean;
  updates?: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotifPrefs>({ updates: true, marketing: false });
  const [savingPref, setSavingPref] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        setAuthState('signed-out');
        return;
      }
      setAuthState('signed-in');
      setUserId(data.session.user.id);
      const { data: row } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', data.session.user.id)
        .maybeSingle();
      if (!active) return;
      const np = (row?.notification_preferences as NotifPrefs | null) ?? {};
      setPrefs({ updates: np.updates ?? true, marketing: np.marketing ?? false });
    });
    return () => {
      active = false;
    };
  }, []);

  const togglePref = async (key: 'updates' | 'marketing') => {
    if (!userId) return;
    const next: NotifPrefs = { ...prefs, [key]: !prefs[key] };
    if (key === 'updates' && !next.updates) next.marketing = false;
    setSavingPref(key);
    setPrefs(next);
    await supabase
      .from('profiles')
      .update({ notification_preferences: next, updated_at: new Date().toISOString() })
      .eq('id', userId);
    setSavingPref(null);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        'Tämä poistaa tilisi pysyvästi ja kaikki tilauksesi. Toimintoa ei voi peruuttaa. Haluatko varmasti jatkaa?',
      )
    ) {
      return;
    }
    setDeleting(true);
    // We don't have a service-role delete endpoint on web yet — open support email.
    window.location.href =
      'mailto:teamfixla@gmail.com?subject=Tilin%20poisto&body=Pyyd%C3%A4n%20tilini%20poistamista.';
    setDeleting(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-12">
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
          <h1 className="text-base font-bold text-gray-900">Asetukset</h1>
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
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Asetukset</h1>

          {/* Language */}
          <Group title="Kieli">
            <Row
              label="Suomi"
              value={
                <span className="rounded-full bg-fixla-100 px-3 py-0.5 text-[11px] font-bold uppercase text-fixla-700">
                  Käytössä
                </span>
              }
            />
            <p className="px-5 pb-3 text-[11px] text-gray-500">
              Englanninkielinen versio tulossa pian.
            </p>
          </Group>

          {/* Notifications */}
          <Group title="Ilmoitukset">
            <ToggleRow
              label="Sähköposti-ilmoitukset"
              hint="Tilauspäivitykset ja vahvistukset"
              on={!!prefs.updates}
              saving={savingPref === 'updates'}
              onToggle={() => togglePref('updates')}
            />
            <ToggleRow
              label="Markkinointiviestit"
              hint="Tarjoukset ja uutiset"
              on={!!prefs.marketing}
              saving={savingPref === 'marketing'}
              onToggle={() => togglePref('marketing')}
              disabled={!prefs.updates}
            />
            <p className="px-5 pb-3 text-[11px] text-gray-500">
              Push-ilmoitukset ovat saatavilla mobiilisovelluksessa.
            </p>
          </Group>

          {/* Legal */}
          <Group title="Tietosuoja ja ehdot">
            <LinkRow href="/ehdot#tietosuoja" label="Tietosuojakäytäntö" />
            <LinkRow href="/ehdot#kayttoehdot" label="Käyttöehdot" />
          </Group>

          {/* Account */}
          <Group title="Tili">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <span className="text-sm font-semibold">
                {deleting ? 'Lähetetään pyyntöä…' : 'Poista tili'}
              </span>
              <span className="text-red-400">→</span>
            </button>
            <p className="px-5 pb-3 text-[11px] text-gray-500">
              Poisto vahvistetaan sähköpostitse 24 tunnin sisällä.
            </p>
          </Group>
        </section>
      )}

      <CustomerTabBar />
    </main>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="px-1 pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      <span className="text-sm text-gray-600">{value}</span>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onToggle,
  saving,
  disabled,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onToggle: () => void;
  saving?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={!!disabled || !!saving}
        aria-pressed={on}
        className={`relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition ${
          on ? 'bg-fixla-600' : 'bg-gray-200'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50"
    >
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      <span className="text-gray-400">→</span>
    </Link>
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
      <h1 className="text-2xl font-extrabold text-gray-900">Asetukset</h1>
      <p className="mt-2 text-sm text-gray-600">Kirjaudu sisään muokataksesi asetuksiasi.</p>
      <Link
        href="/kirjaudu?next=/asetukset"
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
