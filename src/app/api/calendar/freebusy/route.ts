import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCalendarBusyWindows, isGoogleCalendarConfigured } from '@/lib/google-calendar';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { calendarIds = [], timeMin, timeMax } = await request.json();

    if (!Array.isArray(calendarIds) || !timeMin || !timeMax) {
      return NextResponse.json({ error: 'calendarIds, timeMin and timeMax are required.' }, { status: 400 });
    }

    if (!isGoogleCalendarConfigured()) {
      return NextResponse.json({ configured: false, calendars: {} });
    }

    const employeeSnapshot = await getDocs(collection(db, 'employees'));
    const allowedIds = new Set(
      employeeSnapshot.docs
        .map((employee) => employee.data().googleCalendarId)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    );

    const safeIds = calendarIds.filter((id: unknown): id is string => typeof id === 'string' && allowedIds.has(id));
    const calendars = await getCalendarBusyWindows(safeIds, timeMin, timeMax);

    return NextResponse.json({ configured: true, calendars });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to read calendar availability.' }, { status: 500 });
  }
}
