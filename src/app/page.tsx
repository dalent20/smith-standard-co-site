import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Clock3, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

const standards = [
  ['01', 'Meticulous Care', 'Every vehicle is approached deliberately, with respect for its finishes, materials, and condition.'],
  ['02', 'Convenience Without Compromise', 'Professional mobile detailing delivered to your home, workplace, or another suitable service location.'],
  ['03', 'Premium Products', 'Professional-grade products and equipment selected to safely clean, maintain, and present premium vehicles.'],
  ['04', 'A Higher Standard', 'The service, communication, and final presentation should all feel appropriate for the vehicle you trust us with.'],
];

export default function Home() {
  return (
    <main className="bg-black text-white">
      <section className="relative min-h-[96svh] overflow-hidden">
        <Image src="/luxury-car.jpg" alt="Premium vehicle" fill priority className="object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.96)_0%,rgba(0,0,0,.72)_42%,rgba(0,0,0,.18)_78%),linear-gradient(0deg,rgba(0,0,0,.8)_0%,transparent_40%)]" />
        <div className="relative mx-auto flex min-h-[96svh] max-w-7xl items-end px-5 pb-12 pt-36 sm:px-8 sm:pb-16">
          <div className="grid w-full gap-10 lg:grid-cols-[1.25fr_.55fr] lg:items-end">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-300"><span className="h-px w-8 bg-white/40" /> Mobile Detailing · Napa / Sonoma</div>
              <h1 className="mt-7 max-w-5xl text-6xl font-medium leading-[.88] tracking-[-0.065em] sm:text-7xl lg:text-[108px]">
                Luxury Detailing.<br /><span className="font-serif italic font-normal">Delivered To You.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">Premium mobile vehicle care for owners who expect professionalism, convenience, and meticulous attention to detail.</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link href="/booking" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-200">Book the Standard Detail <ArrowRight className="h-4 w-4" /></Link><Link href="/showcase" className="inline-flex items-center rounded-xl border border-white/25 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] transition hover:bg-white/10">View Our Work</Link></div>
            </div>
            <aside className="rounded-2xl border border-white/15 bg-black/50 p-6 backdrop-blur-xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">The Smith Standard Detail</div><div className="mt-4 text-6xl font-medium tracking-[-0.06em]">$299</div><p className="mt-4 text-sm leading-6 text-zinc-400">Our flagship mobile detail. Vehicle size, condition, selected depth of care, and travel outside the core area can adjust the final estimate.</p><div className="mt-5 border-t border-white/10 pt-5 text-sm text-zinc-200">First-time clients currently receive a complimentary wax.</div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#f1f0eb] px-5 py-24 text-zinc-950 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl text-center"><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">The Smith Standard</div><h2 className="mx-auto mt-5 max-w-5xl text-5xl font-medium leading-[.95] tracking-[-0.055em] sm:text-7xl">More than a clean car.<br /><span className="font-serif italic font-normal">A vehicle presented the way it should be.</span></h2><p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-600">The goal is simple: make premium vehicle care easy to book, easy to trust, and worth the time you save by having us come to you.</p></div>
        <div className="mx-auto mt-16 grid max-w-7xl gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-3xl bg-zinc-900"><Image src="/luxury-car.jpg" alt="Premium vehicle presentation" fill className="object-cover opacity-80" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" /><div className="absolute bottom-6 left-6 text-xs font-semibold uppercase tracking-[0.16em] text-white">Premium vehicle presentation</div></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><div className="rounded-3xl bg-black p-7 text-white"><Sparkles className="h-6 w-6" /><div className="mt-12 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Transformation</div><h3 className="mt-2 text-3xl font-medium tracking-tight">Before. Work. After.</h3><p className="mt-4 text-sm leading-6 text-zinc-400">Our proof library is designed around consistent before-and-after angles, process footage, finished vehicle photography, and genuine customer reviews.</p></div><div className="rounded-3xl border border-black/10 bg-white p-7"><ShieldCheck className="h-6 w-6" /><div className="mt-12 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Trust</div><h3 className="mt-2 text-3xl font-medium tracking-tight">Your vehicle is treated accordingly.</h3><p className="mt-4 text-sm leading-6 text-zinc-600">Professional communication, deliberate care, and a service process built for owners who care deeply about their vehicle.</p></div></div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">02 — Signature Service</div><h2 className="mt-5 text-6xl font-medium leading-[.9] tracking-[-0.06em] sm:text-7xl">The Standard<br /><span className="font-serif italic font-normal">Detail.</span></h2><div className="mt-8 text-7xl font-medium tracking-[-0.07em]">$299</div><p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">The flagship Smith Standard service. Start here if you want comprehensive mobile vehicle care and let the booking flow adapt the estimate to your vehicle and its condition.</p></div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><div><div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">What you choose during booking</div><ul className="mt-5 space-y-3 text-sm text-zinc-300">{['Vehicle make, model, and size','Current condition','Desired depth of service','Specific add-ons','Service location','Date and two-person crew time'].map((item)=><li key={item} className="flex gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />{item}</li>)}</ul></div><div className="rounded-2xl bg-white p-5 text-black"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Payment</div><div className="mt-6 grid grid-cols-2 gap-4"><div><div className="text-3xl font-semibold">50%</div><div className="mt-1 text-xs text-zinc-500">to reserve</div></div><div><div className="text-3xl font-semibold">50%</div><div className="mt-1 text-xs text-zinc-500">after service</div></div></div><p className="mt-6 text-xs leading-5 text-zinc-500">Secure payment is handled through Stripe. Membership customers can opt into recurring care every two months.</p></div></div><Link href="/booking" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black">Build Your Detail <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="bg-[#f1f0eb] px-5 py-24 text-zinc-950 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl"><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Why Smith Standard</div><h2 className="mt-5 max-w-4xl text-5xl font-medium leading-[.96] tracking-[-0.055em] sm:text-7xl">Your Vehicle Is<br /><span className="font-serif italic font-normal">Treated Accordingly.</span></h2><div className="mt-14 grid border-t border-black/15 md:grid-cols-2">{standards.map(([number,title,copy],index)=><article key={number} className={`border-b border-black/15 py-8 ${index%2===0?'md:pr-10':'md:border-l md:border-black/15 md:pl-10'}`}><div className="text-[10px] font-semibold tracking-[0.18em] text-zinc-400">{number}</div><h3 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">{copy}</p></article>)}</div></div>
      </section>

      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-7xl"><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">How It Works</div><h2 className="mt-5 max-w-5xl text-5xl font-medium leading-[.96] tracking-[-0.055em] sm:text-7xl">Professional detailing<br /><span className="font-serif italic font-normal">without losing your day.</span></h2><div className="mt-14 grid border-t border-white/15 md:grid-cols-4">{[['01','Book','Configure your vehicle, condition, service depth, and location.'],['02','Choose a crew time','The scheduler only offers windows with two available detailers.'],['03','We come to you','Your assigned team arrives at the approved service location.'],['04','Enjoy the result','Pay the remaining balance after service and keep your vehicle maintained.']].map(([number,title,copy],i)=><article key={number} className={`border-b border-white/10 py-8 md:border-b-0 ${i?'md:border-l md:border-white/10 md:pl-6':'md:pr-6'}`}><div className="text-[10px] font-semibold tracking-[0.18em] text-zinc-600">{number}</div><h3 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{copy}</p></article>)}</div></div>
      </section>

      <section className="bg-[#f1f0eb] px-5 py-24 text-zinc-950 sm:px-8 sm:py-28"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3"><div className="flex gap-4"><MapPin className="h-5 w-5 shrink-0" /><div><div className="font-semibold">Mobile across Wine Country & the Bay Area</div><p className="mt-2 text-sm leading-6 text-zinc-600">Napa core service is included. Extended areas are priced transparently during booking.</p></div></div><div className="flex gap-4"><Clock3 className="h-5 w-5 shrink-0" /><div><div className="font-semibold">Book around your day</div><p className="mt-2 text-sm leading-6 text-zinc-600">Choose a date and let Smith Standard OS show times when the required crew is actually available.</p></div></div><div className="flex gap-4"><ShieldCheck className="h-5 w-5 shrink-0" /><div><div className="font-semibold">Proof over promises</div><p className="mt-2 text-sm leading-6 text-zinc-600">The public portfolio is reserved for genuine Smith Standard work and genuine customer proof—not fabricated testimonials.</p></div></div></div></section>

      <section className="relative grid min-h-[70svh] place-items-center overflow-hidden px-5 py-24 text-center"><Image src="/luxury-car.jpg" alt="Premium vehicle" fill className="object-cover opacity-30" /><div className="absolute inset-0 bg-black/65" /><div className="relative max-w-4xl"><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">The Smith Standard</div><h2 className="mt-5 text-6xl font-medium leading-[.9] tracking-[-0.06em] sm:text-8xl">Your Car.<br /><span className="font-serif italic font-normal">Our Standard.</span></h2><p className="mx-auto mt-7 max-w-xl text-base leading-7 text-zinc-400">Premium mobile detailing, brought directly to you. The Standard Detail starts at $299.</p><Link href="/booking" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black">Book Your Detail <ArrowRight className="h-4 w-4" /></Link></div></section>
    </main>
  );
}
