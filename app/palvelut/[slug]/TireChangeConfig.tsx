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

const BASE_BY_CARS: Record<Cars, number> = {
  1: 33,
  2: 55,
};

export default function TireChangeConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [cars, setCars] = useState<Cars>(1);
  const [pressure, setPressure] = useState(false);
  const [grease, setGrease] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');

  const price = useMemo(() => {
    let addOns = 0;
    if (pressure && grease) addOns = cars * 8;
    else if (pressure || grease) addOns = cars * 5;
    return BASE_BY_CARS[cars] + addOns;
  }, [cars, pressure, grease]);

  const handleContinue = () => {
    patchOrderSession({
      serviceSlug: 'renkaiden-vaihto',
      serviceConfig: {
        cars,
        addOns: { pressure, grease },
        duration: `${cars} auto${cars === 1 ? '' : 'a'}`,
      },
      price,
      instructions,
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
        <p className="mt-1 text-sm text-gray-600">Molemmat yhdessä −2€/auto.</p>
        <div className="mt-3 space-y-2">
          <Toggle
            on={pressure}
            onToggle={() => setPressure((v) => !v)}
            title="Rengaspaineiden tarkistus"
            subtitle="5€ / auto"
          />
          <Toggle
            on={grease}
            onToggle={() => setGrease((v) => !v)}
            title="Pulttien rasvaus"
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
