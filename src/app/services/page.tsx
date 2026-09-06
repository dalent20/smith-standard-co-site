import Link from 'next/link';
import { ArrowRight, Check, Info } from 'lucide-react';
import { addOns, conditionLevels, travelZones, vehicleSizes } from '@/lib/pricing';

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#f1f0eb] pt-24 text-zinc-950">
      <section className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Services</div>
          <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_.6fr] lg:items-end">
            <div><h1 className="max-w-5xl text-6xl font-medium leading-[.9] tracking-[-0.06em] sm:text-8xl">Start with<br /><span className="font-serif italic font-normal">The Standard.</span></h1><p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600">If you're not sure what to book, start with the Smith Standard Detail. The booking flow adapts the estimate to your vehicle's size, current condition, desired depth of care, optional needs, and service location.</p></div>
            <div className="rounded-3xl bg-black p-7 text-white"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Flagship</div><div className="mt-4 text-6xl font-medium tracking-[-0.06em]">$299</div><div className="mt-2 text-lg font-semibold">Smith Standard Detail</div><p className="mt-4 text-sm leading-6 text-zinc-400">Small/sedan starting price in the Napa core service area. First-time clients currently receive a complimentary wax.</p><Link href="/booking" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black">Build your detail <ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Vehicle size</div><h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">A transparent starting point.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-4">
            {Object.entries(vehicleSizes).map(([key, vehicle]) => <article key={key} className="bg-[#0b0b0b] p-6"><div className="text-3xl font-semibold">${vehicle.base}</div><h3 className="mt-4 text-lg font-semibold">{vehicle.label}</h3><p className="mt-3 text-xs leading-5 text-zinc-500">{vehicle.examples}</p></article>)}
          </div>
          <div className="mt-5 flex items-start gap-3 text-xs leading-5 text-zinc-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> These are booking-engine starting prices, not promises for every condition. The estimator shows all adjustments before payment.</div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Condition</div><h2 className="mt-4 text-4xl font-medium tracking-[-0.04em]">The amount of work matters.</h2><div className="mt-8 space-y-3">{Object.entries(conditionLevels).map(([key, condition]) => <div key={key} className="rounded-2xl border border-black/10 bg-white p-5"><div className="flex items-center justify-between gap-4"><strong>{condition.label}</strong><span className="text-sm">{condition.surcharge ? `+$${condition.surcharge}` : 'Included'}</span></div><p className="mt-2 text-xs leading-5 text-zinc-600">{condition.examples}</p></div>)}</div></div>
            <div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Optional needs</div><h2 className="mt-4 text-4xl font-medium tracking-[-0.04em]">Add labor where it is actually needed.</h2><div className="mt-8 grid gap-3 sm:grid-cols-2">{Object.entries(addOns).map(([key, item]) => <div key={key} className="rounded-2xl bg-white p-5"><div className="flex justify-between gap-3"><strong className="text-sm">{item.label}</strong><span className="text-sm">+${item.price}</span></div><p className="mt-2 text-xs leading-5 text-zinc-500">{item.description}</p></div>)}</div></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl"><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Mobile service area</div><h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">Travel is priced before checkout.</h2><div className="mt-9 grid gap-3 md:grid-cols-4">{Object.entries(travelZones).map(([key, zone]) => <div key={key} className="rounded-2xl border border-black/10 p-5"><div className="flex justify-between gap-3"><strong className="text-sm">{zone.label}</strong><span className="text-sm">{zone.fee ? `+$${zone.fee}` : 'Included'}</span></div><p className="mt-3 text-xs leading-5 text-zinc-500">{zone.examples}</p></div>)}</div><p className="mt-5 text-xs leading-5 text-zinc-500">For locations outside the presets, the current operating formula absorbs the first 30 minutes of one-way driving, then adds $1.50 per additional one-way driving minute plus applicable tolls. Final service territory can be tightened as operations mature.</p></div>
      </section>

      <section className="bg-black px-5 py-20 text-white sm:px-8 sm:py-28"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Membership</div><h2 className="mt-4 max-w-4xl text-5xl font-medium leading-[.95] tracking-[-0.055em] sm:text-7xl">Keep the vehicle <span className="font-serif italic font-normal">at the Standard.</span></h2><div className="mt-7 space-y-3 text-sm text-zinc-300"><div className="flex gap-3"><Check className="h-4 w-4" /> 10% off your first detail when you opt in during booking.</div><div className="flex gap-3"><Check className="h-4 w-4" /> Recurring member detail price is 30% off.</div><div className="flex gap-3"><Check className="h-4 w-4" /> Recurring cadence: every two months.</div></div></div><Link href="/booking" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black">Book & choose membership <ArrowRight className="h-4 w-4" /></Link></div></section>
    </main>
  );
}
