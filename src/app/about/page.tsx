'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, Car, Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { db } from '@/lib/firebase';

const fallback = 'Smith Standard & Co. exists to make professional vehicle care feel as considered as the vehicles we are trusted with. We combine mobile convenience with deliberate craftsmanship, clear communication, and a standard of presentation built for owners who care deeply about their cars.';

export default function AboutPage() {
  const [aboutText, setAboutText] = useState(fallback);

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'about'))
      .then((snapshot) => {
        const text = snapshot.exists() ? snapshot.data().text : null;
        if (typeof text === 'string' && text.trim()) setAboutText(text.trim());
      })
      .catch((error) => console.error('Error loading About content:', error));
  }, []);

  return (
    <main className="min-h-screen bg-[#f1f0eb] pt-24 text-zinc-950">
      <section className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">About Smith Standard</div>
          <div className="mt-5 grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <h1 className="max-w-5xl text-6xl font-medium leading-[.9] tracking-[-0.06em] sm:text-8xl">A higher standard<br /><span className="font-serif italic font-normal">of vehicle care.</span></h1>
            <p className="whitespace-pre-line text-base leading-8 text-zinc-600">{aboutText}</p>
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-4">
            {[ [Sparkles,'Craftsmanship','The work should look deliberate, not rushed.'], [ShieldCheck,'Trust','The customer should feel comfortable handing us the keys to a valuable vehicle.'], [Clock3,'Convenience','Mobile service should save time without lowering the quality of care.'], [Car,'Presentation','The finished vehicle should look and feel appropriately presented.'] ].map(([Icon,title,copy],index) => {
              const IconComponent = Icon as typeof Sparkles;
              return <article key={String(title)} className="bg-[#0b0b0b] p-6"><IconComponent className="h-5 w-5 text-zinc-500" /><div className="mt-10 text-[10px] font-semibold tracking-[0.18em] text-zinc-600">0{index+1}</div><h2 className="mt-3 text-2xl font-semibold">{String(title)}</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{String(copy)}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">The operating philosophy</div></div>
          <div><h2 className="max-w-4xl text-5xl font-medium leading-[.95] tracking-[-0.055em] sm:text-6xl">The company—not a long founder biography—is the hero.</h2><p className="mt-7 max-w-3xl text-base leading-7 text-zinc-600">Smith Standard is being built around repeatable professional systems: consistent vehicle intake, transparent estimates, two-person crew scheduling, customer vehicle profiles, secure payments, proof from real work, and recurring care. The experience should stay premium even as the operation grows.</p></div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24"><div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Experience the Standard</div><h2 className="mt-4 text-5xl font-medium tracking-[-0.055em] sm:text-6xl">Let the work speak next.</h2></div><div className="flex flex-wrap gap-3"><Link href="/showcase" className="rounded-xl border border-black/15 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em]">View Our Work</Link><Link href="/booking" className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white">Book Your Detail <ArrowRight className="h-4 w-4" /></Link></div></div></section>
    </main>
  );
}
