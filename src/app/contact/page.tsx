'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { db } from '@/lib/firebase';

export default function ContactPage() {
  const [contact, setContact] = useState({ phone: '', email: '', address: '' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'contact'))
      .then((snapshot) => {
        if (snapshot.exists()) setContact((current) => ({ ...current, ...snapshot.data() }));
      })
      .catch((error) => console.error('Error loading contact info:', error));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');
    try {
      await addDoc(collection(db, 'contactRequests'), {
        ...form,
        status: 'new',
        source: 'website-contact',
        createdAt: serverTimestamp(),
      });
      setForm({ name: '', email: '', phone: '', message: '' });
      setStatus('Message received. Smith Standard will follow up using the contact information you provided.');
    } catch (error) {
      console.error(error);
      setStatus('We could not submit the message. Please use the phone or email shown on this page.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f1f0eb] pt-24 text-zinc-950">
      <section className="px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Contact</div>
          <div className="mt-5 grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <div><h1 className="max-w-5xl text-6xl font-medium leading-[.9] tracking-[-0.06em] sm:text-8xl">Have a question?<br /><span className="font-serif italic font-normal">Talk to us.</span></h1><p className="mt-7 max-w-2xl text-base leading-7 text-zinc-600">Contact is here for questions, unusual vehicles, extended travel, or special circumstances. If you are ready for a normal appointment, booking is faster.</p><Link href="/booking" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-white">Book Your Detail <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="space-y-3">{contact.phone ? <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-4 rounded-2xl bg-white p-5"><Phone className="h-5 w-5" /><div><div className="text-xs uppercase tracking-wider text-zinc-400">Phone</div><div className="mt-1 font-semibold">{contact.phone}</div></div></a> : null}{contact.email ? <a href={`mailto:${contact.email}`} className="flex items-center gap-4 rounded-2xl bg-white p-5"><Mail className="h-5 w-5" /><div><div className="text-xs uppercase tracking-wider text-zinc-400">Email</div><div className="mt-1 font-semibold">{contact.email}</div></div></a> : null}{contact.address ? <div className="flex items-center gap-4 rounded-2xl bg-white p-5"><MapPin className="h-5 w-5" /><div><div className="text-xs uppercase tracking-wider text-zinc-400">Service base</div><div className="mt-1 font-semibold">{contact.address}</div></div></div> : null}</div>
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.65fr_1fr]">
          <div><div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Secondary inquiry</div><h2 className="mt-4 text-5xl font-medium leading-[.95] tracking-[-0.055em]">Tell us what you need.</h2><p className="mt-5 text-sm leading-6 text-zinc-500">For standard appointments, use Book Now. Use this form for questions or requests that do not fit the normal booking path.</p></div>
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none placeholder:text-zinc-600 focus:border-white/30" required /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none placeholder:text-zinc-600 focus:border-white/30" required /><input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Phone (optional)" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none placeholder:text-zinc-600 focus:border-white/30 sm:col-span-2" /><textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="How can we help?" rows={6} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-white outline-none placeholder:text-zinc-600 focus:border-white/30 sm:col-span-2" required /></div>
            {status ? <p className="mt-4 text-sm leading-6 text-zinc-400">{status}</p> : null}
            <button disabled={submitting} className="mt-5 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black disabled:opacity-50">{submitting ? 'Sending…' : 'Send message'}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
