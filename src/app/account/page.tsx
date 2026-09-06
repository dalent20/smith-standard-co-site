'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { Car, LogOut, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { vehicleSizes, type VehicleSize } from '@/lib/pricing';

type Vehicle = { id: string; yearMakeModel: string; nickname?: string; size: VehicleSize };
type Booking = { id: string; date?: string; time?: string; status?: string; vehicle?: { yearMakeModel?: string }; quote?: { total?: number } };

export default function CustomerAccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [vehicleForm, setVehicleForm] = useState({ yearMakeModel: '', nickname: '', size: 'small' as VehicleSize });

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    setLoading(false);
    if (currentUser) await loadAccount(currentUser.uid);
  }), []);

  async function loadAccount(uid: string) {
    const [vehicleSnapshot, bookingSnapshot, customerSnapshot] = await Promise.all([
      getDocs(collection(db, 'customers', uid, 'vehicles')),
      getDocs(query(collection(db, 'bookings'), where('customerUid', '==', uid))),
      getDoc(doc(db, 'customers', uid)),
    ]);
    setVehicles(vehicleSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Vehicle, 'id'>) })));
    setBookings(bookingSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Booking, 'id'>) })).sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? ''))));
    setMembership(customerSnapshot.exists() ? customerSnapshot.data().membership ?? null : null);
  }

  async function authenticate(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      if (mode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(credential.user, { displayName: name });
        await setDoc(doc(db, 'customers', credential.user.uid), {
          name,
          email: email.toLowerCase(),
          createdAt: serverTimestamp(),
          membership: { status: 'inactive' },
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      setMessage(error?.message || 'Unable to sign in.');
    }
  }

  async function addVehicle(event: React.FormEvent) {
    event.preventDefault();
    if (!user || !vehicleForm.yearMakeModel.trim()) return;
    await addDoc(collection(db, 'customers', user.uid, 'vehicles'), {
      ...vehicleForm,
      createdAt: serverTimestamp(),
    });
    setVehicleForm({ yearMakeModel: '', nickname: '', size: 'small' });
    await loadAccount(user.uid);
  }

  async function removeVehicle(vehicleId: string) {
    if (!user) return;
    await deleteDoc(doc(db, 'customers', user.uid, 'vehicles', vehicleId));
    await loadAccount(user.uid);
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-black text-white">Loading Smith Standard…</main>;

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f2f0ea] px-5 py-24 text-zinc-950">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">Smith Standard Account</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Your garage, remembered.</h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">Save vehicles, see bookings, and manage your Smith Standard membership.</p>
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 text-sm font-semibold">
            <button onClick={() => setMode('login')} className={`rounded-lg px-3 py-2 ${mode === 'login' ? 'bg-white shadow' : ''}`}>Sign in</button>
            <button onClick={() => setMode('signup')} className={`rounded-lg px-3 py-2 ${mode === 'signup' ? 'bg-white shadow' : ''}`}>Create account</button>
          </div>
          <form onSubmit={authenticate} className="mt-6 space-y-4">
            {mode === 'signup' ? <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-zinc-200 px-4 py-3" required /> : null}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-zinc-200 px-4 py-3" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-zinc-200 px-4 py-3" minLength={6} required />
            {message ? <p className="text-sm text-red-600">{message}</p> : null}
            <button className="w-full rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white">{mode === 'signup' ? 'Create my garage' : 'Sign in'}</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f0ea] px-5 pb-20 pt-28 text-zinc-950 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">My Smith Standard</div><h1 className="mt-2 text-5xl font-semibold tracking-[-0.05em]">Welcome back, {user.displayName?.split(' ')[0] || 'driver'}.</h1></div>
          <div className="flex gap-3"><Link href="/booking" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Book a detail</Link><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold"><LogOut className="h-4 w-4" /> Sign out</button></div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <section className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Garage</div><h2 className="mt-2 text-3xl font-semibold tracking-tight">Your vehicles</h2></div><Car className="h-7 w-7" /></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {vehicles.map((vehicle) => <div key={vehicle.id} className="rounded-2xl border border-zinc-200 p-5"><div className="flex items-start justify-between gap-3"><div><div className="font-semibold">{vehicle.nickname || vehicle.yearMakeModel}</div>{vehicle.nickname ? <div className="mt-1 text-xs text-zinc-500">{vehicle.yearMakeModel}</div> : null}<div className="mt-3 text-xs text-zinc-500">{vehicleSizes[vehicle.size].label}</div></div><button onClick={() => removeVehicle(vehicle.id)} className="text-zinc-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div><Link href={`/booking?vehicle=${encodeURIComponent(vehicle.id)}`} className="mt-5 inline-block text-xs font-semibold uppercase tracking-wider">Book this vehicle →</Link></div>)}
              {!vehicles.length ? <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">No saved vehicles yet. Add your first one below.</div> : null}
            </div>
            <form onSubmit={addVehicle} className="mt-6 grid gap-3 rounded-2xl bg-zinc-50 p-5 sm:grid-cols-2">
              <input value={vehicleForm.yearMakeModel} onChange={(e) => setVehicleForm({ ...vehicleForm, yearMakeModel: e.target.value })} placeholder="Year + make + model" className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm" required />
              <input value={vehicleForm.nickname} onChange={(e) => setVehicleForm({ ...vehicleForm, nickname: e.target.value })} placeholder="Nickname (optional)" className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm" />
              <select value={vehicleForm.size} onChange={(e) => setVehicleForm({ ...vehicleForm, size: e.target.value as VehicleSize })} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">{Object.entries(vehicleSizes).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add vehicle</button>
            </form>
          </section>

          <section className={`rounded-3xl p-7 text-white shadow-sm ${membership?.status === 'active' ? 'bg-black' : 'bg-zinc-800'}`}>
            <ShieldCheck className="h-7 w-7" /><div className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Membership</div><h2 className="mt-2 text-3xl font-semibold">{membership?.status === 'active' ? 'The Standard, on repeat.' : 'Keep it maintained.'}</h2>
            <p className="mt-4 text-sm leading-6 text-zinc-300">{membership?.status === 'active' ? `Your membership is active${membership.nextDetailDate ? ` and the next detail is targeted for ${membership.nextDetailDate}` : ''}.` : 'Opt in on your next booking: 10% off the first detail, then 30% off recurring details every two months.'}</p>
            <Link href="/booking?membership=1" className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">{membership?.status === 'active' ? 'Schedule next detail' : 'Book with membership'}</Link>
          </section>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-7 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">History</div><h2 className="mt-2 text-3xl font-semibold tracking-tight">Your details</h2>
          <div className="mt-6 divide-y divide-zinc-100">
            {bookings.map((booking) => <div key={booking.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><div className="font-semibold">{booking.vehicle?.yearMakeModel || 'Smith Standard Detail'}</div><div className="mt-1 text-xs text-zinc-500">{booking.date || 'Date pending'} {booking.time ? `· ${booking.time}` : ''}</div></div><span className="text-sm capitalize text-zinc-500">{String(booking.status || 'pending').replaceAll('_', ' ')}</span><span className="font-semibold">${Number(booking.quote?.total || 0).toFixed(2)}</span></div>)}
            {!bookings.length ? <p className="py-8 text-sm text-zinc-500">No account-linked bookings yet.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
