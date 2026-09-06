'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CalendarCheck, Plus, Shield, UserRound } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { EmployeeRecord } from '@/lib/availability';

const defaultAvailability = {
  mon: [{ start: '08:00', end: '17:00' }],
  tue: [{ start: '08:00', end: '17:00' }],
  wed: [{ start: '08:00', end: '17:00' }],
  thu: [{ start: '08:00', end: '17:00' }],
  fri: [{ start: '08:00', end: '17:00' }],
  sat: [{ start: '08:00', end: '17:00' }],
  sun: [],
};

type TeamMember = EmployeeRecord & { role: 'owner' | 'manager' | 'detailer' };

export default function AdminTeamPage() {
  const [employees, setEmployees] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({ name: '', email: '', role: 'detailer' as TeamMember['role'], googleCalendarId: '' });
  const [message, setMessage] = useState('');

  async function load() {
    const snapshot = await getDocs(collection(db, 'employees'));
    setEmployees(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TeamMember, 'id'>) })).sort((a, b) => a.name.localeCompare(b.name)));
  }

  useEffect(() => { load(); }, []);

  async function addEmployee(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name || !form.email) return;
    await addDoc(collection(db, 'employees'), {
      ...form,
      email: form.email.toLowerCase(),
      active: true,
      bookable: true,
      weeklyAvailability: defaultAvailability,
      blockedDates: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setForm({ name: '', email: '', role: 'detailer', googleCalendarId: '' });
    setMessage('Team profile created. The employee can create/sign into their Firebase account with the same email at /team.');
    await load();
  }

  async function patchEmployee(id: string, patch: Record<string, unknown>) {
    await updateDoc(doc(db, 'employees', id), { ...patch, updatedAt: serverTimestamp() });
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">People</div><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Team & roles</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">Managers can oversee bookings, people, and payments. Detailers manage their own availability and receive assigned jobs. Only bookable, active staff count toward the two-person crew requirement.</p></div>
        <a href="/team" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Open employee portal</a>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
        <form onSubmit={addEmployee} className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3"><Plus className="h-5 w-5" /><h2 className="text-xl font-semibold">Create profile</h2></div>
          <div className="mt-6 space-y-4">
            <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3" placeholder="Thomas Smith" required /></div>
            <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3" placeholder="team@smithstandard.co" required /></div>
            <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as TeamMember['role'] })} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3"><option value="detailer">Detailer</option><option value="manager">Manager</option><option value="owner">Owner</option></select></div>
            <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Google Calendar ID <span className="font-normal normal-case text-zinc-400">optional</span></label><input value={form.googleCalendarId} onChange={(e) => setForm({ ...form, googleCalendarId: e.target.value })} className="w-full rounded-xl border border-zinc-200 px-4 py-3" placeholder="employee@gmail.com" /><p className="mt-2 text-xs leading-5 text-zinc-500">For automatic conflict checking, this calendar must be readable by the Google account used by Smith Standard OS.</p></div>
            <button className="w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Create employee profile</button>
            {message ? <p className="text-xs leading-5 text-emerald-700">{message}</p> : null}
          </div>
        </form>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Roster</div><h2 className="mt-2 text-2xl font-semibold">{employees.length} team profiles</h2></div><UserRound className="h-6 w-6" /></div>
          <div className="mt-6 divide-y divide-zinc-100">
            {employees.map((employee) => (
              <div key={employee.id} className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><strong>{employee.name}</strong><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{employee.role}</span>{employee.googleCalendarId ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700"><CalendarCheck className="h-3 w-3" /> Calendar</span> : null}</div>
                  <div className="mt-1 text-sm text-zinc-500">{employee.email}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select value={employee.role} onChange={(e) => patchEmployee(employee.id, { role: e.target.value })} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"><option value="detailer">Detailer</option><option value="manager">Manager</option><option value="owner">Owner</option></select>
                  <button onClick={() => patchEmployee(employee.id, { bookable: employee.bookable === false ? true : false })} className={`rounded-lg px-3 py-2 text-xs font-semibold ${employee.bookable === false ? 'bg-zinc-200 text-zinc-600' : 'bg-emerald-100 text-emerald-800'}`}>{employee.bookable === false ? 'Not bookable' : 'Bookable'}</button>
                  <button onClick={() => patchEmployee(employee.id, { active: employee.active === false ? true : false })} className={`rounded-lg px-3 py-2 text-xs font-semibold ${employee.active === false ? 'bg-red-100 text-red-700' : 'bg-black text-white'}`}>{employee.active === false ? 'Inactive' : 'Active'}</button>
                </div>
              </div>
            ))}
            {!employees.length ? <div className="py-12 text-center text-sm text-zinc-500"><Shield className="mx-auto mb-3 h-6 w-6" />Create at least two active, bookable employees before opening online booking.</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
