'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getServiceBySlug, ServiceMeta } from '@/lib/services';
import { readOrderSession, patchOrderSession, formatFullAddress } from '@/lib/orderSession';
import { reconcileAddress } from '@/lib/addressSync';
import { supabase } from '@/lib/supabase';
import CustomerTabBar from '@/components/CustomerTabBar';
import DesktopNav from '@/components/DesktopNav';
import FixlaLogo from '@/components/FixlaLogo';
import CleaningConfig from './CleaningConfig';
import ComingSoonConfig from './ComingSoonConfig';
import TireChangeConfig from './TireChangeConfig';
import CarInteriorConfig from './CarInteriorConfig';
import DogWalkingConfig from './DogWalkingConfig';
import FurnitureAssemblyConfig from './FurnitureAssemblyConfig';
import WindowWashingConfig from './WindowWashingConfig';
import PhotoEstimateConfig from './PhotoEstimateConfig';

export default function ServiceConfigPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const service = getServiceBySlug(slug);

  useEffect(() => {
    const session = readOrderSession();
    if (!session?.address) {
      router.replace('/');
      return;
    }
    if (!service) {
      router.replace('/palvelut');
      return;
    }
    patchOrderSession({ serviceSlug: service.slug });
    (async () => {
      const { data } = await supabase.auth.getSession();
      // Photo-estimate services need an authed user before showing the upload UI
      if (service.pricingType === 'photo-estimate' && !data.session) {
        router.replace(`/kirjaudu?next=/palvelut/${service.slug}`);
        return;
      }
      const reconciled = data.session
        ? await reconcileAddress(data.session.user.id, session)
        : session;
      setAddress(formatFullAddress(reconciled));
      setHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!hydrated || !service) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="flex flex-col items-center gap-3 px-5 py-4 md:hidden">
          <FixlaLogo size={50} />
        </div>
        <div className="mx-auto hidden max-w-5xl items-center justify-between gap-4 px-5 py-3 md:flex">
          <Link href="/palvelut" className="shrink-0">
            <FixlaLogo size={44} />
          </Link>
          <DesktopNav />
        </div>
      </header>

      {/* Body: stacked on mobile, 2-column on desktop */}
      <section className="mx-auto max-w-6xl px-0 pt-0 md:px-6 md:pt-8">
        <div className="md:grid md:grid-cols-5 md:gap-10">
          {/* Left column — service hero + meta */}
          <aside className="md:col-span-2">
            <div className="md:sticky md:top-6">
              <div className="relative h-44 w-full overflow-hidden md:h-[30rem] md:rounded-3xl">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 560px, 100vw"
                  quality={90}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-black/35" />
                <div className="absolute inset-0 flex items-start px-5 pt-5">
                  <div className="w-full">
                    <Link
                      href="/palvelut"
                      className="mb-3 inline-flex h-9 items-center gap-1 rounded-full bg-white/85 px-3 text-sm font-semibold text-gray-800 backdrop-blur-sm hover:bg-white"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                        <path
                          fillRule="evenodd"
                          d="M11.78 5.22a.75.75 0 0 1 0 1.06L6.81 11.25H21a.75.75 0 0 1 0 1.5H6.81l4.97 4.97a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Takaisin
                    </Link>
                    <h1 className="text-3xl font-extrabold text-white drop-shadow md:text-4xl">
                      {service.name}
                    </h1>
                    <p className="mt-1 text-sm text-white/90 md:text-base">{service.description}</p>
                  </div>
                </div>
              </div>

              {address ? (
                <div className="mt-4 px-5 md:px-0">
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs text-gray-700 ring-1 ring-gray-200">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-fixla-600">
                      <path
                        fillRule="evenodd"
                        d="M11.54 22.351A1 1 0 0 0 12 22.5a1 1 0 0 0 .46-.149c4.18-2.66 8.04-7.16 8.04-12.351a8.5 8.5 0 1 0-17 0c0 5.191 3.86 9.691 8.04 12.351ZM12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">{address}</span>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          {/* Right column — config form */}
          <div className="mt-6 px-5 md:col-span-3 md:mt-0 md:px-0">
            <ServiceBody service={service} />
          </div>
        </div>
      </section>

      <CustomerTabBar />
    </main>
  );
}

function ServiceBody({ service }: { service: ServiceMeta }) {
  if (service.pricingType === 'photo-estimate') {
    return <PhotoEstimateConfig service={service} />;
  }
  switch (service.slug) {
    case 'siivous':
      return <CleaningConfig />;
    case 'ikkunoiden-pesu':
      return <WindowWashingConfig />;
    case 'renkaiden-vaihto':
      return <TireChangeConfig />;
    case 'auton-sisapesu':
      return <CarInteriorConfig />;
    case 'koiran-ulkoilutus':
      return <DogWalkingConfig />;
    case 'huonekalujen-kokoaminen':
      return <FurnitureAssemblyConfig />;
    default:
      return <ComingSoonConfig service={service} />;
  }
}

