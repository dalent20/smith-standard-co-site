'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function BookingSuccessPage() {
  const [state, setState] = useState<'loading' | 'paid' | 'pending' | 'error'>('loading');
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) {
      setState('error');
      return;
    }

    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to verify payment');
        setBookingId(data.bookingId ?? null);
        setState(data.paymentStatus === 'paid' ? 'paid' : 'pending');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f0ea] px-5 py-24 text-zinc-950">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-xl sm:p-12">
        {state === 'loading' ? <Loader2 className="mx-auto h-10 w-10 animate-spin" /> : null}
        {state === 'paid' ? <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /> : null}
        <div className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Smith Standard & Co.</div>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          {state === 'paid' ? 'Your crew is reserved.' : state === 'pending' ? 'Payment is processing.' : state === 'error' ? 'We could not verify the payment.' : 'Verifying your reservation…'}
        </h1>
        {state === 'paid' ? (
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600">
            Your 50% reservation deposit was received. Smith Standard OS is confirming the booking and syncing it to the company calendar. The remaining 50% is due after the detail.
          </p>
        ) : null}
        {bookingId ? <p className="mt-5 text-sm text-zinc-500">Booking reference: <span className="font-mono text-zinc-900">{bookingId}</span></p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white">Back to Smith Standard</Link>
          <Link href="/account" className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-900">My Garage</Link>
        </div>
      </div>
    </main>
  );
}
