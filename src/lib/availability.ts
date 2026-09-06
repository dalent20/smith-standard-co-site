import { addMinutes, localDateTimeToUtc } from '@/lib/time';

export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type AvailabilityRange = { start: string; end: string };

export type EmployeeRecord = {
  id: string;
  name: string;
  email?: string;
  role?: 'owner' | 'manager' | 'detailer';
  active?: boolean;
  bookable?: boolean;
  googleCalendarId?: string;
  weeklyAvailability?: Partial<Record<DayKey, AvailabilityRange[]>>;
  blockedDates?: string[];
};

export type BookingRecord = {
  id: string;
  date: string;
  time: string;
  durationMinutes?: number;
  crewIds?: string[];
  status?: string;
};

export type BusyWindow = { start: string; end: string };

export type CrewSlot = {
  time: string;
  crewIds: string[];
  crewNames: string[];
  availableCrewCount: number;
};

const dayKeys: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const blockingStatuses = new Set(['confirmed', 'deposit_paid', 'in_progress', 'scheduled']);

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function minutesToTime(minutes: number) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function intervalOverlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && endA > startB;
}

function employeeWorksRange(employee: EmployeeRecord, date: string, startMinute: number, endMinute: number) {
  if (employee.active === false || employee.bookable === false) return false;
  if ((employee.blockedDates ?? []).includes(date)) return false;

  const day = dayKeys[new Date(`${date}T12:00:00`).getDay()];
  const ranges = employee.weeklyAvailability?.[day] ?? [];
  return ranges.some((range) => startMinute >= timeToMinutes(range.start) && endMinute <= timeToMinutes(range.end));
}

function employeeHasBookingConflict(
  employeeId: string,
  date: string,
  startMinute: number,
  endMinute: number,
  bookings: BookingRecord[],
) {
  return bookings.some((booking) => {
    if (booking.date !== date) return false;
    if (!blockingStatuses.has(booking.status ?? '')) return false;
    if (!(booking.crewIds ?? []).includes(employeeId)) return false;
    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + Number(booking.durationMinutes ?? 180);
    return intervalOverlaps(startMinute, endMinute, bookingStart, bookingEnd);
  });
}

function employeeHasGoogleConflict(
  employee: EmployeeRecord,
  date: string,
  time: string,
  durationMinutes: number,
  busyByCalendar: Record<string, BusyWindow[]>,
) {
  if (!employee.googleCalendarId) return false;
  const busy = busyByCalendar[employee.googleCalendarId] ?? [];
  if (busy.length === 0) return false;

  const requestedStart = localDateTimeToUtc(date, time).getTime();
  const requestedEnd = addMinutes(new Date(requestedStart), durationMinutes).getTime();
  return busy.some((window) => requestedStart < new Date(window.end).getTime() && requestedEnd > new Date(window.start).getTime());
}

export function buildCrewSlots(input: {
  date: string;
  durationMinutes: number;
  employees: EmployeeRecord[];
  bookings: BookingRecord[];
  busyByCalendar?: Record<string, BusyWindow[]>;
  crewRequired?: number;
  stepMinutes?: number;
}) {
  const crewRequired = input.crewRequired ?? 2;
  const stepMinutes = input.stepMinutes ?? 30;
  const busyByCalendar = input.busyByCalendar ?? {};
  const slots: CrewSlot[] = [];

  // Deliberately broad operating envelope; employee hours decide what is truly offered.
  for (let start = 7 * 60; start <= 19 * 60 - input.durationMinutes; start += stepMinutes) {
    const end = start + input.durationMinutes;
    const time = minutesToTime(start);
    const available = input.employees.filter((employee) => {
      return (
        employeeWorksRange(employee, input.date, start, end) &&
        !employeeHasBookingConflict(employee.id, input.date, start, end, input.bookings) &&
        !employeeHasGoogleConflict(employee, input.date, time, input.durationMinutes, busyByCalendar)
      );
    });

    if (available.length >= crewRequired) {
      // Stable ordering makes assignment predictable; managers can reassign later.
      const assigned = available.slice(0, crewRequired);
      slots.push({
        time,
        crewIds: assigned.map((employee) => employee.id),
        crewNames: assigned.map((employee) => employee.name),
        availableCrewCount: available.length,
      });
    }
  }

  return slots;
}
