'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import CustomerTabBar from '@/components/CustomerTabBar';

type Profile = { full_name: string; email: string; phone: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[0-9 ]{5,20}$/;

export default function ContactInfoPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [initial, setInitial] = useState<Profile>({ full_name: '', email: '', phone: '' });
  const [form, setForm] = useState<Profile>({ full_name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        .select('full_name, email, phone')
        .eq('id', data.session.user.id)
        .maybeSingle();
      if (!active) return;
      const u = data.session.user;
      const meta = u.user_metadata as { full_name?: string; phone?: string };
      const next: Profile = {
        full_name: row?.full_name ?? meta?.full_name ?? '',
        email: row?.email ?? u.email ?? '',
        phone: row?.phone ?? meta?.phone ?? '',
      };
      setInitial(next);
      setForm(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const hasChanges =
    form.full_name !== initial.full_name ||
    form.email !== initial.email ||
    form.phone !== initial.phone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!form.full_name.trim()) {
      setError('Nimi vaaditaan');
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setError('Tarkista sähköposti');
      return;
    }
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim())) {
      setError('Tarkista puhelinnumero');
      return;
    }
    if (!hasChanges) {
      router.back();
      return;
    }
    setSaving(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess.session?.user.id;
      if (!userId) throw new Error('Istunto vanhentunut');

      const emailChanged = form.email.trim().toLowerCase() !== initial.email.trim().toLowerCase();
      if (emailChanged) {
        const { error: rpcErr } = await supabase.rpc('update_user_email', {
          user_id: userId,
          new_email: form.email.trim().toLowerCase(),
        });
        if (rpcErr) throw rpcErr;
      }

      const update: Record<string, unknown> = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim() || null,
        updated_at: new Date().toISOString(),
      };
      if (!emailChanged) update.email = form.email.trim().toLowerCase();

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', userId);
      if (updateErr) throw updateErr;

      setInitial(form);
      setSuccess('Tiedot päivitetty');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Tallennus epäonnistui');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges && !window.confirm('Sinulla on tallentamattomia muutoksia. Haluatko poistua?')) {
      return;
    }
    router.back();
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <header className="border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-3 px-5 py-4 md:hidden">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Sulje"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
          <h1 className="text-base font-bold text-gray-900">Yhteystiedot</h1>
          <div className="w-9" />
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
        <section className="mx-auto max-w-md px-5 pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fixla-100 text-3xl">
              👤
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-gray-900">Muokkaa profiilia</h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <Field
              label="Nimi"
              value={form.full_name}
              onChange={(v) => setForm({ ...form, full_name: v })}
              autoComplete="name"
              required
            />
            <Field
              label="Sähköposti"
              hint="Käytetään laskutukseen"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              type="email"
              autoComplete="email"
              required
            />
            <Field
              label="Puhelinnumero"
              hint="Valinnainen"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              type="tel"
              autoComplete="tel"
            />

            {error ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-xl bg-fixla-50 px-4 py-3 text-sm text-fixla-700 ring-1 ring-fixla-600/20">
                {success}
              </div>
            ) : null}

            <p className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
              Päivitettäväksi sähköpostiosoitteeksi voidaan tarvita vahvistus.
            </p>

            <button
              type="submit"
              disabled={!hasChanges || saving}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                'Tallenna'
              )}
            </button>
          </form>
        </section>
      )}

      <CustomerTabBar />
    </main>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = 'text',
  autoComplete,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
        {hint ? <span className="ml-2 text-[10px] font-medium normal-case text-gray-400">— {hint}</span> : null}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
      />
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
      <h1 className="text-2xl font-extrabold text-gray-900">Yhteystiedot</h1>
      <p className="mt-2 text-sm text-gray-600">Kirjaudu sisään muokataksesi profiiliasi.</p>
      <Link
        href="/kirjaudu?next=/yhteystiedot"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-8 text-sm font-semibold text-white hover:bg-fixla-700"
      >
        Kirjaudu sisään
      </Link>
    </section>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-gray-700">
      <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.36-4.36a1 1 0 1 1 1.414 1.414L13.414 10.586l4.36 4.36a1 1 0 1 1-1.414 1.414L12 12l-4.36 4.36a1 1 0 0 1-1.414-1.414l4.36-4.36-4.36-4.36a1 1 0 0 1 0-1.415Z" />
    </svg>
  );
}
