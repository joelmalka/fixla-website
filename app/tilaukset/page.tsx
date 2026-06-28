'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import CustomerTabBar from '@/components/CustomerTabBar';
import DesktopNav from '@/components/DesktopNav';
import FixlaLogo from '@/components/FixlaLogo';

type OrderRow = {
  id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  location: string | null;
  created_at: string;
  rating: number | null;
  services: { name: string | null } | null;
};

const STATUS_FI: Record<OrderRow['status'], string> = {
  pending: 'Odottaa',
  accepted: 'Hyväksytty',
  in_progress: 'Käynnissä',
  completed: 'Valmis',
  cancelled: 'Peruutettu',
};

const STATUS_COLOR: Record<OrderRow['status'], string> = {
  pending: 'bg-[#EAB308]/15 text-[#A16207]',
  accepted: 'bg-[#3B82F6]/15 text-[#1D4ED8]',
  in_progress: 'bg-[#F97316]/15 text-[#C2410C]',
  completed: 'bg-[#16A34A]/15 text-[#15803D]',
  cancelled: 'bg-[#EF4444]/15 text-[#B91C1C]',
};

const SERVICE_FI: Record<string, string> = {
  Cleaning: 'Siivous',
  'Window Washing': 'Ikkunoiden pesu',
  'Tire Change': 'Renkaiden vaihto',
  'Car Interior Cleaning': 'Auton sisäpesu',
  'Dog Walking': 'Koiran ulkoilutus',
  'Furniture Assembly': 'Huonekalujen kokoaminen',
  'Lawn Mowing': 'Nurmikon leikkaus',
  'Fence Washing': 'Aidan pesu',
  'Fence Painting': 'Aidan maalaus',
  'Snow Work': 'Lumityöt',
  'Other Work': 'Muu työ',
};

const ACTIVE_STATUSES: OrderRow['status'][] = ['pending', 'accepted', 'in_progress'];

export default function OrdersPage() {
  const [authState, setAuthState] = useState<'loading' | 'signed-out' | 'signed-in'>('loading');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        setAuthState('signed-out');
        return;
      }
      setAuthState('signed-in');
      setLoadingOrders(true);
      const { data: rows } = await supabase
        .from('orders')
        .select(
          `id, status, price, location, created_at, rating,
           services:service_id ( name )`,
        )
        .eq('customer_id', data.session.user.id)
        .order('created_at', { ascending: false });
      if (!active) return;
      if (rows) setOrders(rows as unknown as OrderRow[]);
      setLoadingOrders(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((o) => ACTIVE_STATUSES.includes(o.status)),
    [orders],
  );
  const pastOrders = useMemo(
    () => orders.filter((o) => !ACTIVE_STATUSES.includes(o.status)),
    [orders],
  );

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
        <SignedOut />
      ) : (
        <section className="mx-auto max-w-3xl px-5 pt-6">
          {/* Mobile-style header */}
          <div className="px-1 pb-2 pt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Tilaukset</h1>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length} {orders.length === 1 ? 'tilaus' : 'tilausta'}
            </p>
          </div>

          {loadingOrders ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <div className="text-5xl">📦</div>
              <h2 className="mt-3 text-lg font-bold text-gray-900">Ei tilauksia vielä</h2>
              <p className="mt-1 text-sm text-gray-600">Varatut palvelusi näkyvät täällä</p>
              <Link
                href="/palvelut"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
              >
                Selaa palveluita
              </Link>
            </div>
          ) : (
            <>
              {activeOrders.length > 0 && (
                <Section title="Aktiiviset tilaukset">
                  {activeOrders.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </Section>
              )}
              {pastOrders.length > 0 && (
                <Section title="Aiemmat tilaukset">
                  {pastOrders.map((o) => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </Section>
              )}
            </>
          )}
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

function SignedOut() {
  return (
    <section className="mx-auto max-w-md px-5 pt-12 text-center">
      <h1 className="text-2xl font-extrabold text-gray-900">Tilaukset</h1>
      <p className="mt-2 text-sm text-gray-600">Kirjaudu sisään nähdäksesi tilauksesi.</p>
      <Link
        href="/kirjaudu?next=/tilaukset"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-8 text-sm font-semibold text-white hover:bg-fixla-700"
      >
        Kirjaudu sisään
      </Link>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="px-1 pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h2>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function OrderCard({ order }: { order: OrderRow }) {
  const serviceName = order.services?.name
    ? (SERVICE_FI[order.services.name] ?? order.services.name)
    : 'Palvelu';
  const dateText = new Date(order.created_at).toLocaleDateString('fi-FI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-gray-900">{serviceName}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{dateText}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_COLOR[order.status]}`}
        >
          {STATUS_FI[order.status]}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="truncate text-sm text-gray-600">📍 {order.location ?? '—'}</p>
        <p className="shrink-0 text-base font-bold text-gray-900">{order.price.toFixed(2)}€</p>
      </div>
      {order.status === 'completed' && order.rating ? (
        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          <span className="text-sm">{'⭐'.repeat(order.rating)}</span>
          <span className="text-xs text-gray-500">Arvosteltu</span>
        </div>
      ) : null}
    </li>
  );
}
