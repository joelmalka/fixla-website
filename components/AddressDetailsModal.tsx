'use client';

import { useEffect, useState } from 'react';

export interface AddressDetails {
  apartment: string;
  floor: string;
}

export default function AddressDetailsModal({
  open,
  baseAddress,
  initialDetails,
  onClose,
  onSave,
}: {
  open: boolean;
  baseAddress: string;
  initialDetails?: Partial<AddressDetails>;
  onClose: () => void;
  onSave: (details: AddressDetails) => void;
}) {
  const [apartment, setApartment] = useState(initialDetails?.apartment ?? '');
  const [floor, setFloor] = useState(initialDetails?.floor ?? '');

  useEffect(() => {
    if (open) {
      setApartment(initialDetails?.apartment ?? '');
      setFloor(initialDetails?.floor ?? '');
    }
  }, [open, initialDetails]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      apartment: apartment.trim(),
      floor: floor.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-5">
      <button
        type="button"
        aria-label="Sulje"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-gray-900">Tarkenna osoite</h2>
            <p className="mt-1 truncate text-sm text-gray-500">{baseAddress}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Sulje"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.36-4.36a1 1 0 1 1 1.414 1.414L13.414 10.586l4.36 4.36a1 1 0 1 1-1.414 1.414L12 12l-4.36 4.36a1 1 0 0 1-1.414-1.414l4.36-4.36-4.36-4.36a1 1 0 0 1 0-1.415Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Asunto / huoneisto"
              value={apartment}
              onChange={setApartment}
              placeholder="A 12"
            />
            <Field
              label="Kerros"
              value={floor}
              onChange={setFloor}
              placeholder="3"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Ohita
            </button>
            <button
              type="submit"
              className="h-12 flex-[2] rounded-2xl bg-fixla-600 text-sm font-semibold text-white hover:bg-fixla-700"
            >
              Tallenna ja jatka
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
      />
    </div>
  );
}
