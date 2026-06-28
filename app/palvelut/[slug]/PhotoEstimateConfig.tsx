'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  readOrderSession,
  clearOrderSession,
  patchOrderSession,
  formatFullAddress,
} from '@/lib/orderSession';
import { ServiceMeta } from '@/lib/services';
import {
  InstructionsField,
  ScheduleBlock,
  ScheduleMode,
  StickyTotal,
  scheduledForFrom,
  useSchedule,
} from './configShared';

const TABLE_BY_DBNAME: Record<string, string> = {
  'Lawn Mowing': 'lawn_mowing_estimates',
  'Fence Washing': 'fence_washing_estimates',
  'Fence Painting': 'fence_painting_estimates',
  'Snow Work': 'snow_work_estimates',
  'Other Work': 'other_work_estimates',
};

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

type LocalPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

interface EstimateRecord {
  id: string;
  customer_id: string;
  status: 'pending' | 'estimated' | 'completed' | string;
  estimated_price: number | null;
  property_address: string | null;
  created_at: string;
}

export default function PhotoEstimateConfig({ service }: { service: ServiceMeta }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string; name?: string; phone?: string } | null>(null);
  const [checkingEstimate, setCheckingEstimate] = useState(true);
  const [existingEstimate, setExistingEstimate] = useState<EstimateRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        setCheckingEstimate(false);
        return;
      }
      const meta = data.user.user_metadata as { full_name?: string; phone?: string };
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: meta?.full_name,
        phone: meta?.phone,
      });

      // Mirror mobile: look for an existing estimate for THIS customer at THIS address
      // (substring match on city + street, case-insensitive). Estimates are permanent
      // per location once set by the business owner.
      const tableName = TABLE_BY_DBNAME[service.dbName];
      const sess = readOrderSession();
      if (!tableName || !sess?.address) {
        setCheckingEstimate(false);
        return;
      }
      const streetPart = sess.address.split(',')[0]?.trim().toLowerCase() ?? '';
      const cityPart = (sess.city ?? '').toLowerCase();

      const { data: rows, error: queryError } = await supabase
        .from(tableName)
        .select('id, customer_id, status, estimated_price, property_address, created_at')
        .eq('customer_id', data.user.id)
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (queryError) {
        setCheckingEstimate(false);
        return;
      }

      const match = (rows ?? []).find((r) => {
        const addr = (r.property_address ?? '').toLowerCase();
        if (!addr) return false;
        if (streetPart && !addr.includes(streetPart)) return false;
        if (cityPart && !addr.includes(cityPart)) return false;
        return true;
      });

      setExistingEstimate(match ?? null);
      setCheckingEstimate(false);
    })();
    return () => {
      cancelled = true;
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service.dbName]);

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const incoming: LocalPhoto[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_PHOTO_BYTES) {
        setError(`Kuva on liian iso (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`);
        continue;
      }
      incoming.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    setPhotos((prev) => [...prev, ...incoming].slice(0, MAX_PHOTOS));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) URL.revokeObjectURL(p.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Kirjaudu sisään ennen lähetystä');
      return;
    }
    const tableName = TABLE_BY_DBNAME[service.dbName] ?? 'other_work_estimates';
    const session = readOrderSession();
    const address = session?.address ?? '';

    if (photos.length === 0) {
      setError('Lataa vähintään yksi kuva');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const estimateId = crypto.randomUUID();
      const insertPayload = {
        id: estimateId,
        customer_id: user.id,
        property_address: address,
        estimated_price: null,
        status: 'pending',
        notes: null,
        customer_name: user.name ?? user.email?.split('@')[0] ?? 'Customer',
        customer_email: user.email ?? '',
        customer_phone: user.phone ?? '',
        special_requirements: notes,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from(tableName).insert([insertPayload]);
      if (insertError) throw insertError;

      // Upload photos in parallel
      const uploadResults = await Promise.all(
        photos.map(async (p) => {
          const fileName = `${estimateId}_${p.id}_${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('service-photos')
            .upload(fileName, p.file, {
              contentType: p.file.type || 'image/jpeg',
              cacheControl: '3600',
              upsert: false,
            });
          if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
          }
          const { data } = supabase.storage.from('service-photos').getPublicUrl(fileName);
          return data.publicUrl;
        }),
      );
      const validUrls = uploadResults.filter((u): u is string => !!u);

      if (validUrls.length > 0) {
        await supabase.from(tableName).update({ photo_urls: validUrls }).eq('id', estimateId);
      }

      // Notify admin via existing edge function
      try {
        await supabase.functions.invoke('send-estimate-email', {
          body: {
            estimateId,
            serviceType: service.dbName,
            customerInfo: {
              name: insertPayload.customer_name,
              email: insertPayload.customer_email,
              phone: insertPayload.customer_phone,
            },
            propertyAddress: address,
            specialRequirements: notes,
            photoUrls: validUrls,
            adminEmail: 'teamfixla@gmail.com',
          },
        });
      } catch (e) {
        console.warn('Estimate email failed (non-fatal):', e);
      }

      clearOrderSession();
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Lähetys epäonnistui';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingEstimate) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-fixla-600" />
        Tarkistetaan aiempia arvioita…
      </div>
    );
  }

  if (existingEstimate && existingEstimate.status === 'estimated' && typeof existingEstimate.estimated_price === 'number') {
    return (
      <EstimatedBooking
        service={service}
        price={existingEstimate.estimated_price}
        estimateId={existingEstimate.id}
        onContinue={(payload) => {
          patchOrderSession({
            serviceSlug: service.slug,
            serviceConfig: {
              estimateId: existingEstimate.id,
              duration: 'arvio',
            },
            price: existingEstimate.estimated_price ?? 0,
            scheduledFor: payload.scheduledFor,
            instructions: payload.instructions,
          });
          router.push('/kassa');
        }}
      />
    );
  }

  if (existingEstimate && existingEstimate.status === 'pending') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-amber-600">
            <path d="M12 6a1 1 0 0 1 1 1v5.382l3.447 1.724a1 1 0 1 1-.894 1.788l-4-2A1 1 0 0 1 11 13V7a1 1 0 0 1 1-1Zm0-4a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900">Odotamme hinta-arviota</h2>
        <p className="mt-2 text-sm text-gray-600">
          Olemme vastaanottaneet pyyntösi tähän osoitteeseen. Saat hinta-arvion sähköpostiin yleensä alle 24 tunnissa — sen jälkeen voit varata työn täältä.
        </p>
        <button
          type="button"
          onClick={() => router.push('/palvelut')}
          className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
        >
          Selaa muita palveluita
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fixla-50">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-fixla-600">
            <path
              fillRule="evenodd"
              d="M20.03 6.97a.75.75 0 0 1 0 1.06l-9.5 9.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06L10 15.94l8.97-8.97a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-bold text-gray-900">Kiitos!</h2>
        <p className="mt-2 text-sm text-gray-600">
          Pyyntö lähetetty. Tarkistamme kuvat ja palaamme asiaan 24 tunnin sisällä sähköpostitse.
        </p>
        <button
          type="button"
          onClick={() => router.push('/tilaukset')}
          className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white hover:bg-fixla-700"
        >
          Näytä tilaukseni
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">Lataa kuvat kohteesta</h2>
        <p className="mt-1 text-sm text-gray-600">
          Lähetä 1–{MAX_PHOTOS} kuvaa, jotta voimme arvioida työn tarkasti.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-4">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200"
            >
              <Image src={p.previewUrl} alt="" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label="Poista"
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.36-4.36a1 1 0 1 1 1.414 1.414L13.414 10.586l4.36 4.36a1 1 0 1 1-1.414 1.414L12 12l-4.36 4.36a1 1 0 0 1-1.414-1.414l4.36-4.36-4.36-4.36a1 1 0 0 1 0-1.415Z" />
                </svg>
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-fixla-500 hover:bg-fixla-50 hover:text-fixla-600"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z" />
              </svg>
            </button>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleAddPhotos(e.target.files)}
        />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-bold text-gray-900">Kuvaile työtä</h2>
        <p className="mt-1 text-sm text-gray-600">
          Mitä tarvitsee tehdä, koska, kohteen koko jne.
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Esim. takapihalla 30 m² nurmikko, korkeahkoa ruohoa, helppokulkuinen…"
          className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-fixla-600"
        />
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}

      <div className="sticky bottom-20 z-20 -mx-5 border-t border-gray-100 bg-white/95 px-5 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] backdrop-blur md:bottom-6 md:mx-0 md:rounded-2xl md:border md:border-gray-200 md:px-6 md:py-5 md:shadow-lg">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || photos.length === 0}
          className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            'Lähetä tarjouspyyntö'
          )}
        </button>
        <p className="mt-2 text-center text-xs text-gray-500">
          Saat hinta-arvion sähköpostiin yleensä alle 24 tunnissa.
        </p>
      </div>
    </div>
  );
}

function EstimatedBooking({
  service,
  price,
  estimateId,
  onContinue,
}: {
  service: ServiceMeta;
  price: number;
  estimateId: string;
  onContinue: (payload: { scheduledFor: string | null; instructions: string }) => void;
}) {
  const { defaultDate } = useSchedule();
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('asap');
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('09:00');
  const [instructions, setInstructions] = useState('');

  const session = useMemo(() => readOrderSession(), []);
  const addressLine = session ? formatFullAddress(session) : '';

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border-2 border-fixla-500 bg-fixla-50/40 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-fixla-700">
              Hinta-arvio sinulle
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{service.name}</h2>
            {addressLine ? (
              <p className="mt-1 truncate text-sm text-gray-600">{addressLine}</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-extrabold text-gray-900">{price.toFixed(2)}€</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Arvio #{estimateId.slice(0, 8)} — kiinteä hinta tähän osoitteeseen.
        </p>
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

      <StickyTotal
        price={price}
        onContinue={() =>
          onContinue({
            scheduledFor: scheduledForFrom(scheduleMode, date, time),
            instructions,
          })
        }
      />
    </div>
  );
}
