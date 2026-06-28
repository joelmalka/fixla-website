'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface SelectedPlace {
  formattedAddress: string;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  streetNumber: string | null;
  route: string | null;
}

interface Props {
  value: string;
  onChange: (text: string) => void;
  onPlaceSelected?: (place: SelectedPlace) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** className applied to the input element */
  inputClassName?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

let loaderPromise: Promise<typeof google> | null = null;
function loadGoogle(): Promise<typeof google> {
  if (!API_KEY) {
    return Promise.reject(new Error('Missing NEXT_PUBLIC_GOOGLE_PLACES_API_KEY'));
  }
  if (!loaderPromise) {
    const loader = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['places'],
    });
    loaderPromise = loader.load();
  }
  return loaderPromise;
}

function findComponent(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
): string | null {
  if (!components) return null;
  const match = components.find((c) => c.types.includes(type));
  return match?.long_name ?? null;
}

function findComponentShort(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string
): string | null {
  if (!components) return null;
  const match = components.find((c) => c.types.includes(type));
  return match?.short_name ?? null;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  autoFocus,
  inputClassName,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [_ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!inputRef.current) return;
    loadGoogle()
      .then((googleNs) => {
        if (cancelled || !inputRef.current) return;
        const ac = new googleNs.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'fi' },
          fields: ['formatted_address', 'address_components', 'geometry'],
          types: ['address'],
        });
        autocompleteRef.current = ac;
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          const formatted = place.formatted_address ?? '';
          const components = place.address_components;
          const selected: SelectedPlace = {
            formattedAddress: formatted,
            city:
              findComponent(components, 'locality') ??
              findComponent(components, 'postal_town') ??
              findComponent(components, 'administrative_area_level_3'),
            postalCode: findComponent(components, 'postal_code'),
            country: findComponentShort(components, 'country'),
            streetNumber: findComponent(components, 'street_number'),
            route: findComponent(components, 'route'),
          };
          if (formatted) onChange(formatted);
          onPlaceSelected?.(selected);
        });
        setReady(true);
      })
      .catch((err) => {
        // No key, network error, or restricted key: gracefully fall back to plain input.
        console.warn('Google Places unavailable, falling back to plain input:', err?.message);
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        google.maps?.event?.clearInstanceListeners?.(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete="street-address"
      className={inputClassName}
    />
  );
}
