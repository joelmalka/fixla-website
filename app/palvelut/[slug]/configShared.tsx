'use client';

import { useMemo, useState } from 'react';

export function InstructionsField({
  value,
  onChange,
  placeholder = 'Esim. kerros, koodi, erityistoiveet',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900">
        Lisätiedot (valinnainen)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={500}
        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
      />
    </div>
  );
}

export function StickyTotal({
  price,
  onContinue,
  disabled,
  ctaLabel = 'Jatka kassalle',
}: {
  price: number;
  onContinue: () => void;
  disabled?: boolean;
  ctaLabel?: string;
}) {
  return (
    <div className="sticky bottom-20 z-20 -mx-5 border-t border-gray-100 bg-white/95 px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur md:bottom-6 md:mx-0 md:rounded-2xl md:border md:border-gray-200 md:px-6 md:py-5 md:shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Hinta</p>
          <p className="text-2xl font-extrabold text-gray-900">{price.toFixed(2)}€</p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className="h-12 shrink-0 rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

export function OptionCard({
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
  subtitle?: string;
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
        {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {typeof price === 'number' ? (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
            highlight ? 'bg-fixla-600 text-white' : 'bg-gray-100 text-gray-900'
          }`}
        >
          {price.toFixed(2)}€
        </span>
      ) : null}
    </button>
  );
}

export function Toggle({
  on,
  onToggle,
  title,
  subtitle,
}: {
  on: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border bg-white px-4 py-4 text-left transition ${
        on ? 'border-fixla-600 ring-2 ring-fixla-600/20' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {subtitle ? <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p> : null}
      </div>
      <span
        className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition ${
          on ? 'bg-fixla-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition ${
            on ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
}

export type ScheduleMode = 'asap' | 'scheduled';

const WEEKDAY_HEADERS_FI = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
const MONTHS_FI_GEN = [
  'tammikuu',
  'helmikuu',
  'maaliskuu',
  'huhtikuu',
  'toukokuu',
  'kesäkuu',
  'heinäkuu',
  'elokuu',
  'syyskuu',
  'lokakuu',
  'marraskuu',
  'joulukuu',
];

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 9; h <= 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 21) slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function buildMonthGrid(year: number, month: number): (Date | null)[] {
  // Build a 6×7 grid starting on Monday
  const first = new Date(year, month, 1);
  // Mon=0, Sun=6
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  // Ensure 6 rows so calendar height is stable
  while (cells.length < 42) cells.push(null);
  return cells;
}

export function ScheduleBlock({
  mode,
  setMode,
  date,
  setDate,
  time,
  setTime,
}: {
  mode: ScheduleMode;
  setMode: (m: ScheduleMode) => void;
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = date ? parseIso(date) : null;
  const initialMonth = selected ?? today;

  const [viewMonth, setViewMonth] = useState({
    year: initialMonth.getFullYear(),
    month: initialMonth.getMonth(),
  });
  const [step, setStep] = useState<'date' | 'time'>('date');
  const [confirmed, setConfirmed] = useState(false);

  // When user toggles back into scheduled mode, restart at step 1
  const onScheduledClick = () => {
    setMode('scheduled');
    setStep('date');
    setConfirmed(false);
  };

  const handleEdit = () => {
    setConfirmed(false);
    setStep('date');
  };

  const cells = useMemo(
    () => buildMonthGrid(viewMonth.year, viewMonth.month),
    [viewMonth],
  );

  const monthLabel = `${MONTHS_FI_GEN[viewMonth.month]} ${viewMonth.year}`;
  const canGoBack =
    viewMonth.year > today.getFullYear() ||
    (viewMonth.year === today.getFullYear() && viewMonth.month > today.getMonth());

  const goPrevMonth = () => {
    setViewMonth((v) => {
      const m = v.month - 1;
      if (m < 0) return { year: v.year - 1, month: 11 };
      return { year: v.year, month: m };
    });
  };
  const goNextMonth = () => {
    setViewMonth((v) => {
      const m = v.month + 1;
      if (m > 11) return { year: v.year + 1, month: 0 };
      return { year: v.year, month: m };
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">Aikataulu</h2>
      <p className="mt-1 text-sm text-gray-600">Milloin haluat työn tehtävän?</p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMode('asap')}
          className={`rounded-2xl border bg-white px-4 py-4 text-left transition ${
            mode === 'asap'
              ? 'border-fixla-600 ring-2 ring-fixla-600/20'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-base font-bold text-gray-900">Heti</p>
          <p className="mt-0.5 text-xs text-gray-500">Ensimmäinen vapaa tekijä</p>
        </button>
        <button
          type="button"
          onClick={onScheduledClick}
          className={`rounded-2xl border bg-white px-4 py-4 text-left transition ${
            mode === 'scheduled'
              ? 'border-fixla-600 ring-2 ring-fixla-600/20'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-base font-bold text-gray-900">Aikataulutus</p>
          <p className="mt-0.5 text-xs text-gray-500">Valitse päivä ja aika</p>
        </button>
      </div>

      {mode === 'scheduled' && confirmed && selected && time ? (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-fixla-600/30 bg-fixla-50 px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fixla-600 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path
                  fillRule="evenodd"
                  d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-fixla-700">Valittu aika</p>
              <p className="truncate text-sm font-bold text-gray-900">
                {selected.toLocaleDateString('fi-FI', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}{' '}
                klo {time}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEdit}
            className="shrink-0 text-xs font-semibold text-fixla-700 hover:underline"
          >
            Muuta
          </button>
        </div>
      ) : mode === 'scheduled' ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <Step number={1} label="Päivä" active={step === 'date'} done={step === 'time'} />
            <div className="h-px flex-1 bg-gray-200" />
            <Step number={2} label="Aika" active={step === 'time'} />
          </div>

          {step === 'date' ? (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  disabled={!canGoBack}
                  aria-label="Edellinen kuukausi"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M15.78 5.22a.75.75 0 0 1 0 1.06L10.06 12l5.72 5.72a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <p className="text-sm font-bold capitalize text-gray-900">{monthLabel}</p>
                <button
                  type="button"
                  onClick={goNextMonth}
                  aria-label="Seuraava kuukausi"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 1 1-1.06-1.06L13.94 12 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-400">
                {WEEKDAY_HEADERS_FI.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((cell, i) => {
                  if (!cell) return <div key={i} className="h-10" />;
                  const iso = isoDate(cell);
                  const isPast = cell < today;
                  const isSelected = iso === date;
                  const isToday = iso === isoDate(today);
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={isPast}
                      onClick={() => setDate(iso)}
                      className={`flex h-10 items-center justify-center rounded-full text-sm transition ${
                        isSelected
                          ? 'bg-fixla-600 font-bold text-white'
                          : isPast
                            ? 'cursor-not-allowed text-gray-300'
                            : isToday
                              ? 'font-bold text-fixla-700 ring-1 ring-fixla-200 hover:bg-gray-50'
                              : 'text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {cell.getDate()}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!date}
                onClick={() => setStep('time')}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-fixla-600 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                Seuraava →
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('date')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                    <path
                      fillRule="evenodd"
                      d="M11.78 5.22a.75.75 0 0 1 0 1.06L6.81 11.25H21a.75.75 0 0 1 0 1.5H6.81l4.97 4.97a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Takaisin
                </button>
                {selected ? (
                  <p className="text-xs text-gray-500">
                    {selected.toLocaleDateString('fi-FI', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                ) : null}
              </div>

              <p className="mt-3 text-xs text-gray-500">Valitse aika klo 9–21 väliltä.</p>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = slot === time;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTime(slot)}
                      className={`h-11 rounded-xl border text-sm font-semibold transition ${
                        isSelected
                          ? 'border-fixla-600 bg-fixla-600 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!time}
                onClick={() => setConfirmed(true)}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-fixla-600 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path
                    fillRule="evenodd"
                    d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                Valmis
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Step({
  number,
  label,
  active,
  done,
}: {
  number: number;
  label: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          active || done
            ? 'bg-fixla-600 text-white'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        {done ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path
              fillRule="evenodd"
              d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          number
        )}
      </span>
      <span
        className={`text-xs font-semibold ${active || done ? 'text-gray-900' : 'text-gray-500'}`}
      >
        {label}
      </span>
    </div>
  );
}

export function useSchedule() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 10);
  return { defaultDate };
}

export function scheduledForFrom(
  mode: ScheduleMode,
  date: string,
  time: string,
): string | null {
  if (mode === 'asap') return null;
  if (!date || !time) return null;
  return new Date(`${date}T${time}:00`).toISOString();
}

export function QtyStepper({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="w-8 text-center text-base font-bold text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-semibold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
