'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { patchOrderSession } from '@/lib/orderSession';
import { ScheduleBlock, ScheduleMode, scheduledForFrom, useSchedule } from './configShared';

type Pricing = '2hours' | '3hours' | 'custom';

const FIXED_PRICES: Record<Exclude<Pricing, 'custom'>, number> = {
  '2hours': 74.99,
  '3hours': 114.99,
};

const CUSTOM_HOUR_OPTIONS = [1, 4, 5, 6] as const;

/**
 * Pricing model mirrors the React Native CleaningScreen:
 * - 1h: 39.99€
 * - 2h: 74.99€ (base)
 * - 3h: 114.99€ (fixed promo)
 * - 4h+: 74.99 + (hours - 2) * 40
 */
function priceFor(option: Pricing, customHours: number): number {
  if (option === 'custom') {
    if (customHours === 1) return 39.99;
    return 74.99 + (customHours - 2) * 40;
  }
  return FIXED_PRICES[option];
}

function durationLabel(option: Pricing, customHours: number): string {
  if (option === 'custom') return `${customHours} h`;
  return option === '2hours' ? '2 h' : '3 h';
}

export default function CleaningConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [pricing, setPricing] = useState<Pricing>('2hours');
  const [customHours, setCustomHours] = useState<number>(4);
  const [instructions, setInstructions] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');

  const price = useMemo(() => priceFor(pricing, customHours), [pricing, customHours]);

  const handleContinue = () => {
    patchOrderSession({
      serviceSlug: 'siivous',
      serviceConfig: {
        pricing,
        customHours: pricing === 'custom' ? customHours : null,
        duration: durationLabel(pricing, customHours),
      },
      price,
      instructions,
      scheduledFor: scheduledForFrom(scheduleMode, date, time),
    });
    router.push('/kassa');
  };

  return (
    <div className="space-y-5">
      {/* Pricing options */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Valitse kesto</h2>
        <p className="mt-1 text-sm text-gray-600">
          Hinta heti tiedossa. Lisämaksuja ei tule.
        </p>
        <div className="mt-4 grid gap-3">
          <PricingCard
            selected={pricing === '2hours'}
            onSelect={() => setPricing('2hours')}
            title="2 tuntia"
            subtitle="Perussiivous · suosittu"
            price={FIXED_PRICES['2hours']}
          />
          <PricingCard
            selected={pricing === '3hours'}
            onSelect={() => setPricing('3hours')}
            title="3 tuntia"
            subtitle="Suursiivous"
            price={FIXED_PRICES['3hours']}
            highlight
          />
          <PricingCard
            selected={pricing === 'custom'}
            onSelect={() => setPricing('custom')}
            title="Muu kesto"
            subtitle={
              pricing === 'custom'
                ? `${customHours} tuntia`
                : '1 t tai 4–6 t'
            }
            price={pricing === 'custom' ? price : undefined}
          />

          {pricing === 'custom' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tunnit
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {CUSTOM_HOUR_OPTIONS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCustomHours(h)}
                    className={`h-11 rounded-xl border text-sm font-semibold transition ${
                      customHours === h
                        ? 'border-fixla-600 bg-fixla-50 text-fixla-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {h} h
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ScheduleBlock
        mode={scheduleMode}
        setMode={setScheduleMode}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
      />

      {/* Extra instructions */}
      <div>
        <label className="block text-sm font-semibold text-gray-900">
          Lisätiedot (valinnainen)
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Esim. kerros, koodi, erityistoiveet"
          rows={4}
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
        />
      </div>

      {/* Sticky bottom price + CTA */}
      <div className="sticky bottom-20 z-20 -mx-5 border-t border-gray-100 bg-white/95 px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur md:bottom-6 md:mx-0 md:rounded-2xl md:border md:border-gray-200 md:px-6 md:py-5 md:shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Hinta</p>
            <p className="text-2xl font-extrabold text-gray-900">{price.toFixed(2)}€</p>
            <p className="text-xs text-gray-500">{durationLabel(pricing, customHours)}</p>
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="h-12 shrink-0 rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
          >
            Jatka kassalle
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  selected,
  onSelect,
  title,
  subtitle,
  price,
  highlight,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  price?: number;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center justify-between gap-4 rounded-2xl border bg-white px-4 py-4 text-left transition ${
        selected
          ? 'border-fixla-600 ring-2 ring-fixla-600/20'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="min-w-0">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>
      {typeof price === 'number' ? (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
            highlight
              ? 'bg-fixla-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {price.toFixed(2)}€
        </span>
      ) : null}
    </button>
  );
}
