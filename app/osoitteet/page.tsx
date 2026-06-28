'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import FixlaLogo from '@/components/FixlaLogo';
import DesktopNav from '@/components/DesktopNav';
import CustomerTabBar from '@/components/CustomerTabBar';
import AddressAutocomplete, { SelectedPlace } from '@/components/AddressAutocomplete';
import {
  SERVICE_AREA_CITIES,
  isInServiceAreaFromPlace,
  ServiceAreaCity,
} from '@/lib/serviceArea';
import { writePreferredAddress } from '@/lib/preferredAddress';
import { patchOrderSession } from '@/lib/orderSession';

type Address = {
  id: string;
  label: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  postal_code: string;
  country: string | null;
  is_primary: boolean;
  is_service_available: boolean;
};

type LabelType = 'Koti' | 'Työ';

export default function AddressesPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // form
  const [labelType, setLabelType] = useState<LabelType>('Koti');
  const [address, setAddress] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      await refresh(data.session.user.id);
    });
    return () => {
      active = false;
    };
  }, []);

  const refresh = async (uid: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('customer_addresses')
      .select('id, label, address_line_1, address_line_2, city, postal_code, country, is_primary, is_service_available')
      .eq('customer_id', uid)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });
    if (data) {
      setAddresses((data as Address[]).filter((a) => a.is_service_available !== false));
    }
    setLoading(false);
  };

  const nextLabel = (type: LabelType): string => {
    const taken = addresses.filter((a) => a.label.startsWith(type)).length;
    return taken === 0 ? type : `${type}${taken + 1}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!userId) return;
    if (!selectedPlace) {
      setSubmitError('Valitse osoite ehdotuksista');
      return;
    }
    const check = isInServiceAreaFromPlace({
      city: selectedPlace.city,
      postalCode: selectedPlace.postalCode,
      country: selectedPlace.country,
    });
    if (!check.ok) {
      setSubmitError(
        `Osoite on palvelualueemme ulkopuolella. Palvelemme: ${SERVICE_AREA_CITIES.join(', ')}.`,
      );
      return;
    }
    setSubmitting(true);
    const isPrimary = addresses.length === 0;
    const { error } = await supabase.from('customer_addresses').insert({
      customer_id: userId,
      label: nextLabel(labelType),
      address_line_1: selectedPlace.formattedAddress ?? address.trim(),
      address_line_2: null,
      city: (selectedPlace.city as ServiceAreaCity | undefined) ?? check.city,
      postal_code: selectedPlace.postalCode ?? '',
      country: 'Finland',
      is_primary: isPrimary,
      is_service_available: true,
    });
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    setAdding(false);
    setAddress('');
    setSelectedPlace(null);
    await refresh(userId);
  };

  const setPrimary = async (id: string) => {
    if (!userId) return;
    await supabase.from('customer_addresses').update({ is_primary: false }).eq('customer_id', userId);
    await supabase.from('customer_addresses').update({ is_primary: true }).eq('id', id);
    const picked = addresses.find((a) => a.id === id);
    if (picked) {
      const formatted = [
        picked.address_line_1,
        [picked.postal_code, picked.city].filter(Boolean).join(' '),
      ]
        .filter(Boolean)
        .join(', ');
      const next = {
        address: formatted,
        city: (picked.city as ServiceAreaCity | undefined),
        postalCode: picked.postal_code || null,
        country: 'FI',
        apartment: null,
        floor: null,
      };
      writePreferredAddress(next);
      patchOrderSession(next);
    }
    await refresh(userId);
  };

  const remove = async (id: string) => {
    if (!userId) return;
    if (!window.confirm('Poistetaanko osoite?')) return;
    await supabase.from('customer_addresses').delete().eq('id', id);
    await refresh(userId);
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
          <h1 className="text-base font-bold text-gray-900">Osoitteet</h1>
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
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Omat osoitteeni</h1>

          {/* Service area info */}
          <div className="mt-4 rounded-2xl bg-fixla-50 px-4 py-3 ring-1 ring-fixla-600/20">
            <p className="text-xs font-bold uppercase tracking-wider text-fixla-700">Palvelualue</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SERVICE_AREA_CITIES.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-fixla-700 ring-1 ring-fixla-600/20"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-fixla-700/80">
              Osoitteita voi lisätä vain palvelualueeltamme.
            </p>
          </div>

          {/* Add toggle */}
          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-fixla-600 text-sm font-semibold text-white hover:bg-fixla-700"
            >
              <PlusIcon /> Lisää uusi osoite
            </button>
          ) : (
            <form onSubmit={handleSave} className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tyyppi</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['Koti', 'Työ'] as LabelType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setLabelType(t)}
                      className={`h-11 rounded-xl border text-sm font-semibold transition ${
                        labelType === t
                          ? 'border-fixla-600 bg-fixla-50 text-fixla-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-gray-500">Tallennetaan nimellä: {nextLabel(labelType)}</p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Osoite</p>
                <div className="mt-2">
                  <AddressAutocomplete
                    value={address}
                    onChange={(text) => {
                      setAddress(text);
                      if (selectedPlace && text !== selectedPlace.formattedAddress) {
                        setSelectedPlace(null);
                      }
                    }}
                    onPlaceSelected={(p) => setSelectedPlace(p)}
                    placeholder="Esim. Mannerheimintie 10, Helsinki"
                    inputClassName="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
                  />
                </div>
              </div>

              {submitError ? (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                  {submitError}
                </div>
              ) : null}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setSubmitError(null);
                  }}
                  className="h-12 flex-1 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Peruuta
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedPlace}
                  className="h-12 flex-[2] rounded-2xl bg-fixla-600 text-sm font-semibold text-white hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {submitting ? (
                    <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    'Tarkista ja tallenna'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          {loading ? (
            <div className="mt-6">
              <Loading />
            </div>
          ) : addresses.length === 0 && !adding ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center">
              <div className="text-4xl">📍</div>
              <h2 className="mt-2 text-base font-bold text-gray-900">Ei vielä osoitteita</h2>
              <p className="mt-1 text-sm text-gray-600">Lisää ensimmäinen osoitteesi yltä.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {addresses.map((a) => (
                <li key={a.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{a.label}</h3>
                        {a.is_primary ? (
                          <span className="rounded-full bg-fixla-100 px-2 py-0.5 text-[10px] font-bold uppercase text-fixla-700">
                            Ensisijainen
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-700">{a.address_line_1}</p>
                      {a.address_line_2 ? (
                        <p className="text-sm text-gray-700">{a.address_line_2}</p>
                      ) : null}
                      <p className="text-xs text-gray-500">
                        {a.postal_code} {a.city}, {a.country ?? 'Suomi'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    {!a.is_primary ? (
                      <button
                        type="button"
                        onClick={() => setPrimary(a.id)}
                        className="h-9 rounded-full bg-gray-100 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                      >
                        Aseta ensisijaiseksi
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      className="h-9 rounded-full bg-red-50 px-4 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Poista
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <CustomerTabBar />
    </main>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[20vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-fixla-600" />
    </div>
  );
}

function SignedOut() {
  return (
    <section className="mx-auto max-w-md px-5 pt-12 text-center">
      <h1 className="text-2xl font-extrabold text-gray-900">Osoitteet</h1>
      <p className="mt-2 text-sm text-gray-600">Kirjaudu sisään hallinnoidaksesi osoitteitasi.</p>
      <Link
        href="/kirjaudu?next=/osoitteet"
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z" />
    </svg>
  );
}
