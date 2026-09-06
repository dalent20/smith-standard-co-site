'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/75 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-xs font-bold uppercase tracking-[0.15em]">Smith Standard & Co.</Link>
        <nav className="hidden items-center gap-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300 md:flex">
          <Link href="/services" className="transition hover:text-white">Services</Link>
          <Link href="/showcase" className="transition hover:text-white">Our Work</Link>
          <Link href="/about" className="transition hover:text-white">About</Link>
          <Link href="/account" className="transition hover:text-white">My Garage</Link>
          <Link href="/booking" className="rounded-lg bg-white px-4 py-3 text-black transition hover:bg-zinc-200">Book Now</Link>
        </nav>
        <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 md:hidden" aria-label="Open navigation"><Menu className="h-4 w-4" /></button>
      </div>
      {open ? <nav className="border-t border-white/10 bg-black px-5 py-5 md:hidden"><div className="mx-auto grid max-w-7xl gap-2 text-sm"><Link onClick={() => setOpen(false)} href="/services" className="rounded-lg px-3 py-3 text-zinc-300">Services</Link><Link onClick={() => setOpen(false)} href="/showcase" className="rounded-lg px-3 py-3 text-zinc-300">Our Work</Link><Link onClick={() => setOpen(false)} href="/about" className="rounded-lg px-3 py-3 text-zinc-300">About</Link><Link onClick={() => setOpen(false)} href="/account" className="rounded-lg px-3 py-3 text-zinc-300">My Garage</Link><Link onClick={() => setOpen(false)} href="/booking" className="mt-2 rounded-lg bg-white px-4 py-3 text-center font-semibold text-black">Book Now</Link></div></nav> : null}
    </header>
  );
}
