'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { patchOrderSession } from '@/lib/orderSession';
import {
  InstructionsField,
  ScheduleBlock,
  ScheduleMode,
  StickyTotal,
  Toggle,
  scheduledForFrom,
  useSchedule,
} from './configShared';

type Cars = 1 | 2;

// Flat all-inclusive prices — no service fee at checkout (see NO_SERVICE_FEE_SLUGS)
const BASE_BY_CARS: Record<Cars, number> = {
  1: 39.9,
  2: 74.9,
};

export default function TireChangeConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [cars, setCars] = useState<Cars>(1);
  const [pressure, setPressure] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');

  const price = useMemo(
    () => Math.round((BASE_BY_CARS[cars] + (pressure ? cars * 5 : 0)) * 100) / 100,
    [cars, pressure],
  );

  const handleContinue = () => {
    // Same format as the mobile app — the worker app reads cars + pressure check from this
    // to show the job details and calculate the worker's fixed payout
    const pressureNote = pressure ? '\n\n✅ Rengaspaineiden tarkistus / Tire pressure check included' : '';
    const base = `${cars === 1 ? '1 car' : '2 cars'} - Worker brings all tools${pressureNote}`;
    const fullInstructions = instructions.trim()
      ? `${base}\n\nExtra instructions: ${instructions.trim()}`
      : base;

    patchOrderSession({
      serviceSlug: 'renkaiden-vaihto',
      serviceConfig: {
        cars,
        addOns: { pressure },
        duration: `${cars} auto${cars === 1 ? '' : 'a'}`,
      },
      price,
      instructions: fullInstructions,
      scheduledFor: scheduledForFrom(scheduleMode, date, time),
    });
    router.push('/kassa');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Autojen määrä</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <CarsCard
            selected={cars === 1}
            onSelect={() => setCars(1)}
            title="1 auto"
            price={BASE_BY_CARS[1]}
          />
          <CarsCard
            selected={cars === 2}
            onSelect={() => setCars(2)}
            title="2 autoa"
            price={BASE_BY_CARS[2]}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">Lisäpalvelut</h2>
        <div className="mt-3 space-y-2">
          <Toggle
            on={pressure}
            onToggle={() => setPressure((v) => !v)}
            title="Rengaspaineiden tarkistus"
            subtitle="5€ / auto"
          />
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

      <InstructionsField value={instructions} onChange={setInstructions} />

      <StickyTotal price={price} onContinue={handleContinue} />
    </div>
  );
}

function CarsCard({
  selected,
  onSelect,
  title,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  price: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-2xl border bg-white px-4 py-4 text-left transition ${
        selected
          ? 'border-fixla-600 ring-2 ring-fixla-600/20'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <p className="text-base font-bold text-gray-900">{title}</p>
      <p className="mt-2 text-sm font-semibold text-gray-900">{price.toFixed(2)}€</p>
    </button>
  );
}
