import { NextResponse } from 'next/server';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireManager } from '@/lib/auth-server';
import { getErrorMessage } from '@/lib/errors';
import { collectRemainingBalance } from '@/lib/stripe-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const manager = await requireManager(request);
  if (!manager) return NextResponse.json({ error: 'Manager access required.' }, { status: 403 });

  try {
    const { bookingId } = await request.json();
    if (!bookingId) return NextResponse.json({ error: 'bookingId is required.' }, { status: 400 });

    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);
    if (!bookingSnap.exists()) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

    const booking = bookingSnap.data();
    if (booking.paymentStatus === 'paid_in_full') {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const customerId = booking.stripeCustomerId;
    const paymentMethodId = booking.stripePaymentMethodId;
    const balance = Number(booking.quote?.balance ?? 0);
    if (!customerId || !paymentMethodId || balance <= 0) {
      return NextResponse.json({ error: 'No saved Stripe payment method or remaining balance is available.' }, { status: 409 });
    }

    await updateDoc(bookingRef, {
      paymentStatus: 'balance_processing',
      balanceChargeStartedBy: manager.email,
      updatedAt: serverTimestamp(),
    });

    const intent = await collectRemainingBalance({
      bookingId,
      customerId,
      paymentMethodId,
      amountCents: Math.round(balance * 100),
    });

    await updateDoc(bookingRef, {
      stripeBalancePaymentIntentId: intent.id,
      paymentStatus: intent.status === 'succeeded' ? 'paid_in_full' : intent.status,
      ...(intent.status === 'succeeded' ? { status: 'completed', balancePaidAt: serverTimestamp() } : {}),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ ok: true, paymentIntentId: intent.id, status: intent.status });
  } catch (error: unknown) {
    console.error('Balance collection failed', error);
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to collect remaining balance.') }, { status: 500 });
  }
}
