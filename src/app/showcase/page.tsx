'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowRight, Images } from 'lucide-react';
import { db } from '@/lib/firebase';

export default function ShowcasePage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'showcase'));
        if (snap.exists()) {
          const approved = snap.data().images;
          setImages(Array.isArray(approved) ? approved.filter((value): value is string => typeof value === 'string' && value.length > 0) : []);
        }
      } catch (error) {
        console.error('Error loading approved Smith Standard proof:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-20 pt-36 sm:px-8 sm:pb-28 sm:pt-44">
        <div className="absolute right-[-15%] top-[15%] h-[420px] w-[620px] rounded-full bg-white/[0.035] blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Proof / Selected Work</div>
          <h1 className="mt-5 max-w-5xl text-6xl font-medium leading-[.9] tracking-[-0.06em] sm:text-8xl">
            Real Cars.<br /><span className="font-serif italic font-normal">Real Work.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400">
            This gallery is reserved for approved Smith Standard work. No fabricated customers, reviews, or stock vehicle photography is presented as completed client work.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid min-h-[360px] place-items-center rounded-3xl border border-white/10 bg-white/[0.025] text-sm text-zinc-500">Loading approved work…</div>
          ) : images.length === 0 ? (
            <div className="grid min-h-[420px] place-items-center rounded-3xl border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
              <div className="max-w-lg"><Images className="mx-auto h-8 w-8 text-zinc-500" /><h2 className="mt-5 text-3xl font-semibold tracking-tight">The proof library is being curated.</h2><p className="mt-4 text-sm leading-6 text-zinc-500">Approved before/after transformations, finished vehicle photography, process content, and genuine customer proof will appear here as they are loaded into Smith Standard OS.</p></div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((url, index) => (
                <article key={`${url}-${index}`} className={`group relative overflow-hidden rounded-2xl bg-zinc-900 ${index % 5 === 0 ? 'sm:col-span-2' : ''}`}>
                  <div className={index % 5 === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'}>
                    <Image src={url} alt={`Approved Smith Standard vehicle detail ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.02]" />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f1f0eb] px-5 py-20 text-zinc-950 sm:px-8 sm:py-28">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Your Car. Our Standard.</div><h2 className="mt-4 max-w-3xl text-5xl font-medium leading-[.95] tracking-[-0.055em] sm:text-7xl">Ready to put your vehicle <span className="font-serif italic font-normal">in the portfolio?</span></h2></div>
          <Link href="/booking" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white">Book Your Detail <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
