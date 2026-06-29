'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICES, ServiceMeta } from '@/lib/services';
import {
  readOrderSession,
  writeOrderSession,
  patchOrderSession,
  formatFullAddress,
} from '@/lib/orderSession';
import { readPreferredAddress } from '@/lib/preferredAddress';
import { reconcileAddress } from '@/lib/addressSync';
import { supabase } from '@/lib/supabase';
import CustomerTabBar from '@/components/CustomerTabBar';
import DesktopNav from '@/components/DesktopNav';
import FixlaLogo from '@/components/FixlaLogo';
import CampaignBanner from '@/components/CampaignBanner';

export default function ServicesPage() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let session = readOrderSession();
    if (!session?.address) {
      // The cart session is cleared after an order completes. Rebuild it from
      // the last-used address so returning to Palvelut shows services instead
      // of bouncing to the home/address screen.
      const pref = readPreferredAddress();
      if (pref?.address) {
        session = {
          address: pref.address,
          city: pref.city,
          postalCode: pref.postalCode ?? null,
          country: pref.country ?? 'FI',
          apartment: pref.apartment ?? null,
          floor: pref.floor ?? null,
        };
        writeOrderSession(session);
      } else {
        router.replace('/');
        return;
      }
    }
    // If signed in, ensure the session uses their saved primary (or save the
    // typed one if they have nothing yet) BEFORE showing the address pill.
    const current = session;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const reconciled = data.session
        ? await reconcileAddress(data.session.user.id, current)
        : current;
      setAddress(formatFullAddress(reconciled));
      setHydrated(true);
    })();
  }, [router]);

  const handlePick = (service: ServiceMeta) => {
    patchOrderSession({ serviceSlug: service.slug });
    router.push(`/palvelut/${service.slug}`);
  };

  if (!hydrated) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <CampaignBanner />
      {/* Header: stacked on mobile, row on desktop */}
      <header className="border-b border-gray-100 bg-white">
        {/* Mobile: centered stack */}
        <div className="flex flex-col items-center gap-3 px-5 py-4 md:hidden">
          <FixlaLogo size={50} />
          <AddressPill address={address!} />
        </div>

        {/* Desktop: logo · address · nav */}
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/palvelut" className="shrink-0">
            <FixlaLogo size={44} />
          </Link>
          <AddressPill address={address!} />
          <DesktopNav />
        </div>
      </header>

      {/* Title */}
      <section className="mx-auto max-w-5xl px-4 pb-3 pt-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
          Valitse palvelu
        </h1>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} onPick={handlePick} />
          ))}
        </div>
      </section>

      <CustomerTabBar />
    </main>
  );
}

function AddressPill({ address }: { address: string }) {
  return (
    <Link
      href="/osoitteet"
      className="group inline-flex min-w-0 max-w-full items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm transition hover:bg-gray-200"
      title="Vaihda osoite"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0 text-fixla-600">
        <path
          fillRule="evenodd"
          d="M11.54 22.351A1 1 0 0 0 12 22.5a1 1 0 0 0 .46-.149c4.18-2.66 8.04-7.16 8.04-12.351a8.5 8.5 0 1 0-17 0c0 5.191 3.86 9.691 8.04 12.351ZM12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
          clipRule="evenodd"
        />
      </svg>
      <span className="truncate text-gray-800">{address}</span>
      <span className="shrink-0 text-xs text-fixla-700 group-hover:underline">Vaihda</span>
    </Link>
  );
}

function ServiceCard({
  service,
  onPick,
}: {
  service: ServiceMeta;
  onPick: (s: ServiceMeta) => void;
}) {
  const featured = !!service.featured;
  return (
    <button
      onClick={() => onPick(service)}
      className={`group relative w-full overflow-hidden text-left transition active:scale-[0.99] md:h-48 ${
        featured
          ? 'h-52 rounded-3xl border-2 border-fixla-500 shadow-lg shadow-fixla-500/30 md:rounded-3xl'
          : 'h-36 rounded-2xl shadow-md'
      }`}
    >
      <Image
        src={service.image}
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
        priority={featured}
      />

      {/* Dark overlay */}
      <div
        className={`absolute inset-0 ${
          featured ? 'bg-black/50' : 'bg-black/40'
        } transition group-hover:bg-black/55`}
      />

      {/* Featured badge */}
      {featured ? (
        <span className="absolute right-3 top-3 rounded-full bg-fixla-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          Suosittu
        </span>
      ) : null}

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-6">
        <h3
          className={`font-bold text-white drop-shadow md:text-2xl ${
            featured ? 'text-2xl' : 'text-xl'
          }`}
        >
          {service.name}
        </h3>
        <p
          className={`mt-1 text-white/85 md:text-sm ${
            featured ? 'text-sm' : 'text-xs'
          }`}
        >
          {service.description}
        </p>
      </div>

      {/* Book now arrow pill */}
      <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
        Tilaa nyt
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 1 1-1.06-1.06L13.94 12 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
  );
}
