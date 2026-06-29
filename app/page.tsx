'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  isInServiceArea,
  isInServiceAreaFromPlace,
  SERVICE_AREA_CITIES,
} from '@/lib/serviceArea';
import AddressAutocomplete, { SelectedPlace } from '@/components/AddressAutocomplete';
import { writeOrderSession } from '@/lib/orderSession';
import { readPreferredAddress, writePreferredAddress } from '@/lib/preferredAddress';
import { supabase } from '@/lib/supabase';
import HomeHeroGrid from '@/components/HomeHeroGrid';
import AddressDetailsModal, { AddressDetails } from '@/components/AddressDetailsModal';

type SavedAddress = {
  id: string;
  label: string;
  address_line_1: string;
  city: string;
  postal_code: string;
  country: string | null;
  is_primary: boolean;
};

export default function LandingPage() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pendingCity, setPendingCity] =
    useState<ReturnType<typeof isInServiceArea>['city']>(undefined);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  // Hydrate the input from the last address the user used on this device
  useEffect(() => {
    const pref = readPreferredAddress();
    if (pref?.address) {
      setAddress(pref.address);
      setSelectedPlace({
        formattedAddress: pref.address,
        city: pref.city ?? null,
        postalCode: pref.postalCode ?? null,
        country: 'FI',
        streetNumber: null,
        route: null,
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return;
      setSignedIn(true);
      const { data: rows } = await supabase
        .from('customer_addresses')
        .select('id, label, address_line_1, city, postal_code, country, is_primary')
        .eq('customer_id', data.session.user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });
      if (!active || !rows) return;
      setSavedAddresses(rows as SavedAddress[]);
    });
    return () => {
      active = false;
    };
  }, []);

  const pickSaved = (a: SavedAddress) => {
    const parts = [a.address_line_1, [a.postal_code, a.city].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ');
    setAddress(parts);
    setSelectedPlace({
      formattedAddress: parts,
      city: a.city,
      postalCode: a.postal_code,
      // Saved addresses store "Finland" but the service-area check expects ISO "FI"
      country: 'FI',
      streetNumber: null,
      route: null,
    });
    setError('');
  };

  const proceedToServices = (details: AddressDetails | null) => {
    const trimmed = address.trim();
    const payload = {
      address: trimmed,
      city: pendingCity,
      postalCode: selectedPlace?.postalCode ?? null,
      country: selectedPlace?.country ?? 'FI',
      apartment: details?.apartment || null,
      floor: details?.floor || null,
    };
    writeOrderSession(payload);
    writePreferredAddress(payload);
    router.push('/palvelut');
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = address.trim();
    if (!trimmed) {
      setError('Anna osoitteesi jatkaaksesi.');
      return;
    }

    // Prefer structured Google data when available; fall back to text match.
    const check = selectedPlace
      ? isInServiceAreaFromPlace({
          city: selectedPlace.city,
          postalCode: selectedPlace.postalCode,
          country: selectedPlace.country,
        })
      : isInServiceArea(trimmed);

    if (!check.ok) {
      setError(
        `Osoitteesi näyttää olevan palvelualueemme ulkopuolella. Palvelemme tällä hetkellä: ${SERVICE_AREA_CITIES.join(
          ', '
        )}.`
      );
      return;
    }

    setPendingCity(check.city);
    setDetailsOpen(true);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-fixla-600">Fixla</h1>
          {signedIn ? (
            <button
              type="button"
              onClick={() => router.push('/tilaukset')}
              className="text-sm font-semibold text-gray-700 hover:text-fixla-700"
            >
              Tilaukseni
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/kirjaudu?mode=signin')}
              className="text-sm font-semibold text-gray-700 hover:text-fixla-700"
            >
              Kirjaudu sisään
            </button>
          )}
        </div>
      </header>

      {/* Mobile image band */}
      <div className="md:hidden">
        <HomeHeroGrid variant="mobile" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-8 pb-12 md:px-6 md:pt-16 md:pb-20">
        <div className="md:grid md:grid-cols-2 md:items-center md:gap-12">
          {/* Left: text + form */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              Kotipalvelut kätevästi luonasi
            </h2>
            <p className="mt-4 text-base text-gray-600 md:text-lg">
              Mihin osoitteeseen tarvitset apua?
            </p>

            {signedIn && savedAddresses.length > 0 ? (
              <div className="mx-auto mt-6 w-full max-w-xl md:mx-0">
                <p className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Tallennetut osoitteet
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {savedAddresses.map((a) => {
                    const formatted = `${a.address_line_1}, ${a.postal_code} ${a.city}`;
                    const isSelected = address === formatted;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => pickSaved(a)}
                        className={`group inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? 'border-fixla-600 bg-fixla-50 text-fixla-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-fixla-600">
                          <path
                            fillRule="evenodd"
                            d="M11.54 22.351A1 1 0 0 0 12 22.5a1 1 0 0 0 .46-.149c4.18-2.66 8.04-7.16 8.04-12.351a8.5 8.5 0 1 0-17 0c0 5.191 3.86 9.691 8.04 12.351ZM12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="flex flex-col items-start">
                          <span className="flex items-center gap-1.5 text-xs font-bold">
                            {a.label}
                            {a.is_primary ? (
                              <span className="rounded-full bg-fixla-100 px-1.5 py-px text-[9px] font-bold uppercase text-fixla-700">
                                Ensisijainen
                              </span>
                            ) : null}
                          </span>
                          <span className="max-w-[16rem] truncate text-[11px] text-gray-500">
                            {a.address_line_1}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 px-1 text-[11px] text-gray-500">
                  Tai kirjoita uusi osoite alle.
                </p>
              </div>
            ) : null}

            <form
              onSubmit={handleContinue}
              className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3 sm:flex-row md:mx-0"
            >
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.54 22.351A1 1 0 0 0 12 22.5a1 1 0 0 0 .46-.149c4.18-2.66 8.04-7.16 8.04-12.351a8.5 8.5 0 1 0-17 0c0 5.191 3.86 9.691 8.04 12.351ZM12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <AddressAutocomplete
                  value={address}
                  onChange={(text) => {
                    setAddress(text);
                    setError('');
                    // If user edits after selecting, drop the structured place
                    // so we re-validate from text.
                    if (selectedPlace && text !== selectedPlace.formattedAddress) {
                      setSelectedPlace(null);
                    }
                  }}
                  onPlaceSelected={(place) => {
                    setSelectedPlace(place);
                    setError('');
                  }}
                  placeholder="Esim. Mannerheimintie 10, Helsinki"
                  autoFocus
                  inputClassName="h-14 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-base text-gray-900 placeholder-gray-400 outline-none transition focus:border-fixla-600 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="h-14 rounded-2xl bg-fixla-600 px-8 text-base font-semibold text-white transition hover:bg-fixla-700 active:scale-[0.99]"
              >
                Jatka
              </button>
            </form>

            {error ? (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                Saatavilla: {SERVICE_AREA_CITIES.join(', ')}
              </p>
            )}
          </div>

          {/* Right: animated photo grid (desktop only) */}
          <div className="hidden md:block">
            <HomeHeroGrid variant="desktop" />
          </div>
        </div>
      </section>

      {/* Feature row */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-3">
          <Feature
            title="Hinta heti tiedossa"
            body="Näe lopullinen hinta jo ennen tilausta — ei piilokuluja."
          />
          <Feature
            title="Luotettavat tekijät"
            body="Kaikki tekijät tarkastettu. Vakuutukset ja Y-tunnukset hoidettu."
          />
          <Feature
            title="Tilaa minuuteissa"
            body="Valitse palvelu, ajankohta ja maksa — tehty."
          />
        </div>
      </section>

      <AddressDetailsModal
        open={detailsOpen}
        baseAddress={address.trim()}
        onClose={() => {
          setDetailsOpen(false);
          proceedToServices(null);
        }}
        onSave={(details) => {
          setDetailsOpen(false);
          proceedToServices(details);
        }}
      />

      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 py-8 text-sm text-gray-500 md:flex-row">
          <p>© {new Date().getFullYear()} Fixla Oy</p>
          <p>teamfixla@gmail.com · +358 45 156 7778</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{body}</p>
    </div>
  );
}
