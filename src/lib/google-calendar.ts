const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';

type BusyWindow = { start: string; end: string };
type FreeBusyCalendar = { busy?: BusyWindow[] };
type FreeBusyResponse = { calendars?: Record<string, FreeBusyCalendar> };

async function getAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Google token refresh failed', await response.text());
    return null;
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function getCalendarBusyWindows(calendarIds: string[], timeMin: string, timeMax: string) {
  const accessToken = await getAccessToken();
  if (!accessToken || calendarIds.length === 0) return {} as Record<string, BusyWindow[]>;

  const response = await fetch(`${GOOGLE_CALENDAR_BASE}/freeBusy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: 'America/Los_Angeles',
      items: calendarIds.map((id) => ({ id })),
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Google Calendar free/busy failed', await response.text());
    return {} as Record<string, BusyWindow[]>;
  }

  const data = (await response.json()) as FreeBusyResponse;
  const result: Record<string, BusyWindow[]> = {};
  for (const [calendarId, value] of Object.entries(data.calendars ?? {})) {
    result[calendarId] = Array.isArray(value.busy) ? value.busy : [];
  }
  return result;
}

export async function createCompanyCalendarEvent(input: {
  bookingId: string;
  title: string;
  description: string;
  location?: string;
  start: string;
  end: string;
  attendeeEmails?: string[];
}) {
  const calendarId = process.env.SMITH_STANDARD_CALENDAR_ID;
  const accessToken = await getAccessToken();
  if (!accessToken || !calendarId) return null;

  const response = await fetch(`${GOOGLE_CALENDAR_BASE}/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: input.title,
      description: `${input.description}\n\nSmith Standard booking: ${input.bookingId}`,
      location: input.location,
      start: { dateTime: input.start, timeZone: 'America/Los_Angeles' },
      end: { dateTime: input.end, timeZone: 'America/Los_Angeles' },
      attendees: (input.attendeeEmails ?? []).filter(Boolean).map((email) => ({ email })),
      extendedProperties: { private: { smithStandardBookingId: input.bookingId } },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Google Calendar event creation failed', await response.text());
    return null;
  }

  return response.json() as Promise<{ id?: string; htmlLink?: string }>;
}

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      process.env.SMITH_STANDARD_CALENDAR_ID,
  );
}
