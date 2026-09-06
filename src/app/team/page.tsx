'use client';

import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { CalendarDays, CheckCircle2, Clock3, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { getErrorMessage } from '@/lib/errors';
import type { AvailabilityRange, DayKey, EmployeeRecord } from '@/lib/availability';

const days: Array<{ key: DayKey; label: string }> = [
  { key: 'mon', label: 'Monday' }, { key: 'tue', label: 'Tuesday' }, { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' }, { key: 'fri', label: 'Friday' }, { key: 'sat', label: 'Saturday' }, { key: 'sun', label: 'Sunday' },
];

const defaultRange: AvailabilityRange = { start: '08:00', end: '17:00' };

type TeamProfile = EmployeeRecord & { role?: string };
type AssignedBooking = { id: string; date?: string; time?: string; status?: string; name?: string; vehicle?: { yearMakeModel?: string }; serviceAddress?: string };

export default function TeamPortalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [bookings, setBookings] = useState<AssignedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [blockedDate, setBlockedDate] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    setLoading(false);
    if (currentUser?.email) await loadProfile(currentUser.email);
    else { setProfile(null); setBookings([]); }
  }), []);

  async function loadProfile(userEmail: string) {
    const snapshot = await getDocs(query(collection(db, 'employees'), where('email', '==', userEmail.toLowerCase())));
    const employeeDoc = snapshot.docs[0];
    if (!employeeDoc) { setProfile(null); return; }
    const nextProfile: TeamProfile = { id: employeeDoc.id, ...(employeeDoc.data() as Omit<TeamProfile, 'id'>) };
    setProfile(nextProfile);
    const bookingSnapshot = await getDocs(query(collection(db, 'bookings'), where('crewIds', 'array-contains', employeeDoc.id)));
    setBookings(bookingSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<AssignedBooking, 'id'>) })).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)));
  }

  async function authenticate(event: React.FormEvent) {
    event.preventDefault(); setAuthError('');
    try {
      if (mode === 'create') await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) { setAuthError(getErrorMessage(error, 'Unable to sign in.')); }
  }

  function rangeFor(day: DayKey) { return profile?.weeklyAvailability?.[day]?.[0] ?? defaultRange; }
  function enabledFor(day: DayKey) { return Boolean(profile?.weeklyAvailability?.[day]?.length); }

  async function setDay(day: DayKey, patch: Partial<AvailabilityRange> | null) {
    if (!profile) return;
    const weeklyAvailability = { ...(profile.weeklyAvailability ?? {}) };
    if (patch === null) weeklyAvailability[day] = [];
    else weeklyAvailability[day] = [{ ...rangeFor(day), ...patch }];
    setProfile({ ...profile, weeklyAvailability });
  }

  async function saveAvailability() {
    if (!profile) return;
    await updateDoc(doc(db, 'employees', profile.id), {
      weeklyAvailability: profile.weeklyAvailability ?? {},
      googleCalendarId: profile.googleCalendarId ?? '',
      updatedAt: serverTimestamp(),
    });
    setSaveMessage('Availability saved. Customer booking times now use these hours.');
  }

  async function addBlockedDate() {
    if (!profile || !blockedDate) return;
    const next = Array.from(new Set([...(profile.blockedDates ?? []), blockedDate])).sort();
    await updateDoc(doc(db, 'employees', profile.id), { blockedDates: arrayUnion(blockedDate), updatedAt: serverTimestamp() });
    setProfile({ ...profile, blockedDates: next });
    setBlockedDate('');
  }

  async function removeBlockedDate(dateValue: string) {
    if (!profile) return;
    const next = (profile.blockedDates ?? []).filter((value) => value !== dateValue);
    await updateDoc(doc(db, 'employees', profile.id), { blockedDates: next, updatedAt: serverTimestamp() });
    setProfile({ ...profile, blockedDates: next });
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-black text-white">Loading team portal…</main>;

  if (!user) return (
    <main className="grid min-h-screen place-items-center bg-black px-5 py-24 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Smith Standard Team</div><h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">Set your hours. See your jobs.</h1>
        <div className="mt-6 grid grid-cols-2 rounded-xl bg-white/5 p-1 text-sm"><button onClick={() => setMode('login')} className={`rounded-lg px-3 py-2 ${mode === 'login' ? 'bg-white text-black' : ''}`}>Sign in</button><button onClick={() => setMode('create')} className={`rounded-lg px-3 py-2 ${mode === 'create' ? 'bg-white text-black' : ''}`}>First login</button></div>
        <form onSubmit={authenticate} className="mt-6 space-y-4"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" required /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3" minLength={6} required />{authError ? <p className="text-sm text-red-400">{authError}</p> : null}<button className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black">{mode === 'create' ? 'Create login' : 'Sign in'}</button></form>
        <p className="mt-5 text-xs leading-5 text-zinc-600">Your manager must create a Smith Standard employee profile with this same email before the portal will grant team access.</p>
      </div>
    </main>
  );

  if (!profile) return <main className="grid min-h-screen place-items-center bg-[#f2f0ea] px-5 text-center"><div><h1 className="text-3xl font-semibold">No employee profile found.</h1><p className="mt-3 text-zinc-600">Ask a manager to add {user.email} in Smith Standard OS → Team & Roles.</p><button onClick={() => signOut(auth)} className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Sign out</button></div></main>;

  return (
    <main className="min-h-screen bg-[#f2f0ea] px-5 pb-20 pt-24 text-zinc-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Smith Standard Team · {profile.role}</div><h1 className="mt-2 text-5xl font-semibold tracking-[-0.05em]">{profile.name}</h1></div><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold"><LogOut className="h-4 w-4" /> Sign out</button></div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3"><Clock3 className="h-6 w-6" /><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Weekly availability</div><h2 className="mt-1 text-2xl font-semibold">When can you detail?</h2></div></div>
            <div className="mt-6 divide-y divide-zinc-100">
              {days.map(({ key, label }) => {
                const range = rangeFor(key); const enabled = enabledFor(key);
                return <div key={key} className="grid gap-3 py-4 sm:grid-cols-[120px_90px_1fr_1fr] sm:items-center"><strong className="text-sm">{label}</strong><button type="button" onClick={() => setDay(key, enabled ? null : defaultRange)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-500'}`}>{enabled ? 'Working' : 'Off'}</button><input type="time" disabled={!enabled} value={range.start} onChange={(e) => setDay(key, { start: e.target.value })} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:opacity-30" /><input type="time" disabled={!enabled} value={range.end} onChange={(e) => setDay(key, { end: e.target.value })} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:opacity-30" /></div>;
              })}
            </div>
            <div className="mt-6"><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Your Google Calendar ID</label><input value={profile.googleCalendarId ?? ''} onChange={(e) => setProfile({ ...profile, googleCalendarId: e.target.value })} placeholder="you@gmail.com" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm" /><p className="mt-2 text-xs leading-5 text-zinc-500">Use the calendar you want Smith Standard to treat as busy-time. It must be shared/readable by the company Google account used by the OS.</p></div>
            <button onClick={saveAvailability} className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Save hours & calendar</button>{saveMessage ? <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" />{saveMessage}</p> : null}
          </section>

          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><CalendarDays className="h-6 w-6" /><h2 className="text-2xl font-semibold">Dates unavailable</h2></div><div className="mt-5 flex gap-2"><input type="date" value={blockedDate} onChange={(e) => setBlockedDate(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm" /><button onClick={addBlockedDate} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">Block</button></div><div className="mt-4 flex flex-wrap gap-2">{(profile.blockedDates ?? []).map((value) => <button key={value} onClick={() => removeBlockedDate(value)} className="rounded-full bg-zinc-100 px-3 py-2 text-xs">{value} ×</button>)}{!(profile.blockedDates ?? []).length ? <span className="text-sm text-zinc-500">No blocked dates.</span> : null}</div></section>
            <section className="rounded-3xl bg-black p-7 text-white shadow-sm"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Assigned work</div><h2 className="mt-2 text-2xl font-semibold">Your upcoming details</h2><div className="mt-5 divide-y divide-white/10">{bookings.filter((booking) => !booking.date || booking.date >= new Date().toISOString().slice(0, 10)).map((booking) => <div key={booking.id} className="py-4"><div className="font-semibold">{booking.vehicle?.yearMakeModel || 'Vehicle'} · {booking.date} {booking.time}</div><div className="mt-1 text-xs text-zinc-500">{booking.name}{booking.serviceAddress ? ` · ${booking.serviceAddress}` : ''} · {booking.status}</div></div>)}{!bookings.length ? <p className="py-5 text-sm text-zinc-500">No assigned bookings yet.</p> : null}</div></section>
          </div>
        </div>
      </div>
    </main>
  );
}
