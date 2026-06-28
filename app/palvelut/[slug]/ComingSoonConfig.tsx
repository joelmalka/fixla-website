'use client';

import { ServiceMeta } from '@/lib/services';
import Link from 'next/link';

export default function ComingSoonConfig({ service }: { service: ServiceMeta }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-bold text-gray-900">Tulossa pian</h2>
      <p className="mt-2 text-sm text-gray-600">
        {service.name} on saatavilla mobiilisovelluksessa juuri nyt. Web-tilauslomake
        on tekeillä — tilaa toistaiseksi sovelluksen kautta.
      </p>
      <Link
        href="/palvelut"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white hover:bg-gray-800"
      >
        Valitse toinen palvelu
      </Link>
    </div>
  );
}
