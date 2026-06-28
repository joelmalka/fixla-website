'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { patchOrderSession } from '@/lib/orderSession';

export default function PaymentForm({
  total,
  paymentIntentId,
}: {
  total: number;
  paymentIntentId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    const returnUrl = `${window.location.origin}/vahvistus`;
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Maksu epäonnistui');
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      patchOrderSession({
        serviceConfig: {
          // persist intent id so /vahvistus can insert the order
          paymentIntentId: paymentIntent.id,
        },
      });
      router.replace(`/vahvistus?pi=${paymentIntent.id}`);
      return;
    }

    // redirect path — Stripe will navigate to return_url
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              address: {
                country: 'FI',
              },
            },
          },
        }}
      />
      {error ? (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="flex h-12 w-full items-center justify-center rounded-2xl bg-fixla-600 px-6 text-sm font-semibold text-white transition hover:bg-fixla-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {submitting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Käsitellään…
          </div>
        ) : (
          `Maksa ${total.toFixed(2)}€`
        )}
      </button>
      {paymentIntentId ? (
        <p className="text-center text-[10px] text-gray-400">Ref: {paymentIntentId.slice(-10)}</p>
      ) : null}
    </form>
  );
}
