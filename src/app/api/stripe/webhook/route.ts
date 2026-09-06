import { NextResponse } from 'next/server';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createCompanyCalendarEvent } from '@/lib/google-calendar';
import { createMembershipSubscription, retrieveCheckoutSession, verifyStripeWebhook } from '@/lib/stripe-server';
import { addMinutes, localDateTimeToUtc, toIsoWithOffset } from '@/lib/time';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!verifyStripeWebhook(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);

    if (event.type === 'checkout.session.completed') {
      const webhookSession = event.data.object;
      const bookingId = webhookSession.metadata?.bookingId;
      if (!bookingId) return NextResponse.json({ received: true });

      const session = await retrieveCheckoutSession(webhookSession.id);
      const paymentIntent = session.payment_intent;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const paymentMethodId =
        typeof paymentIntent?.payment_method === 'string'
          ? paymentIntent.payment_method
          : paymentIntent?.payment_method?.id;

      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingSnap = await getDoc(bookingRef);
      if (!bookingSnap.exists()) return NextResponse.json({ received: true });

      const booking = bookingSnap.data();
      await updateDoc(bookingRef, {
        status: 'confirmed',
        paymentStatus: 'deposit_paid',
        depositPaidAt: serverTimestamp(),
        stripeCustomerId: customerId ?? null,
        stripePaymentMethodId: paymentMethodId ?? null,
        stripeDepositPaymentIntentId: paymentIntent?.id ?? null,
        updatedAt: serverTimestamp(),
      });

      if (booking.membershipOptIn && customerId && paymentMethodId && !booking.stripeMembershipSubscriptionId) {
        try {
          const membership = await createMembershipSubscription({
            bookingId,
            customerId,
            paymentMethodId,
            recurringAmountCents: Math.round(Number(booking.quote?.recurringMembershipPrice ?? 0) * 100),
            vehicleLabel: booking.vehicle?.yearMakeModel || 'Vehicle',
            customerUid: booking.customerUid ?? null,
          });
          const nextDetailDate = new Date(membership.trialEnd * 1000).toISOString().slice(0, 10);
          await updateDoc(bookingRef, {
            stripeMembershipSubscriptionId: membership.subscription.id,
            stripeMembershipPriceId: membership.price.id,
            membershipStatus: 'active',
            nextMembershipDetailDate: nextDetailDate,
            updatedAt: serverTimestamp(),
          });
          if (booking.customerUid) {
            await setDoc(
              doc(db, 'customers', booking.customerUid),
              {
                membership: {
                  status: 'active',
                  subscriptionId: membership.subscription.id,
                  priceId: membership.price.id,
                  vehicleLabel: booking.vehicle?.yearMakeModel || 'Vehicle',
                  recurringPrice: Number(booking.quote?.recurringMembershipPrice ?? 0),
                  cadenceMonths: 2,
                  nextDetailDate,
                  sourceBookingId: bookingId,
                },
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
          }
        } catch (membershipError) {
          // The reservation itself should still succeed if membership activation needs attention.
          console.error('Membership activation failed', membershipError);
          await updateDoc(bookingRef, {
            membershipStatus: 'activation_failed',
            updatedAt: serverTimestamp(),
          });
        }
      }

      const crewIds: string[] = booking.crewIds ?? [];
      const crewEmails: string[] = [];
      const crewNames: string[] = [];
      for (const crewId of crewIds) {
        const employeeSnap = await getDoc(doc(db, 'employees', crewId));
        if (employeeSnap.exists()) {
          const employee = employeeSnap.data();
          if (employee.email) crewEmails.push(employee.email);
          if (employee.name) crewNames.push(employee.name);
        }
      }

      const startUtc = localDateTimeToUtc(booking.date, booking.time);
      const endUtc = addMinutes(startUtc, Number(booking.durationMinutes ?? 180));
      const eventRecord = await createCompanyCalendarEvent({
        bookingId,
        title: `${booking.vehicle?.yearMakeModel || 'Vehicle'} — Smith Standard Detail`,
        description: [
          `Customer: ${booking.name}`,
          `Service: ${booking.service || 'Smith Standard Detail'}`,
          `Crew: ${crewNames.join(' + ') || 'Assigned in Smith Standard OS'}`,
          `Total: $${Number(booking.quote?.total ?? 0).toFixed(2)}`,
          `Deposit paid: $${Number(booking.quote?.deposit ?? 0).toFixed(2)}`,
          booking.membershipOptIn ? `Membership: opted in; recurring estimate $${Number(booking.quote?.recurringMembershipPrice ?? 0).toFixed(2)} every 2 months` : 'Membership: no',
        ].join('\n'),
        location: booking.serviceAddress,
        start: toIsoWithOffset(startUtc),
        end: toIsoWithOffset(endUtc),
        attendeeEmails: crewEmails,
      });

      if (eventRecord?.id) {
        await updateDoc(bookingRef, {
          googleCalendarEventId: eventRecord.id,
          googleCalendarHtmlLink: eventRecord.htmlLink ?? null,
          updatedAt: serverTimestamp(),
        });
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata?.bookingId;
      if (bookingId) {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
          await updateDoc(bookingRef, {
            paymentStatus: paymentIntent.metadata?.paymentStage === 'balance' ? 'balance_failed' : 'deposit_failed',
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata?.bookingId;
      if (bookingId && paymentIntent.metadata?.paymentStage === 'balance') {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
          await updateDoc(bookingRef, {
            paymentStatus: 'paid_in_full',
            status: 'completed',
            balancePaidAt: serverTimestamp(),
            stripeBalancePaymentIntentId: paymentIntent.id,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      if (subscriptionId) {
        // Membership-specific dunning is left to Stripe Smart Retries; the dashboard can surface the failed invoice.
        console.warn('Smith Standard membership invoice failed', subscriptionId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
