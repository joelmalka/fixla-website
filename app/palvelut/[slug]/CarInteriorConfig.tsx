'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { patchOrderSession } from '@/lib/orderSession';
import {
  InstructionsField,
  OptionCard,
  ScheduleBlock,
  ScheduleMode,
  StickyTotal,
  scheduledForFrom,
  useSchedule,
} from './configShared';

type Pkg = 'standard' | 'pet' | 'deluxe';

const PACKAGES: { id: Pkg; title: string; subtitle: string; price: number; highlight?: boolean }[] = [
  {
    id: 'standard',
    title: 'Vakio sisäpesu',
    subtitle: 'Imurointi, pyyhinnät, ikkunat sisältä',
    price: 68.99,
  },
  {
    id: 'pet',
    title: 'Lemmikkipaketti',
    subtitle: 'Karvojen poisto + syväpuhdistus',
    price: 93.99,
    highlight: true,
  },
  {
    id: 'deluxe',
    title: 'Deluxe syväpesu',
    subtitle: 'Penkkien ja mattojen syväpesu',
    price: 118.99,
  },
];

export default function CarInteriorConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [instructions, setInstructions] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');

  const selected = PACKAGES.find((p) => p.id === pkg);
  const price = selected?.price ?? 0;

  const handleContinue = () => {
    if (!selected) return;
    patchOrderSession({
      serviceSlug: 'auton-sisapesu',
      serviceConfig: { package: selected.id, duration: selected.title },
      price,
      instructions,
      scheduledFor: scheduledForFrom(scheduleMode, date, time),
    });
    router.push('/kassa');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Valitse paketti</h2>
        <div className="mt-3 grid gap-3">
          {PACKAGES.map((p) => (
            <OptionCard
              key={p.id}
              selected={pkg === p.id}
              onSelect={() => setPkg(p.id)}
              title={p.title}
              subtitle={p.subtitle}
              price={p.price}
              highlight={p.highlight}
            />
          ))}
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
        placeholder="Auton merkki, malli, sijainti"
      />

      <StickyTotal price={price} onContinue={handleContinue} disabled={!selected} />
    </div>
  );
}
