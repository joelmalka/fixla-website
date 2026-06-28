'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { patchOrderSession } from '@/lib/orderSession';
import {
  InstructionsField,
  QtyStepper,
  ScheduleBlock,
  ScheduleMode,
  StickyTotal,
  Toggle,
  scheduledForFrom,
  useSchedule,
} from './configShared';

type WindowType = 'small' | 'big' | 'grid' | 'side' | 'vent';

const WINDOW_TYPES: { id: WindowType; title: string; subtitle: string; price: number }[] = [
  { id: 'small', title: 'Pieni ikkuna', subtitle: 'Vakioikkuna', price: 9 },
  { id: 'big', title: 'Iso ikkuna', subtitle: 'Suuri ikkunapinta', price: 11 },
  { id: 'grid', title: 'Ristikko-ikkuna', subtitle: 'Pikkuruutuinen', price: 22 },
  { id: 'side', title: 'Sivuikkuna', subtitle: 'Kapea sivulasi', price: 6 },
  { id: 'vent', title: 'Tuuletusikkuna', subtitle: 'Pieni tuuletusluukku', price: 5 },
];

type Surface = 2 | 4 | 6 | 8;
const SURFACE_MULT: Record<Surface, number> = { 2: 0.7, 4: 1.0, 6: 1.4, 8: 1.8 };

export default function WindowWashingConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');
  const [qty, setQty] = useState<Record<WindowType, number>>({
    small: 0,
    big: 0,
    grid: 0,
    side: 0,
    vent: 0,
  });
  const [surface, setSurface] = useState<Surface>(4);
  const [tallCount, setTallCount] = useState(0);
  const [balcony, setBalcony] = useState(false);
  const [balconyPanels, setBalconyPanels] = useState(4);
  const [terrace, setTerrace] = useState(false);
  const [terracePanels, setTerracePanels] = useState(4);
  const [instructions, setInstructions] = useState('');

  const totalWindows = useMemo(
    () => Object.values(qty).reduce((a, b) => a + b, 0),
    [qty],
  );

  const price = useMemo(() => {
    let total = 0;
    for (const w of WINDOW_TYPES) {
      total += qty[w.id] * w.price * SURFACE_MULT[surface];
    }
    total += Math.min(tallCount, totalWindows) * 5;
    if (balcony) total += balconyPanels * 8;
    if (terrace) total += terracePanels * 10;
    return Math.round(total * 100) / 100;
  }, [qty, surface, tallCount, totalWindows, balcony, balconyPanels, terrace, terracePanels]);

  const handleContinue = () => {
    if (totalWindows === 0 && !balcony && !terrace) return;
    patchOrderSession({
      serviceSlug: 'ikkunoiden-pesu',
      serviceConfig: {
        windows: qty,
        surface,
        tallCount,
        balcony: balcony ? balconyPanels : 0,
        terrace: terrace ? terracePanels : 0,
        duration: `${totalWindows} ikkuna${totalWindows === 1 ? '' : 'a'}`,
      },
      price,
      instructions,
      scheduledFor: scheduledForFrom(scheduleMode, date, time),
    });
    router.push('/kassa');
  };

  const canContinue = totalWindows > 0 || balcony || terrace;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Ikkunatyypit</h2>
        <p className="mt-1 text-sm text-gray-600">Kerro montako kutakin tyyppiä.</p>
        <div className="mt-3 space-y-2">
          {WINDOW_TYPES.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{w.title}</p>
                <p className="text-xs text-gray-500">
                  {w.subtitle} · {w.price}€/kpl
                </p>
              </div>
              <QtyStepper value={qty[w.id]} onChange={(v) => setQty({ ...qty, [w.id]: v })} max={50} />
            </div>
          ))}
        </div>
      </div>

      {totalWindows > 0 ? (
        <>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pintojen määrä</h2>
            <p className="mt-1 text-sm text-gray-600">Kuinka monta lasipintaa per ikkuna pestään?</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {([2, 4, 6, 8] as Surface[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSurface(s)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition ${
                    surface === s
                      ? 'border-fixla-600 bg-fixla-50 text-fixla-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">Korkealla olevia ikkunoita</p>
              <p className="text-xs text-gray-500">+5€/kpl — yli 2 m korkeudella</p>
            </div>
            <QtyStepper value={tallCount} onChange={setTallCount} max={totalWindows} />
          </div>
        </>
      ) : null}

      <div>
        <h2 className="text-lg font-bold text-gray-900">Lasiparveke / -terassi</h2>
        <div className="mt-3 space-y-2">
          <Toggle
            on={balcony}
            onToggle={() => setBalcony((v) => !v)}
            title="Lasiparveke"
            subtitle="8€ / lasipaneeli"
          />
          {balcony ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-700">Paneelien määrä</p>
              <QtyStepper value={balconyPanels} onChange={setBalconyPanels} min={1} max={30} />
            </div>
          ) : null}
          <Toggle
            on={terrace}
            onToggle={() => setTerrace((v) => !v)}
            title="Lasiterassi"
            subtitle="10€ / lasipaneeli"
          />
          {terrace ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-700">Paneelien määrä</p>
              <QtyStepper value={terracePanels} onChange={setTerracePanels} min={1} max={30} />
            </div>
          ) : null}
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

      <InstructionsField
        value={instructions}
        onChange={setInstructions}
        placeholder="Esim. erityislasit, kerros, koodi"
      />

      <StickyTotal price={price} onContinue={handleContinue} disabled={!canContinue} />
    </div>
  );
}
