import { NextResponse } from 'next/server';
import { retrieveCheckoutSession } from '@/lib/stripe-server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'A valid Stripe checkout session is required.' }, { status: 400 });
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);
    return NextResponse.json({
      id: session.id,
      paymentStatus: session.payment_status,
      status: session.status,
      bookingId: session.metadata?.bookingId ?? null,
      customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
      amountTotal: session.amount_total ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to verify checkout.' }, { status: 500 });
  }
}
