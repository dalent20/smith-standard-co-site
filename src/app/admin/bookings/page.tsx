'use client';

import { useEffect, useState } from 'react';
import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CreditCard, Images, MapPin, RefreshCw, Users } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { getErrorMessage } from '@/lib/errors';
import type { EmployeeRecord } from '@/lib/availability';

type Booking = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  serviceAddress?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  status?: string;
  paymentStatus?: string;
  crewIds?: string[];
  vehicle?: { yearMakeModel?: string; condition?: string; size?: string };
  quote?: { total?: number; deposit?: number; balance?: number };
  photoUrls?: string[];
  membershipOptIn?: boolean;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    const [bookingSnapshot, employeeSnapshot] = await Promise.all([
      getDocs(collection(db, 'bookings')),
      getDocs(collection(db, 'employees')),
    ]);
    setBookings(bookingSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Booking, 'id'>) })).sort((a, b) => `${b.date ?? ''}${b.time ?? ''}`.localeCompare(`${a.date ?? ''}${a.time ?? ''}`)));
    setEmployees(employeeSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<EmployeeRecord, 'id'>) })).filter((employee) => employee.active !== false));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(bookingId: string, status: string) {
    await updateDoc(doc(db, 'bookings', bookingId), { status, updatedAt: serverTimestamp() });
    await load();
  }

  async function updateCrew(booking: Booking, index: number, employeeId: string) {
    const crew = [...(booking.crewIds ?? ['', ''])];
    while (crew.length < 2) crew.push('');
    crew[index] = employeeId;
    const cleaned = crew.filter(Boolean).slice(0, 2);
    if (new Set(cleaned).size !== cleaned.length) {
      setMessage('A detail requires two different crew members.');
      return;
    }
    await updateDoc(doc(db, 'bookings', booking.id), { crewIds: cleaned, updatedAt: serverTimestamp() });
    setMessage('Crew assignment updated.');
    await load();
  }

  async function collectBalance(booking: Booking) {
    setMessage('Starting Stripe balance charge…');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Sign in again before charging a customer.');
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/collect-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Stripe charge failed.');
      setMessage(data.alreadyPaid ? 'This booking is already paid in full.' : `Stripe balance charge: ${data.status}`);
      await load();
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'Unable to collect balance.'));
    }
  }

  if (loading) return <div className="py-16 text-sm text-zinc-500">Loading bookings…</div>;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Operations</div><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Bookings</h1><p className="mt-3 text-sm text-zinc-600">Dispatch two-person crews, track deposit/final payment, and move each job through completion.</p></div><button onClick={load} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
      {message ? <div className="mt-5 rounded-xl bg-black px-4 py-3 text-sm text-white">{message}</div> : null}

      <div className="mt-8 space-y-4">
        {bookings.map((booking) => {
          const crew = booking.crewIds ?? [];
          const canCollect = booking.paymentStatus === 'deposit_paid' || booking.paymentStatus === 'balance_failed';
          return (
            <article key={booking.id} className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr_.75fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{String(booking.status || 'pending').replaceAll('_', ' ')}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${booking.paymentStatus === 'paid_in_full' ? 'bg-emerald-100 text-emerald-800' : booking.paymentStatus === 'deposit_paid' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>{String(booking.paymentStatus || 'unpaid').replaceAll('_', ' ')}</span>{booking.membershipOptIn ? <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-800">Membership opt-in</span> : null}</div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">{booking.vehicle?.yearMakeModel || booking.service || 'Smith Standard Detail'}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{booking.name} · {booking.email}{booking.phone ? ` · ${booking.phone}` : ''}</p>
                  <div className="mt-5 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2"><div><strong className="text-zinc-900">When</strong><br />{booking.date || 'Date pending'} · {booking.time || 'Time pending'} · ~{Math.round(Number(booking.durationMinutes || 180) / 30) / 2} hrs</div><div><strong className="text-zinc-900">Vehicle intake</strong><br />{booking.vehicle?.size || '—'} · {String(booking.vehicle?.condition || '—').replaceAll('-', ' ')}</div></div>
                  {booking.serviceAddress ? <div className="mt-4 flex items-start gap-2 text-sm text-zinc-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{booking.serviceAddress}</div> : null}
                  {booking.photoUrls?.length ? <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600"><Images className="h-4 w-4" />{booking.photoUrls.length} intake photos saved</div> : null}
                </div>

                <div className="rounded-2xl bg-zinc-50 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"><Users className="h-4 w-4" /> Assigned crew</div>
                  {[0, 1].map((index) => <div key={index} className="mt-4"><label className="mb-1.5 block text-xs text-zinc-500">Detailer {index + 1}</label><select value={crew[index] || ''} onChange={(e) => updateCrew(booking, index, e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm"><option value="">Unassigned</option>{employees.filter((employee) => employee.bookable !== false).map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role || 'detailer'}</option>)}</select></div>)}
                  <div className="mt-5"><label className="mb-1.5 block text-xs text-zinc-500">Job status</label><select value={booking.status || 'pending_deposit'} onChange={(e) => updateStatus(booking.id, e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm"><option value="pending_deposit">Pending deposit</option><option value="confirmed">Confirmed</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                </div>

                <div className="rounded-2xl bg-black p-5 text-white">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500"><CreditCard className="h-4 w-4" /> Payments</div>
                  <div className="mt-5 flex justify-between gap-4 text-sm"><span className="text-zinc-500">Total</span><strong>${Number(booking.quote?.total || 0).toFixed(2)}</strong></div><div className="mt-3 flex justify-between gap-4 text-sm"><span className="text-zinc-500">Deposit</span><strong>${Number(booking.quote?.deposit || 0).toFixed(2)}</strong></div><div className="mt-3 flex justify-between gap-4 border-t border-white/10 pt-3 text-sm"><span className="text-zinc-500">Remaining</span><strong>${Number(booking.quote?.balance || 0).toFixed(2)}</strong></div>
                  <button disabled={!canCollect} onClick={() => collectBalance(booking)} className="mt-6 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600">{booking.paymentStatus === 'paid_in_full' ? 'Paid in full' : canCollect ? 'Charge remaining 50%' : 'Deposit required first'}</button>
                  <p className="mt-3 text-[10px] leading-4 text-zinc-600">Final charge uses the Stripe payment method saved during the deposit checkout. If authentication is required, the payment is marked failed rather than silently bypassing the bank.</p>
                </div>
              </div>
            </article>
          );
        })}
        {!bookings.length ? <div className="rounded-3xl bg-white p-12 text-center text-sm text-zinc-500">No bookings yet.</div> : null}
      </div>
    </div>
  );
}
