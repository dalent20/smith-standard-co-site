'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { CalendarDays, Camera, Check, Info, ShieldCheck, Users } from 'lucide-react';
import { auth, db, storage } from '@/lib/firebase';
import { getErrorMessage } from '@/lib/errors';
import {
  addOns,
  calculateQuote,
  careLevels,
  conditionLevels,
  travelZones,
  vehicleSizes,
  type AddOnKey,
  type ConditionLevel,
  type TravelZone,
  type VehicleSize,
} from '@/lib/pricing';
import {
  buildCrewSlots,
  type BookingRecord,
  type BusyWindow,
  type CrewSlot,
  type EmployeeRecord,
} from '@/lib/availability';
import { addMinutes, localDateTimeToUtc } from '@/lib/time';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

type SavedVehicle = {
  id: string;
  yearMakeModel: string;
  nickname?: string;
  size: VehicleSize;
};

type CheckoutResponse = {
  error?: string;
  checkoutUrl?: string;
};

type CalendarResponse = {
  configured?: boolean;
  calendars?: Record<string, BusyWindow[]>;
};

function isSavedVehicle(value: unknown): value is SavedVehicle {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.yearMakeModel === 'string' &&
    typeof record.size === 'string' &&
    record.size in vehicleSizes
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900">
      <span>{children}</span>
      {hint ? (
        <span className="group relative inline-flex">
          <Info className="h-4 w-4 text-zinc-400" />
          <span className="pointer-events-none absolute left-1/2 top-6 z-20 hidden w-72 -translate-x-1/2 rounded-xl bg-black p-3 text-xs font-normal leading-5 text-white shadow-xl group-hover:block">
            {hint}
          </span>
        </span>
      ) : null}
    </div>
  );
}

function ChoiceCard({ selected, title, subtitle, onClick }: { selected: boolean; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-32 rounded-2xl border p-4 text-left transition ${selected ? 'border-black bg-black text-white shadow-lg' : 'border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400'}`}>
      <div className="flex items-start justify-between gap-3"><strong className="text-base">{title}</strong>{selected ? <Check className="h-5 w-5 shrink-0" /> : null}</div>
      <p className={`mt-3 text-xs leading-5 ${selected ? 'text-zinc-300' : 'text-zinc-500'}`}>{subtitle}</p>
    </button>
  );
}

export default function BookingPage() {
  const [customerUid, setCustomerUid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [yearMakeModel, setYearMakeModel] = useState('');
  const [nickname, setNickname] = useState('');
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('small');
  const [condition, setCondition] = useState<ConditionLevel>('relatively-clean');
  const [careLevel, setCareLevel] = useState(3);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnKey[]>([]);
  const [travelZone, setTravelZone] = useState<TravelZone>('napa-core');
  const [membershipOptIn, setMembershipOptIn] = useState(false);
  const [rememberVehicle, setRememberVehicle] = useState(true);
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [date, setDate] = useState('');
  const [crewSlots, setCrewSlots] = useState<CrewSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CrewSlot | null>(null);
  const [calendarConfigured, setCalendarConfigured] = useState<boolean | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState('Choose a date to see live availability.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quote = useMemo(() => calculateQuote({ vehicleSize, condition, careLevel, addOns: selectedAddOns, travelZone, membershipOptIn }), [vehicleSize, condition, careLevel, selectedAddOns, travelZone, membershipOptIn]);

  function selectSavedVehicle(vehicle: SavedVehicle) {
    setYearMakeModel(vehicle.yearMakeModel);
    setNickname(vehicle.nickname ?? '');
    setVehicleSize(vehicle.size);
  }

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setCustomerUid(user?.uid ?? null);
    if (user?.email) setEmail((current) => current || user.email || '');
    if (user?.displayName) setName((current) => current || user.displayName || '');
  }), []);

  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem('smith-standard-vehicles') || '[]');
      const vehicles = Array.isArray(parsed) ? parsed.filter(isSavedVehicle) : [];
      setSavedVehicles(vehicles);
      const selectedId = localStorage.getItem('smith-standard-selected-vehicle');
      const selected = selectedId ? vehicles.find((vehicle) => vehicle.id === selectedId) : undefined;
      if (selected) {
        selectSavedVehicle(selected);
        localStorage.removeItem('smith-standard-selected-vehicle');
      }
      if (new URLSearchParams(window.location.search).get('membership') === '1') setMembershipOptIn(true);
    } catch {
      setSavedVehicles([]);
    }
  }, []);

  useEffect(() => {
    setSelectedSlot(null);
    if (!date) {
      setCrewSlots([]);
      setAvailabilityStatus('Choose a date to see live availability.');
      return;
    }

    let cancelled = false;
    async function loadAvailability() {
      setAvailabilityStatus('Checking two-person crew availability…');
      try {
        const [employeeSnapshot, bookingSnapshot] = await Promise.all([
          getDocs(collection(db, 'employees')),
          getDocs(collection(db, 'bookings')),
        ]);
        const employees: EmployeeRecord[] = employeeSnapshot.docs.map((employee) => ({ id: employee.id, ...(employee.data() as Omit<EmployeeRecord, 'id'>) }));
        const bookableEmployees = employees.filter((employee) => employee.active !== false && employee.bookable !== false);
        const bookings: BookingRecord[] = bookingSnapshot.docs.map((booking) => ({ id: booking.id, ...(booking.data() as Omit<BookingRecord, 'id'>) }));

        if (bookableEmployees.length < 2) {
          if (!cancelled) {
            setCrewSlots([]);
            setAvailabilityStatus('Online scheduling needs at least two active crew profiles. Please contact Smith Standard for availability.');
          }
          return;
        }

        const calendarIds = bookableEmployees.map((employee) => employee.googleCalendarId).filter((value): value is string => Boolean(value));
        let busyByCalendar: Record<string, BusyWindow[]> = {};
        if (calendarIds.length) {
          const dayStart = localDateTimeToUtc(date, '00:00');
          const dayEnd = addMinutes(dayStart, 24 * 60);
          const response = await fetch('/api/calendar/freebusy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ calendarIds, timeMin: dayStart.toISOString(), timeMax: dayEnd.toISOString() }),
          });
          if (response.ok) {
            const calendarData = (await response.json()) as CalendarResponse;
            busyByCalendar = calendarData.calendars ?? {};
            setCalendarConfigured(Boolean(calendarData.configured));
          }
        }

        const slots = buildCrewSlots({ date, durationMinutes: quote.estimatedDurationMinutes, employees: bookableEmployees, bookings, busyByCalendar, crewRequired: 2 });
        if (!cancelled) {
          setCrewSlots(slots);
          setAvailabilityStatus(slots.length ? `${slots.length} start times have at least two team members available for the full service window.` : 'No two-person crew window is currently available on this date.');
        }
      } catch (availabilityError: unknown) {
        console.error(availabilityError);
        if (!cancelled) {
          setCrewSlots([]);
          setAvailabilityStatus('We could not load live availability. Please try another date or contact Smith Standard.');
        }
      }
    }
    loadAvailability();
    return () => { cancelled = true; };
  }, [date, quote.estimatedDurationMinutes]);

  function toggleAddOn(key: AddOnKey) {
    setSelectedAddOns((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
  }

  async function uploadIntakePhotos() {
    if (!photos.length) return [] as string[];
    const intakeId = crypto.randomUUID();
    const safeEmail = (email || 'guest').replace(/[^a-z0-9@._-]/gi, '-');
    const urls: string[] = [];
    for (const [index, file] of photos.entries()) {
      const extension = file.name.split('.').pop() || 'jpg';
      const storageRef = ref(storage, `booking-intake/${safeEmail}/${intakeId}/${index + 1}.${extension}`);
      await uploadBytes(storageRef, file, { contentType: file.type || 'image/jpeg' });
      urls.push(await getDownloadURL(storageRef));
    }
    return urls;
  }

  async function reserve() {
    setError('');
    if (!name || !email || !serviceAddress || !yearMakeModel || !date || !selectedSlot) {
      setError('Complete your contact, vehicle, location, date, and appointment time before continuing.');
      return;
    }
    setSubmitting(true);
    try {
      const photoUrls = await uploadIntakePhotos();
      if (rememberVehicle) {
        const nextVehicle: SavedVehicle = { id: `${yearMakeModel.toLowerCase()}-${vehicleSize}`, yearMakeModel, nickname, size: vehicleSize };
        const next = [nextVehicle, ...savedVehicles.filter((vehicle) => vehicle.id !== nextVehicle.id)].slice(0, 8);
        localStorage.setItem('smith-standard-vehicles', JSON.stringify(next));
        setSavedVehicles(next);
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, serviceAddress, customerUid,
          vehicle: { yearMakeModel, nickname, size: vehicleSize, condition },
          careLevel, addOns: selectedAddOns, travelZone, membershipOptIn,
          date, time: selectedSlot.time, crewIds: selectedSlot.crewIds, photoUrls,
        }),
      });
      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok) throw new Error(data.error || 'Unable to begin checkout.');
      if (!data.checkoutUrl) throw new Error('Stripe did not return a checkout URL.');
      window.location.assign(data.checkoutUrl);
    } catch (reserveError: unknown) {
      console.error(reserveError);
      setError(getErrorMessage(reserveError, 'Something went wrong. Please try again.'));
      setSubmitting(false);
    }
  }

  const minDate = new Date().toISOString().slice(0, 10);
  const durationHours = (quote.estimatedDurationMinutes / 60).toFixed(quote.estimatedDurationMinutes % 60 ? 1 : 0);

  return (
    <main className="min-h-screen bg-[#f2f0ea] text-zinc-950">
      <section className="border-b border-black/10 bg-black px-5 pb-16 pt-28 text-white sm:px-8 sm:pt-36">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">Smith Standard & Co. Detailing</p>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div><h1 className="max-w-4xl text-5xl font-medium leading-[0.93] tracking-[-0.055em] sm:text-7xl lg:text-8xl">Build your detail. <span className="font-serif italic font-normal">Reserve your crew.</span></h1><p className="mt-7 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">Configure your vehicle, show us its current condition, choose the level of care you want, then select a time when a two-person Smith Standard crew is available.</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6"><div className="flex items-center gap-3 text-sm font-semibold"><ShieldCheck className="h-5 w-5" /> Payment schedule</div><div className="mt-5 grid grid-cols-2 gap-4"><div><div className="text-3xl font-semibold">50%</div><div className="mt-1 text-xs text-zinc-400">to reserve</div></div><div><div className="text-3xl font-semibold">50%</div><div className="mt-1 text-xs text-zinc-400">after service</div></div></div></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">01 — You</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Where should we serve you?</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><div><FieldLabel>Your name</FieldLabel><input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" placeholder="Your name" /></div><div><FieldLabel>Email</FieldLabel><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" placeholder="you@example.com" /></div><div><FieldLabel>Phone</FieldLabel><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" placeholder="(707) 555-0100" /></div><div><FieldLabel>Service address</FieldLabel><input value={serviceAddress} onChange={(e) => setServiceAddress(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" placeholder="Napa, CA" /></div></div></section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">02 — Vehicle</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Tell us what we are caring for.</h2>
            {savedVehicles.length ? <div className="mt-6"><FieldLabel>Saved vehicles</FieldLabel><div className="flex flex-wrap gap-2">{savedVehicles.map((vehicle) => <button key={vehicle.id} type="button" onClick={() => selectSavedVehicle(vehicle)} className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm hover:border-black">{vehicle.nickname || vehicle.yearMakeModel}</button>)}</div></div> : null}
            <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_.45fr]"><div><FieldLabel>Year + make + model</FieldLabel><input value={yearMakeModel} onChange={(e) => setYearMakeModel(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" placeholder="2024 Porsche 911 Carrera" /></div><div><FieldLabel>Nickname <span className="font-normal text-zinc-400">(optional)</span></FieldLabel><input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" placeholder="911" /></div></div>
            <div className="mt-8"><FieldLabel hint="Vehicle size changes both labor time and the starting price. Use the examples if you are unsure.">Vehicle size</FieldLabel><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{(Object.entries(vehicleSizes) as [VehicleSize, (typeof vehicleSizes)[VehicleSize]][]).map(([key, item]) => <ChoiceCard key={key} selected={vehicleSize === key} title={`${item.label} · ${money.format(item.base)}`} subtitle={item.examples} onClick={() => setVehicleSize(key)} />)}</div></div>
            <div className="mt-8"><FieldLabel hint="Choose based on the vehicle current condition. Intake photos help us verify the estimate.">Current condition</FieldLabel><div className="grid gap-3 lg:grid-cols-3">{(Object.entries(conditionLevels) as [ConditionLevel, (typeof conditionLevels)[ConditionLevel]][]).map(([key, item]) => <ChoiceCard key={key} selected={condition === key} title={item.label} subtitle={`${item.examples}${item.surcharge ? ` · +${money.format(item.surcharge)}` : ''}`} onClick={() => setCondition(key)} />)}</div></div>
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5"><div className="flex items-start gap-4"><Camera className="mt-1 h-5 w-5" /><div className="flex-1"><FieldLabel hint="A few intake photos help us catch unusually heavy condition issues before the crew arrives.">Vehicle photos</FieldLabel><input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 8))} className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" /><p className="mt-2 text-xs text-zinc-500">Optional · up to 8 photos · exterior, interior, and any areas needing special attention.</p></div></div></div>
            <label className="mt-5 flex items-center gap-3 text-sm text-zinc-600"><input type="checkbox" checked={rememberVehicle} onChange={(e) => setRememberVehicle(e.target.checked)} className="h-4 w-4" /> Remember this vehicle on this device for faster rebooking.</label>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">03 — Level of care</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Choose the intensity—or customize it.</h2><div className="mt-8 rounded-2xl bg-black p-6 text-white"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Selected</div><div className="mt-1 text-2xl font-semibold">{careLevels[careLevel].label}</div></div><div className="text-sm text-zinc-400">{careLevels[careLevel].adjustment === 0 ? 'Flagship service' : `${careLevels[careLevel].adjustment > 0 ? '+' : ''}${money.format(careLevels[careLevel].adjustment)}`}</div></div><input type="range" min="1" max="5" step="1" value={careLevel} onChange={(e) => setCareLevel(Number(e.target.value))} className="mt-7 w-full accent-white" /><div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider text-zinc-500"><span>Maintenance</span><span>The Standard</span><span>Restoration</span></div><p className="mt-5 text-sm leading-6 text-zinc-300">{careLevels[careLevel].description}</p></div>
            <div className="mt-8"><FieldLabel>Specific needs / add-ons</FieldLabel><div className="grid gap-3 sm:grid-cols-2">{(Object.entries(addOns) as [AddOnKey, (typeof addOns)[AddOnKey]][]).map(([key, item]) => { const selected = selectedAddOns.includes(key); return <button key={key} type="button" onClick={() => toggleAddOn(key)} className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-black bg-zinc-950 text-white' : 'border-zinc-200 hover:border-zinc-400'}`}><div className="flex justify-between gap-4"><strong>{item.label}</strong><span className="text-sm">+{money.format(item.price)}</span></div><p className={`mt-2 text-xs leading-5 ${selected ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.description}</p></button>; })}</div></div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">04 — Location & membership</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Mobile service, priced transparently.</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{(Object.entries(travelZones) as [TravelZone, (typeof travelZones)[TravelZone]][]).map(([key, item]) => <ChoiceCard key={key} selected={travelZone === key} title={`${item.label}${item.fee ? ` · +${money.format(item.fee)}` : ' · Included'}`} subtitle={item.examples} onClick={() => setTravelZone(key)} />)}</div>
            <button type="button" onClick={() => setMembershipOptIn((value) => !value)} className={`mt-7 w-full rounded-2xl border p-6 text-left ${membershipOptIn ? 'border-black bg-black text-white' : 'border-zinc-200 bg-zinc-50'}`}><div className="flex items-start justify-between gap-5"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-50">Smith Standard Membership</div><div className="mt-2 text-2xl font-semibold">Every two months. Always maintained.</div></div>{membershipOptIn ? <Check className="h-6 w-6" /> : null}</div><p className={`mt-3 max-w-2xl text-sm leading-6 ${membershipOptIn ? 'text-zinc-300' : 'text-zinc-600'}`}>Opt in now for 10% off this first detail. After that, recurring details are 30% off and scheduled every two months.</p><div className="mt-4 text-sm font-semibold">Recurring estimate: {money.format(quote.recurringMembershipPrice)} every 2 months</div></button>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">05 — Appointment</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Pick a time when two people are free.</h2><div className="mt-7 max-w-sm"><FieldLabel>Preferred date</FieldLabel><input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-black" /></div><div className="mt-5 flex items-start gap-3 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600"><Users className="mt-0.5 h-5 w-5 shrink-0" /><div><strong className="text-zinc-900">Two-person crew required.</strong><br />{availabilityStatus}{calendarConfigured === false ? ' Employee OS hours and Smith Standard bookings are active; Google Calendar server credentials still need to be added to Vercel for external-calendar conflict checking.' : ''}</div></div>
            {crewSlots.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{crewSlots.map((slot) => <button key={slot.time} type="button" onClick={() => setSelectedSlot(slot)} className={`rounded-xl border px-4 py-4 text-left ${selectedSlot?.time === slot.time ? 'border-black bg-black text-white' : 'border-zinc-200 bg-white hover:border-black'}`}><div className="font-semibold">{new Date(`2000-01-01T${slot.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div><div className={`mt-1 text-[11px] ${selectedSlot?.time === slot.time ? 'text-zinc-400' : 'text-zinc-500'}`}>{slot.crewNames.join(' + ')}</div></button>)}</div> : null}
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start"><div className="overflow-hidden rounded-3xl bg-black text-white shadow-2xl"><div className="border-b border-white/10 p-6"><div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Your estimate</div><div className="mt-3 text-4xl font-semibold tracking-tight">{money.format(quote.total)}</div>{membershipOptIn ? <div className="mt-2 text-sm text-emerald-300">Includes {money.format(quote.membershipDiscount)} first-detail membership savings</div> : null}</div><div className="space-y-4 p-6 text-sm"><div className="flex justify-between gap-4"><span className="text-zinc-400">Vehicle</span><span className="text-right">{yearMakeModel || vehicleSizes[vehicleSize].label}</span></div><div className="flex justify-between gap-4"><span className="text-zinc-400">Care level</span><span>{careLevels[careLevel].label}</span></div><div className="flex justify-between gap-4"><span className="text-zinc-400">Condition</span><span>{conditionLevels[condition].label}</span></div><div className="flex justify-between gap-4"><span className="text-zinc-400">Travel</span><span>{travelZones[travelZone].fee ? money.format(travelZones[travelZone].fee) : 'Included'}</span></div><div className="flex justify-between gap-4"><span className="text-zinc-400">Estimated service time</span><span>~{durationHours} hrs</span></div><div className="flex justify-between gap-4"><span className="text-zinc-400">Crew</span><span>2 detailers</span></div>{selectedSlot ? <div className="flex justify-between gap-4"><span className="text-zinc-400">Appointment</span><span className="text-right">{date} · {selectedSlot.time}</span></div> : null}</div><div className="border-t border-white/10 p-6"><div className="flex justify-between"><div><div className="text-xs text-zinc-500">Due now</div><div className="mt-1 text-2xl font-semibold">{money.format(quote.deposit)}</div></div><div className="text-right"><div className="text-xs text-zinc-500">After detail</div><div className="mt-1 text-2xl font-semibold">{money.format(quote.balance)}</div></div></div>{error ? <p className="mt-4 rounded-xl bg-red-950/60 p-3 text-sm text-red-200">{error}</p> : null}<button type="button" disabled={submitting || !selectedSlot} onClick={reserve} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40">{submitting ? 'Preparing secure checkout…' : `Reserve with ${money.format(quote.deposit)}`}</button><div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-500"><ShieldCheck className="h-4 w-4" /> Secure Stripe-hosted payment · card saved with Stripe for the approved remaining balance</div></div></div><div className="mt-4 rounded-2xl border border-black/10 bg-white p-5 text-sm leading-6 text-zinc-600"><CalendarDays className="mb-3 h-5 w-5 text-black" /><strong className="text-black">Why the times can change</strong><br />The scheduler checks service length, two-person staffing, existing bookings, employee hours, blocked dates, and connected Google calendars.</div></aside>
      </div></section>
    </main>
  );
}
