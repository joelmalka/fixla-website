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

type Duration = '15min' | '30min' | '60min';

const DURATIONS: { id: Duration; title: string; subtitle: string; price: number; highlight?: boolean }[] = [
  { id: '15min', title: '15 minuuttia', subtitle: 'Lyhyt lenkki', price: 9.99 },
  { id: '30min', title: '30 minuuttia', subtitle: 'Suosituin', price: 12.5, highlight: true },
  { id: '60min', title: '60 minuuttia', subtitle: 'Pidempi lenkki', price: 24.99 },
];

export default function DogWalkingConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [duration, setDuration] = useState<Duration>('30min');
  const [instructions, setInstructions] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');

  const selected = DURATIONS.find((d) => d.id === duration)!;
  const price = selected.price;

  const handleContinue = () => {
    patchOrderSession({
      serviceSlug: 'koiran-ulkoilutus',
      serviceConfig: { duration: selected.title },
      price,
      instructions,
      scheduledFor: scheduledForFrom(scheduleMode, date, time),
    });
    router.push('/kassa');
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Valitse kesto</h2>
        <div className="mt-3 grid gap-3">
          {DURATIONS.map((d) => (
            <OptionCard
              key={d.id}
              selected={duration === d.id}
              onSelect={() => setDuration(d.id)}
              title={d.title}
              subtitle={d.subtitle}
              price={d.price}
              highlight={d.highlight}
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
        placeholder="Koiran nimi, rotu, erityistarpeet"
      />

      <StickyTotal price={price} onContinue={handleContinue} />
    </div>
  );
}
