import { CalendarCheck, CheckCircle2, CreditCard, Database, ExternalLink, ShieldAlert } from 'lucide-react';

const rows = [
  {
    name: 'Firebase',
    icon: Database,
    status: 'configured',
    detail: 'Firestore, Firebase Auth, and Storage power bookings, users, crew profiles, and intake photos.',
    env: ['Existing Firebase web config'],
  },
  {
    name: 'Stripe',
    icon: CreditCard,
    status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'needs-env',
    detail: 'Hosted Checkout collects the 50% reservation deposit and saves the approved payment method for the post-service balance.',
    env: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_SITE_URL'],
  },
  {
    name: 'Google Calendar',
    icon: CalendarCheck,
    status:
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.SMITH_STANDARD_CALENDAR_ID
        ? 'configured'
        : 'needs-env',
    detail: 'Reads employee free/busy windows and creates confirmed details on the Smith Standard Co-Details calendar.',
    env: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'SMITH_STANDARD_CALENDAR_ID'],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">System</div>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Integrations</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
        This page reports whether the deployed Smith Standard OS has the server credentials it needs. A service being connected to ChatGPT does not automatically expose that credential to the Vercel-hosted website, so the production app still needs its own scoped environment variables.
      </p>

      <div className="mt-8 grid gap-5">
        {rows.map((row) => {
          const Icon = row.icon;
          const configured = row.status === 'configured';
          return (
            <section key={row.name} className="rounded-3xl bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><Icon className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-xl font-semibold">{row.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">{row.detail}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
                  {configured ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                  {configured ? 'Ready in this deployment' : 'Server credentials required'}
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-zinc-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">Required configuration</div>
                <div className="mt-3 flex flex-wrap gap-2">{row.env.map((key) => <code key={key} className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700">{key}</code>)}</div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-6 rounded-3xl bg-black p-7 text-white">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Known connected resources</div>
        <h2 className="mt-2 text-2xl font-semibold">Smith Standard Co-Details</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
          The connected Google account already owns the Smith Standard Co-Details calendar. Use its calendar ID as <code className="text-zinc-200">SMITH_STANDARD_CALENDAR_ID</code>. Employee profiles can separately store their personal/work Google Calendar IDs for free-busy conflict checks.
        </p>
        <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">Open Google Calendar <ExternalLink className="h-4 w-4" /></a>
      </section>
    </div>
  );
}
