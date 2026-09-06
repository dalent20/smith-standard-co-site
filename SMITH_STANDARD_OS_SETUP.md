# Smith Standard OS v1 — Deployment Setup

This branch adds customer booking, two-person crew scheduling, Stripe deposit/final-payment handling, membership billing, customer vehicle profiles, employee self-service availability, admin roles, and Google Calendar synchronization.

## Required Vercel environment variables

### Stripe

- `STRIPE_SECRET_KEY` — use the Smith Standard merchant account key for the environment being deployed.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the deployed `/api/stripe/webhook` endpoint.
- `NEXT_PUBLIC_SITE_URL` — canonical deployed URL, e.g. `https://www.smith-standard-co.com`.

The booking flow creates a Stripe-hosted Checkout Session for exactly 50% of the server-calculated booking total and sets `setup_future_usage=off_session`. The webhook stores the resulting Stripe customer/payment-method IDs. A Manager/Owner can then charge the remaining 50% from Smith Standard OS after service.

If a customer opts into membership, the first booking receives the 10% first-detail discount. After the deposit succeeds, the OS creates a recurring Stripe price/subscription with a roughly two-month delayed first recurring charge; subsequent recurring charges are every two months at the calculated 30%-off member rate.

**Do not install a live Stripe secret from an unrelated business account.**

### Google Calendar

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `SMITH_STANDARD_CALENDAR_ID`

Known Smith Standard company calendar currently connected to the owner's Google account:

`54a6d6b98ce844b7f11805fd88b40e5a42ebe1f6aa0c1be8b5f7e71fd1dbc890@group.calendar.google.com`

Use that value for `SMITH_STANDARD_CALENDAR_ID` if it remains the desired operating calendar.

Employee profiles may contain a `googleCalendarId`. The `/api/calendar/freebusy` route only accepts IDs stored on active Smith Standard employee records; arbitrary visitor-supplied calendar IDs are rejected.

### Admin security

- `ADMIN_SESSION_SECRET` — generate a long random value (at least 32 bytes) and keep it server-only.
- `ADMIN_EMAILS` — optional comma-separated owner emails. Normally roles should be stored in the Firestore `employees` collection.

The old `admin-auth=true` client cookie has been removed. Admin access now requires Firebase authentication + an Owner/Manager employee role + a signed HttpOnly server session.

## Firebase data model added/used

### `employees/{employeeId}`

- `name`
- `email`
- `role`: `owner | manager | detailer`
- `active`
- `bookable`
- `googleCalendarId`
- `weeklyAvailability` (day -> ranges)
- `blockedDates`

### `bookings/{bookingId}`

Stores customer, vehicle, condition, service depth, add-ons, travel zone, photos, quote, two-person crew assignment, date/time, payment state, Stripe IDs, membership state, and Google Calendar event ID.

### `customers/{uid}`

Customer profile + membership state.

### `customers/{uid}/vehicles/{vehicleId}`

Saved customer vehicles for repeat booking.

### Firebase Storage

Booking intake images use:

`booking-intake/{customer}/{intakeId}/{image}`

## Booking pricing model currently implemented

- Small/sedan: $299
- Medium/crossover: $329
- Large/SUV/truck: $369
- XL/3-row/oversize: $399
- Condition surcharge: $0 / $40 / $90
- Service-depth slider: -$60 / -$30 / $0 / +$75 / +$150
- Optional labor add-ons priced in `src/lib/pricing.ts`
- Napa core travel: included
- Up-Valley/Sonoma: +$25
- North Bay/Solano: +$45
- Extended Bay Area: +$75
- Outside presets: first 30 one-way driving minutes absorbed, then $1.50 per extra one-way minute plus tolls when applicable
- Deposit: 50%
- Remaining balance: 50% after service
- Membership: 10% off first detail, then 30% off recurring detail every 2 months

All public estimates and payment endpoints call the same shared pricing engine (`src/lib/pricing.ts`).

## Pre-production checklist

1. Confirm the Stripe account is the actual Smith Standard merchant account.
2. Add Stripe test-mode credentials first and register the test webhook.
3. Add at least two employee profiles in `/admin/team` and have them configure availability in `/team`.
4. Add Google OAuth server credentials and confirm free/busy works for employee calendar IDs.
5. Verify Firestore/Storage security rules. The legacy project historically wrote directly from client code; production rules should be audited before customer launch.
6. Run a complete test-mode booking: vehicle -> condition -> service depth -> date -> two-person slot -> Stripe deposit -> webhook -> calendar event -> manager final charge.
7. Replace generic/lifestyle vehicle imagery with approved real Smith Standard proof wherever possible.
8. Confirm cancellation, rain, water/electricity, service-area, and final service-inclusion policies before publishing answers as facts.
