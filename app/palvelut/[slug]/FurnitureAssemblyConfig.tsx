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

type Size = 'small' | 'medium' | 'large' | 'xlarge';

const SIZES: { id: Size; title: string; subtitle: string; price: number }[] = [
  { id: 'small', title: 'Pieni', subtitle: 'Esim. yöpöytä, jakkara', price: 29 },
  { id: 'medium', title: 'Keskikokoinen', subtitle: 'Lipasto, kirjahylly', price: 59 },
  { id: 'large', title: 'Iso', subtitle: 'Sänky, ruokapöytä', price: 99 },
  { id: 'xlarge', title: 'Erittäin iso', subtitle: 'Vaatehuone, sohva', price: 179 },
];

export default function FurnitureAssemblyConfig() {
  const router = useRouter();
  const { defaultDate } = useSchedule();
  const [qty, setQty] = useState<Record<Size, number>>({
    small: 0,
    medium: 0,
    large: 0,
    xlarge: 0,
  });
  const [twoPerson, setTwoPerson] = useState(false);
  const [disassembly, setDisassembly] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');

  const price = useMemo(() => {
    let total = 0;
    for (const s of SIZES) total += qty[s.id] * s.price;
    if (twoPerson) total += 49;
    if (disassembly) total += 29;
    return total;
  }, [qty, twoPerson, disassembly]);

  const itemCount = useMemo(
    () => Object.values(qty).reduce((a, b) => a + b, 0),
    [qty],
  );

  const handleContinue = () => {
    if (itemCount === 0) return;
    patchOrderSession({
      serviceSlug: 'huonekalujen-kokoaminen',
      serviceConfig: {
        items: qty,
        twoPersonJob: twoPerson,
        disassembly,
        duration: `${itemCount} huonekalu${itemCount === 1 ? '' : 'a'}`,
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
        <h2 className="text-lg font-bold text-gray-900">Huonekalut</h2>
        <p className="mt-1 text-sm text-gray-600">Lisää montako huonekalua kokoat.</p>
        <div className="mt-3 space-y-2">
          {SIZES.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500">
                  {s.subtitle} · {s.price}€/kpl
                </p>
              </div>
              <QtyStepper value={qty[s.id]} onChange={(v) => setQty({ ...qty, [s.id]: v })} max={20} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900">Lisäpalvelut</h2>
        <div className="mt-3 space-y-2">
          <Toggle
            on={twoPerson}
            onToggle={() => setTwoPerson((v) => !v)}
            title="Kahden tekijän työ"
            subtitle="+49€ — isot ja painavat kohteet"
          />
          <Toggle
            on={disassembly}
            onToggle={() => setDisassembly((v) => !v)}
            title="Vanhan huonekalun purku"
            subtitle="+29€"
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

      <StickyTotal price={price} onContinue={handleContinue} disabled={itemCount === 0} />
    </div>
  );
}
