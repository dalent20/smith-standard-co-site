import { NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getErrorMessage } from '@/lib/errors';
import { calculateQuote, type AddOnKey, type ConditionLevel, type TravelZone, type VehicleSize } from '@/lib/pricing';
import { createDepositCheckout } from '@/lib/stripe-server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone = '',
      serviceAddress = '',
      vehicle,
      careLevel = 3,
      addOns = [],
      travelZone = 'napa-core',
      membershipOptIn = false,
      date,
      time,
      crewIds = [],
      photoUrls = [],
      customerUid = null,
    } = body;

    if (!name || !email || !vehicle?.size || !vehicle?.condition || !date || !time) {
      return NextResponse.json({ error: 'Missing required booking information.' }, { status: 400 });
    }

    if (!Array.isArray(crewIds) || crewIds.length < 2) {
      return NextResponse.json({ error: 'This appointment requires at least two available Smith Standard team members.' }, { status: 409 });
    }

    const quote = calculateQuote({
      vehicleSize: vehicle.size as VehicleSize,
      condition: vehicle.condition as ConditionLevel,
      careLevel: Number(careLevel),
      addOns: addOns as AddOnKey[],
      travelZone: travelZone as TravelZone,
      membershipOptIn: Boolean(membershipOptIn),
    });

    const bookingRef = await addDoc(collection(db, 'bookings'), {
      name,
      email: String(email).toLowerCase(),
      phone,
      serviceAddress,
      customerUid,
      vehicle: {
        yearMakeModel: vehicle.yearMakeModel ?? '',
        nickname: vehicle.nickname ?? '',
        size: vehicle.size,
        condition: vehicle.condition,
      },
      service: 'Smith Standard Detail',
      careLevel: Number(careLevel),
      addOns,
      travelZone,
      membershipOptIn: Boolean(membershipOptIn),
      date,
      time,
      durationMinutes: quote.estimatedDurationMinutes,
      crewIds: crewIds.slice(0, 2),
      crewRequired: 2,
      photoUrls,
      quote,
      status: 'pending_deposit',
      paymentStatus: 'awaiting_deposit',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const checkout = await createDepositCheckout({
      bookingId: bookingRef.id,
      email,
      name,
      vehicleLabel: vehicle.yearMakeModel || vehicle.size,
      depositCents: Math.round(quote.deposit * 100),
      totalCents: Math.round(quote.total * 100),
      balanceCents: Math.round(quote.balance * 100),
      origin,
      membershipOptIn: Boolean(membershipOptIn),
    });

    await updateDoc(bookingRef, {
      stripeCheckoutSessionId: checkout.id,
      stripeCheckoutUrl: checkout.url,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      bookingId: bookingRef.id,
      checkoutUrl: checkout.url,
      quote,
    });
  } catch (error: unknown) {
    console.error('Checkout creation failed', error);
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to begin checkout.') }, { status: 500 });
  }
}
