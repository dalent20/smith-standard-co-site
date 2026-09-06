'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { CalendarDays, Clock3 } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { EmployeeRecord } from '@/lib/availability';

type Booking = {
  id: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  crewIds?: string[];
  name?: string;
  serviceAddress?: string;
  status?: string;
  vehicle?: { yearMakeModel?: string };
};

const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export default function AdminCrewCalendarPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    Promise.all([getDocs(collection(db, 'employees')), getDocs(collection(db, 'bookings'))]).then(([employeeSnapshot, bookingSnapshot]) => {
      setEmployees(employeeSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<EmployeeRecord, 'id'>) })).filter((employee) => employee.active !== false));
      setBookings(bookingSnapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Booking, 'id'>) })));
    });
  }, []);

  const dayKey = dayKeys[new Date(`${date}T12:00:00`).getDay()];
  const selectedBookings = bookings.filter((booking) => booking.date === date && booking.status !== 'cancelled');

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Dispatch</div><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Crew calendar</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">See every active employee side-by-side. Customer booking only opens a slot when at least two people can cover the full estimated service duration.</p></div><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">View date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm" /></div></div>

      <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-sm">
        <div className="grid min-w-[900px]" style={{ gridTemplateColumns: `repeat(${Math.max(employees.length, 1)}, minmax(260px, 1fr))` }}>
          {employees.map((employee) => {
            const employeeBookings = selectedBookings.filter((booking) => (booking.crewIds ?? []).includes(employee.id));
            const ranges = employee.weeklyAvailability?.[dayKey] ?? [];
            const blocked = (employee.blockedDates ?? []).includes(date);
            return (
              <section key={employee.id} className="min-h-[620px] border-r border-zinc-100 p-5 last:border-r-0">
                <div className="border-b border-zinc-100 pb-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{employee.name}</h2><p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">{employee.role || 'detailer'}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${blocked || employee.bookable === false ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{blocked ? 'Blocked' : employee.bookable === false ? 'Not bookable' : 'Bookable'}</span></div><div className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><Clock3 className="h-4 w-4" />{blocked ? 'Unavailable all day' : ranges.length ? ranges.map((range) => `${range.start}–${range.end}`).join(', ') : 'No working hours set'}</div>{employee.googleCalendarId ? <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500"><CalendarDays className="h-4 w-4" />Google Calendar connected by ID</div> : null}</div>
                <div className="mt-5 space-y-3">{employeeBookings.map((booking) => <article key={booking.id} className="rounded-2xl bg-black p-4 text-white"><div className="text-[10px] uppercase tracking-wider text-zinc-500">{booking.time} · ~{Math.round(Number(booking.durationMinutes ?? 180) / 30) / 2} hrs</div><div className="mt-2 font-semibold">{booking.vehicle?.yearMakeModel || 'Vehicle'}</div><div className="mt-1 text-xs text-zinc-400">{booking.name}</div>{booking.serviceAddress ? <div className="mt-3 text-xs leading-5 text-zinc-500">{booking.serviceAddress}</div> : null}<div className="mt-3 text-[10px] uppercase tracking-wider text-zinc-500">{booking.status}</div></article>)}{!employeeBookings.length ? <div className="rounded-2xl border border-dashed border-zinc-200 p-5 text-center text-xs text-zinc-400">No assigned details</div> : null}</div>
              </section>
            );
          })}
          {!employees.length ? <div className="p-12 text-center text-sm text-zinc-500">No active employees. Add at least two in Team & Roles.</div> : null}
        </div>
      </div>
    </div>
  );
}
