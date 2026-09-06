import crypto from 'crypto';

const STRIPE_API = 'https://api.stripe.com/v1';

function secretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return key;
}

async function stripePost(path: string, params: URLSearchParams, idempotencyKey?: string) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: params,
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Stripe request failed: ${response.status}`);
  return data;
}

export async function stripeGet(path: string) {
  const response = await fetch(`${STRIPE_API}${path}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message ?? `Stripe request failed: ${response.status}`);
  return data;
}

export async function createDepositCheckout(input: {
  bookingId: string;
  email: string;
  name: string;
  vehicleLabel: string;
  depositCents: number;
  totalCents: number;
  balanceCents: number;
  origin: string;
  membershipOptIn: boolean;
}) {
  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('customer_email', input.email);
  params.set('success_url', `${input.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${input.origin}/booking?booking=${encodeURIComponent(input.bookingId)}&payment=cancelled`);
  params.set('payment_method_types[0]', 'card');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', 'usd');
  params.set('line_items[0][price_data][unit_amount]', String(input.depositCents));
  params.set('line_items[0][price_data][product_data][name]', 'Smith Standard Detail — 50% Reservation Deposit');
  params.set('line_items[0][price_data][product_data][description]', `${input.vehicleLabel} · Remaining balance due after service.`);
  params.set('payment_intent_data[setup_future_usage]', 'off_session');
  params.set('payment_intent_data[metadata][bookingId]', input.bookingId);
  params.set('payment_intent_data[metadata][paymentStage]', 'deposit');
  params.set('metadata[bookingId]', input.bookingId);
  params.set('metadata[totalCents]', String(input.totalCents));
  params.set('metadata[balanceCents]', String(input.balanceCents));
  params.set('metadata[membershipOptIn]', String(input.membershipOptIn));
  params.set('metadata[customerName]', input.name.slice(0, 400));
  params.set('submit_type', 'book');

  return stripePost('/checkout/sessions', params, `smith-standard-deposit-${input.bookingId}`);
}

export async function collectRemainingBalance(input: {
  bookingId: string;
  customerId: string;
  paymentMethodId: string;
  amountCents: number;
}) {
  const params = new URLSearchParams();
  params.set('amount', String(input.amountCents));
  params.set('currency', 'usd');
  params.set('customer', input.customerId);
  params.set('payment_method', input.paymentMethodId);
  params.set('confirm', 'true');
  params.set('off_session', 'true');
  params.set('description', 'Smith Standard Detail — Remaining Balance');
  params.set('metadata[bookingId]', input.bookingId);
  params.set('metadata[paymentStage]', 'balance');

  return stripePost('/payment_intents', params, `smith-standard-balance-${input.bookingId}`);
}

export async function retrieveCheckoutSession(sessionId: string) {
  return stripeGet(`/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent`);
}

export function verifyStripeWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const parts = signature.split(',').map((part) => part.split('='));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`, 'utf8').digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');

  return signatures.some((candidate) => {
    const candidateBuffer = Buffer.from(candidate, 'utf8');
    return candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
  });
}
