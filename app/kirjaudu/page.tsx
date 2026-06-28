'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { setPendingPhone } from '@/lib/pendingPhone';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import AuthHeroGrid from '@/components/AuthHeroGrid';

type Mode = 'signup' | 'signin';

type Country = { code: string; flag: string; dial: string; name: string };

const COUNTRIES: Country[] = [
  { code: 'FI', flag: '🇫🇮', dial: '+358', name: 'Suomi' },
  { code: 'SE', flag: '🇸🇪', dial: '+46', name: 'Ruotsi' },
  { code: 'NO', flag: '🇳🇴', dial: '+47', name: 'Norja' },
  { code: 'DK', flag: '🇩🇰', dial: '+45', name: 'Tanska' },
  { code: 'EE', flag: '🇪🇪', dial: '+372', name: 'Viro' },
  { code: 'DE', flag: '🇩🇪', dial: '+49', name: 'Saksa' },
  { code: 'GB', flag: '🇬🇧', dial: '+44', name: 'Iso-Britannia' },
  { code: 'US', flag: '🇺🇸', dial: '+1', name: 'Yhdysvallat' },
];

function fullPhone(dial: string, phone: string): string {
  const trimmed = phone.replace(/\s/g, '');
  return trimmed ? `${dial} ${trimmed}` : '';
}

function AuthInner() {
  const router = useRouter();
  const params = useSearchParams();
  const nextUrl = params.get('next') || '/palvelut';
  const [mode, setMode] = useState<Mode>('signup');

  // Sign-up state
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  // Email signup fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign-in fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Shared
  const [busy, setBusy] = useState<null | 'google' | 'apple' | 'email'>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(nextUrl);
    });
  }, [router, nextUrl]);

  const requirePhoneForSignup = (): boolean => {
    if (mode === 'signin') return true;
    if (!phone.replace(/\s/g, '')) {
      setError('Anna puhelinnumerosi jatkaaksesi');
      return false;
    }
    return true;
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    if (!requirePhoneForSignup()) return;
    if (mode === 'signup') {
      setPendingPhone(fullPhone(country.dial, phone), emailOptIn);
    }
    setBusy(provider);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}${nextUrl}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setBusy(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!requirePhoneForSignup()) return;
    if (!name.trim()) {
      setError('Anna nimesi');
      return;
    }
    setBusy('email');
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: fullPhone(country.dial, phone),
            email_opt_in: emailOptIn,
          },
          emailRedirectTo: `${window.location.origin}${nextUrl}`,
        },
      });
      if (signUpError) throw signUpError;
      router.replace(nextUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Tilin luonti epäonnistui';
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy('email');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim().toLowerCase(),
        password: signInPassword,
      });
      if (signInError) throw signInError;
      router.replace(nextUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Kirjautuminen epäonnistui';
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
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

      <AuthHeroGrid />

      <section className="mx-auto max-w-md px-5 pb-10 pt-5">
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-fixla-700">
          Fixla
        </h1>
        <p className="mt-1 text-center text-sm font-semibold text-gray-900">
          {mode === 'signup' ? 'Luo tili 10 sekunnissa' : 'Tervetuloa takaisin'}
        </p>

        {mode === 'signup' ? (
          <SignupForm
            country={country}
            setCountry={setCountry}
            phone={phone}
            setPhone={setPhone}
            emailOptIn={emailOptIn}
            setEmailOptIn={setEmailOptIn}
            handleOAuth={handleOAuth}
            busy={busy}
            error={error}
            showEmail={showEmail}
            setShowEmail={setShowEmail}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleEmailSignUp={handleEmailSignUp}
          />
        ) : (
          <SigninForm
            email={signInEmail}
            setEmail={setSignInEmail}
            password={signInPassword}
            setPassword={setSignInPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleOAuth={handleOAuth}
            handleSignIn={handleSignIn}
            busy={busy}
            error={error}
          />
        )}

        <p className="mt-3 text-center text-[11px] text-gray-500">
          Jatkamalla hyväksyt{' '}
          <Link href="/ehdot" className="font-semibold text-fixla-700 hover:underline">
            käyttöehdot ja tietosuojakäytännön
          </Link>
          .
        </p>

        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === 'signup' ? 'Onko sinulla jo tili?' : 'Eikö sinulla ole tiliä?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
              setShowEmail(false);
            }}
            className="font-semibold text-fixla-700 hover:underline"
          >
            {mode === 'signup' ? 'Kirjaudu' : 'Luo tili'}
          </button>
        </p>
      </section>
    </main>
  );
}

function SignupForm({
  country,
  setCountry,
  phone,
  setPhone,
  emailOptIn,
  setEmailOptIn,
  handleOAuth,
  busy,
  error,
  showEmail,
  setShowEmail,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleEmailSignUp,
}: {
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  setPhone: (v: string) => void;
  emailOptIn: boolean;
  setEmailOptIn: (v: boolean) => void;
  handleOAuth: (p: 'google' | 'apple') => void;
  busy: null | 'google' | 'apple' | 'email';
  error: string | null;
  showEmail: boolean;
  setShowEmail: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  handleEmailSignUp: (e: React.FormEvent) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      {/* Country + phone */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Puhelinnumero
        </label>
        <div className="mt-1.5 flex items-stretch gap-2">
          <div className="relative">
            <select
              value={country.code}
              onChange={(e) => {
                const c = COUNTRIES.find((x) => x.code === e.target.value);
                if (c) setCountry(c);
              }}
              className="h-12 appearance-none rounded-2xl border border-gray-200 bg-white pl-3 pr-8 text-sm font-semibold text-gray-900 outline-none focus:border-fixla-600"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.dial}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L12 13.94l5.72-5.72a.75.75 0 1 1 1.06 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="40 123 4567"
            autoComplete="tel-national"
            className="h-12 flex-1 rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
          />
        </div>
      </div>

      {/* Email opt-in */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={emailOptIn}
          onChange={(e) => setEmailOptIn(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-gray-300 text-fixla-600 focus:ring-fixla-500"
        />
        <span className="text-xs leading-relaxed text-gray-600">
          Lähetä minulle tarjouksia ja uutisia sähköpostiini.
        </span>
      </label>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        <span>ja</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Apple */}
      <button
        type="button"
        onClick={() => handleOAuth('apple')}
        disabled={busy !== null}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'apple' ? (
          <Spinner light />
        ) : (
          <>
            <AppleIcon />
            Jatka Applella
          </>
        )}
      </button>

      {/* Google */}
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={busy !== null}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'google' ? (
          <Spinner />
        ) : (
          <>
            <GoogleIcon />
            Jatka Googlella
          </>
        )}
      </button>

      {/* Other options */}
      {!showEmail ? (
        <button
          type="button"
          onClick={() => setShowEmail(true)}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 px-4 text-sm font-semibold text-white transition hover:bg-fixla-700"
        >
          Muut vaihtoehdot
        </button>
      ) : (
        <form onSubmit={handleEmailSignUp} className="space-y-3 border-t border-gray-100 pt-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nimi"
            autoComplete="name"
            required
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Sähköposti"
            autoComplete="email"
            required
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
          />
          <PasswordInput
            value={password}
            onChange={setPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
            placeholder="Salasana"
            autoComplete="new-password"
          />
          <button
            type="submit"
            disabled={busy !== null}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 px-4 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {busy === 'email' ? <Spinner light /> : 'Luo tili'}
          </button>
        </form>
      )}

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function SigninForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleOAuth,
  handleSignIn,
  busy,
  error,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  handleOAuth: (p: 'google' | 'apple') => void;
  handleSignIn: (e: React.FormEvent) => void;
  busy: null | 'google' | 'apple' | 'email';
  error: string | null;
}) {
  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        onClick={() => handleOAuth('apple')}
        disabled={busy !== null}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'apple' ? (
          <Spinner light />
        ) : (
          <>
            <AppleIcon /> Jatka Applella
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={busy !== null}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy === 'google' ? (
          <Spinner />
        ) : (
          <>
            <GoogleIcon /> Jatka Googlella
          </>
        )}
      </button>

      <div className="my-3 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        <span>tai</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSignIn} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Sähköposti"
          autoComplete="email"
          required
          className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
        />
        <PasswordInput
          value={password}
          onChange={setPassword}
          show={showPassword}
          toggle={() => setShowPassword(!showPassword)}
          placeholder="Salasana"
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={busy !== null}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 px-4 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {busy === 'email' ? <Spinner light /> : 'Kirjaudu'}
        </button>
      </form>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  toggle,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        minLength={6}
        className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={show ? 'Piilota salasana' : 'Näytä salasana'}
        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
      >
        {show ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M2.1 3.51 3.51 2.1l18.39 18.39-1.41 1.41-3.18-3.18A11.7 11.7 0 0 1 12 19.5c-5 0-9.27-3.11-11-7.5a11.7 11.7 0 0 1 4.18-5.34L2.1 3.51Zm5.93 5.93A5 5 0 0 0 12 17c.66 0 1.29-.13 1.87-.36l-1.49-1.5a3 3 0 0 1-3.52-3.52L7.03 9.44ZM12 7a5 5 0 0 1 5 5c0 .58-.1 1.13-.28 1.65l2.92 2.92A11.7 11.7 0 0 0 23 12c-1.73-4.39-6-7.5-11-7.5-1.43 0-2.79.27-4.04.74l2.4 2.4C10.92 7.1 11.45 7 12 7Zm0 3a2 2 0 0 1 2 2l-.05.34L11.66 10A2 2 0 0 1 12 10Z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <div
      className={`h-4 w-4 animate-spin rounded-full border-2 ${
        light ? 'border-white/40 border-t-white' : 'border-gray-300 border-t-gray-600'
      }`}
    />
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M16.36 12.4c-.02-2.18 1.78-3.23 1.86-3.28-1.02-1.49-2.6-1.7-3.16-1.72-1.34-.14-2.62.79-3.3.79-.69 0-1.74-.77-2.86-.75-1.47.02-2.83.86-3.59 2.17-1.54 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.21 1.11-.05 1.52-.71 2.86-.71 1.33 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.36-3.54ZM14.2 5.86c.61-.74 1.02-1.77.91-2.79-.88.04-1.94.59-2.57 1.33-.57.65-1.07 1.7-.94 2.7.98.08 1.98-.5 2.6-1.24Z" />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AuthInner />
    </Suspense>
  );
}
