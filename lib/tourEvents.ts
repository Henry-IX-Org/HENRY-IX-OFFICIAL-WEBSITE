/**
 * ============================================================================
 * HENRY IX TOUR & GIG DISPATCH SYSTEM — CENTRAL EVENT ADAPTER
 * ============================================================================
 * Connects the public tour calendar directly to the Notion Studio Bookings DB,
 * with automatic fallbacks to Google Calendar and verified tour dates.
 * Adheres strictly to AGENTS.md retro-futuristic audio engineering aesthetics.
 * ============================================================================
 */

import { getNotionBookings, NotionBooking } from './notion';
import { fetchWithKVCache } from './cloudflare';

export interface TourEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  country: string;
  dateStr: string;       // e.g. "12 SEP 2026"
  isoDate: string;       // e.g. "2026-09-12"
  displayDay: string;    // e.g. "12"
  displayMonth: string;  // e.g. "SEP"
  displayYear: string;   // e.g. "2026"
  dayOfWeek: string;     // e.g. "SAT"
  startTime: string;     // e.g. "23:00"
  endTime: string;       // e.g. "04:00"
  callTime: string;      // e.g. "22:30"
  doorsTime: string;     // e.g. "22:00"
  startIso: string;      // RFC-compliant start ISO e.g. "2026-09-12T23:00:00.000Z"
  endIso: string;        // RFC-compliant end ISO with next-day rollover e.g. "2026-09-13T04:00:00.000Z"
  startIcal: string;     // iCalendar DTSTART format e.g. "20260912T230000Z"
  endIcal: string;       // iCalendar DTEND format e.g. "20260913T040000Z"
  status: 'TICKETS AVAILABLE' | 'SELLING FAST' | 'VIP ONLY' | 'CONFIRMED' | 'ON SALE' | 'SOLD OUT' | 'FREE' | string;
  lat: number;
  lng: number;
  ticketSerial: string;  // e.g. "HIX-LON-9012"
  ticketLink: string;    // Resident Advisor or ticket platform URL
  promoter?: string;
  notes?: string;
  eventType?: string;
  depositPaid?: boolean;
  deckAccentIndex: number; // 0: Red, 1: Blue, 2: Green, 3: Yellow (CDJ Symmetrical Accents from AGENTS.md)
  source: 'notion' | 'calendar' | 'verified';
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

/**
 * Computes RFC 5545 and Schema.org compliant ISO and iCalendar timestamps.
 * If the set crosses midnight (e.g. 23:00 to 04:00), end date accurately rolls over to the next day.
 */
export function getEventDateTimes(
  isoDate: string,
  startTime: string = '23:00',
  endTime: string = '04:00'
): {
  startIso: string;
  endIso: string;
  startIcal: string;
  endIcal: string;
} {
  const [y, m, d] = (isoDate || '2026-09-12').split('T')[0].split('-').map(Number);
  const startParts = (startTime || '23:00').split(':').map(Number);
  const endParts = (endTime || '04:00').split(':').map(Number);

  const startH = isNaN(startParts[0]) ? 23 : startParts[0];
  const startM = isNaN(startParts[1]) ? 0 : startParts[1];
  const endH = isNaN(endParts[0]) ? 4 : endParts[0];
  const endM = isNaN(endParts[1]) ? 0 : endParts[1];

  const startDate = new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1, startH, startM, 0));

  // Determine if set crosses midnight: end time is numerically <= start time
  const crossesMidnight = endH < startH || (endH === startH && endM <= startM);
  const endDate = new Date(
    Date.UTC(
      y || 2026,
      (m || 1) - 1,
      crossesMidnight ? (d || 1) + 1 : (d || 1),
      endH,
      endM,
      0
    )
  );

  const formatIcal = (date: Date) => {
    const yr = date.getUTCFullYear();
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
    const da = String(date.getUTCDate()).padStart(2, '0');
    const hr = String(date.getUTCHours()).padStart(2, '0');
    const mi = String(date.getUTCMinutes()).padStart(2, '0');
    const se = String(date.getUTCSeconds()).padStart(2, '0');
    return `${yr}${mo}${da}T${hr}${mi}${se}Z`;
  };

  return {
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString(),
    startIcal: formatIcal(startDate),
    endIcal: formatIcal(endDate),
  };
}

function makeDefaultGig(data: Omit<TourEvent, 'startIso' | 'endIso' | 'startIcal' | 'endIcal'>): TourEvent {
  const times = getEventDateTimes(data.isoDate, data.startTime, data.endTime);
  return {
    ...data,
    startIso: times.startIso,
    endIso: times.endIso,
    startIcal: times.startIcal,
    endIcal: times.endIcal,
  };
}

export const DEFAULT_TOUR_EVENTS: TourEvent[] = [
  makeDefaultGig({
    id: 'gig-lon-01',
    title: 'MINISTRY OF SOUND (MAIN ROOM)',
    venue: 'MINISTRY OF SOUND (MAIN ROOM)',
    city: 'LONDON',
    country: 'UNITED KINGDOM',
    dateStr: '12 SEP 2026',
    isoDate: '2026-09-12',
    displayDay: '12',
    displayMonth: 'SEP',
    displayYear: '2026',
    dayOfWeek: 'SAT',
    startTime: '23:00',
    endTime: '04:00',
    callTime: '22:30',
    doorsTime: '22:00',
    status: 'TICKETS AVAILABLE',
    lat: 51.4984,
    lng: -0.0998,
    ticketSerial: 'HIX-LON-9012',
    ticketLink: 'https://ra.co',
    promoter: 'Ministry of Sound Club',
    deckAccentIndex: 0, // Deck 1 Red
    source: 'verified',
  }),
  makeDefaultGig({
    id: 'gig-ibz-02',
    title: 'AMNESIA (TERRACE)',
    venue: 'AMNESIA (TERRACE)',
    city: 'IBIZA',
    country: 'SPAIN',
    dateStr: '28 SEP 2026',
    isoDate: '2026-09-28',
    displayDay: '28',
    displayMonth: 'SEP',
    displayYear: '2026',
    dayOfWeek: 'MON',
    startTime: '00:00',
    endTime: '06:00',
    callTime: '23:30',
    doorsTime: '23:00',
    status: 'SELLING FAST',
    lat: 38.9567,
    lng: 1.4072,
    ticketSerial: 'HIX-IBZ-4028',
    ticketLink: 'https://ra.co',
    promoter: 'Amnesia Events Group',
    deckAccentIndex: 1, // Deck 2 Blue
    source: 'verified',
  }),
  makeDefaultGig({
    id: 'gig-ber-03',
    title: 'WATERGATE (FLOOR 1)',
    venue: 'WATERGATE (FLOOR 1)',
    city: 'BERLIN',
    country: 'GERMANY',
    dateStr: '15 OCT 2026',
    isoDate: '2026-10-15',
    displayDay: '15',
    displayMonth: 'OCT',
    displayYear: '2026',
    dayOfWeek: 'THU',
    startTime: '23:30',
    endTime: '05:00',
    callTime: '23:00',
    doorsTime: '22:30',
    status: 'VIP ONLY',
    lat: 52.5015,
    lng: 13.4447,
    ticketSerial: 'HIX-BER-8115',
    ticketLink: 'https://ra.co',
    promoter: 'Watergate Club Berlin',
    deckAccentIndex: 2, // Deck 3 Green
    source: 'verified',
  }),
  makeDefaultGig({
    id: 'gig-ams-04',
    title: 'ADE (AMSTERDAM DANCE EVENT)',
    venue: 'ADE (AMSTERDAM DANCE EVENT)',
    city: 'AMSTERDAM',
    country: 'NETHERLANDS',
    dateStr: '22 OCT 2026',
    isoDate: '2026-10-22',
    displayDay: '22',
    displayMonth: 'OCT',
    displayYear: '2026',
    dayOfWeek: 'THU',
    startTime: '22:00',
    endTime: '06:00',
    callTime: '21:30',
    doorsTime: '21:00',
    status: 'CONFIRMED',
    lat: 52.3676,
    lng: 4.9041,
    ticketSerial: 'HIX-ADE-2026',
    ticketLink: 'https://ra.co',
    promoter: 'Amsterdam Dance Event',
    deckAccentIndex: 3, // Deck 4 Yellow
    source: 'verified',
  }),
  makeDefaultGig({
    id: 'gig-man-05',
    title: 'THE WAREHOUSE PROJECT',
    venue: 'THE WAREHOUSE PROJECT',
    city: 'MANCHESTER',
    country: 'UNITED KINGDOM',
    dateStr: '07 NOV 2026',
    isoDate: '2026-11-07',
    displayDay: '07',
    displayMonth: 'NOV',
    displayYear: '2026',
    dayOfWeek: 'SAT',
    startTime: '21:00',
    endTime: '04:00',
    callTime: '20:30',
    doorsTime: '20:00',
    status: 'ON SALE',
    lat: 53.4770,
    lng: -2.2312,
    ticketSerial: 'HIX-MAN-3007',
    ticketLink: 'https://ra.co',
    promoter: 'WHP Manchester',
    deckAccentIndex: 0, // Deck 1 Red
    source: 'verified',
  }),
  makeDefaultGig({
    id: 'gig-e1-06',
    title: 'E1 LONDON (WAREHOUSE)',
    venue: 'E1 LONDON (WAREHOUSE)',
    city: 'LONDON',
    country: 'UNITED KINGDOM',
    dateStr: '28 NOV 2026',
    isoDate: '2026-11-28',
    displayDay: '28',
    displayMonth: 'NOV',
    displayYear: '2026',
    dayOfWeek: 'SAT',
    startTime: '23:00',
    endTime: '06:00',
    callTime: '22:30',
    doorsTime: '22:00',
    status: 'TICKETS AVAILABLE',
    lat: 51.5113,
    lng: -0.0577,
    ticketSerial: 'HIX-LON-5028',
    ticketLink: 'https://ra.co',
    promoter: 'E1 Events',
    deckAccentIndex: 1, // Deck 2 Blue
    source: 'verified',
  }),
];

export function parseTourDate(dateInput: string | Date): {
  dateStr: string;
  isoDate: string;
  displayDay: string;
  displayMonth: string;
  displayYear: string;
  dayOfWeek: string;
  dateObj: Date;
} {
  let dateObj: Date;
  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else if (typeof dateInput === 'string') {
    if (dateInput.includes('T') || dateInput.includes('-')) {
      const parts = dateInput.split('T')[0].split('-').map(Number);
      if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        // Noon (12:00) prevents DST or timezone boundary date drift
        dateObj = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
      } else {
        dateObj = new Date(dateInput);
      }
    } else {
      dateObj = new Date(dateInput);
    }
  } else {
    dateObj = new Date();
  }

  if (isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  const y = dateObj.getFullYear();
  const m = dateObj.getMonth();
  const d = dateObj.getDate();
  const dayOfWeek = DAYS[dateObj.getDay()];
  const displayDay = d.toString().padStart(2, '0');
  const displayMonth = MONTHS[m];
  const displayYear = y.toString();
  const isoDate = `${y}-${(m + 1).toString().padStart(2, '0')}-${displayDay}`;
  const dateStr = `${displayDay} ${displayMonth} ${displayYear}`;

  return {
    dateStr,
    isoDate,
    displayDay,
    displayMonth,
    displayYear,
    dayOfWeek,
    dateObj,
  };
}

export function parseVenueAndLocation(
  rawVenue: string,
  notes?: string
): { venue: string; city: string; country: string; lat: number; lng: number; code: string } {
  const venue = (rawVenue || '').trim() || 'TBA VENUE';
  const combined = `${venue} ${notes || ''}`.toUpperCase();

  // Known iconic electronic music club and venue presets
  const VENUE_ALIASES = [
    { match: 'AMNESIA', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.9567, lng: 1.4072 },
    { match: 'DC-10', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.8689, lng: 1.3917 },
    { match: 'DC10', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.8689, lng: 1.3917 },
    { match: 'PACHA', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.9178, lng: 1.4429 },
    { match: 'HÏ IBIZA', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.8876, lng: 1.4042 },
    { match: 'HI IBIZA', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.8876, lng: 1.4042 },
    { match: 'USHUAÏA', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.8864, lng: 1.4047 },
    { match: 'USHUAIA', city: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.8864, lng: 1.4047 },
    { match: 'WATERGATE', city: 'BERLIN', country: 'GERMANY', code: 'BER', lat: 52.5015, lng: 13.4447 },
    { match: 'BERGHAIN', city: 'BERLIN', country: 'GERMANY', code: 'BER', lat: 52.5111, lng: 13.4431 },
    { match: 'TRESOR', city: 'BERLIN', country: 'GERMANY', code: 'BER', lat: 52.5110, lng: 13.4194 },
    { match: 'WAREHOUSE PROJECT', city: 'MANCHESTER', country: 'UNITED KINGDOM', code: 'MAN', lat: 53.4770, lng: -2.2312 },
    { match: 'WHP', city: 'MANCHESTER', country: 'UNITED KINGDOM', code: 'MAN', lat: 53.4770, lng: -2.2312 },
    { match: 'ADE', city: 'AMSTERDAM', country: 'NETHERLANDS', code: 'AMS', lat: 52.3676, lng: 4.9041 },
    { match: 'SHELTER', city: 'AMSTERDAM', country: 'NETHERLANDS', code: 'AMS', lat: 52.3833, lng: 4.9022 },
    { match: 'AWAKENINGS', city: 'AMSTERDAM', country: 'NETHERLANDS', code: 'AMS', lat: 52.3900, lng: 4.7500 },
    { match: 'MINISTRY OF SOUND', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.4984, lng: -0.0998 },
    { match: 'FABRIC', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.5198, lng: -0.1023 },
    { match: 'E1', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.5113, lng: -0.0577 },
    { match: 'PRINTWORKS', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.4975, lng: -0.0436 },
    { match: 'DRUMSHEDS', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.6083, lng: -0.0381 },
    { match: 'FOLD', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.5204, lng: 0.0075 },
    { match: 'KOKO', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.5348, lng: -0.1388 },
    { match: 'ROUNDHOUSE', city: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.5431, lng: -0.1517 },
    { match: 'SUB CLUB', city: 'GLASGOW', country: 'UNITED KINGDOM', code: 'GLA', lat: 55.8569, lng: -4.2543 },
    { match: 'MOTION', city: 'BRISTOL', country: 'UNITED KINGDOM', code: 'BRS', lat: 51.4509, lng: -2.5744 },
  ];

  for (const v of VENUE_ALIASES) {
    if (combined.includes(v.match)) {
      return {
        venue,
        city: v.city,
        country: v.country,
        lat: v.lat,
        lng: v.lng,
        code: v.code,
      };
    }
  }

  const KNOWN_CITIES = [
    { name: 'IBIZA', country: 'SPAIN', code: 'IBZ', lat: 38.9567, lng: 1.4072 },
    { name: 'BERLIN', country: 'GERMANY', code: 'BER', lat: 52.5015, lng: 13.4447 },
    { name: 'AMSTERDAM', country: 'NETHERLANDS', code: 'AMS', lat: 52.3676, lng: 4.9041 },
    { name: 'MANCHESTER', country: 'UNITED KINGDOM', code: 'MAN', lat: 53.4770, lng: -2.2312 },
    { name: 'PARIS', country: 'FRANCE', code: 'PAR', lat: 48.8566, lng: 2.3522 },
    { name: 'BRISTOL', country: 'UNITED KINGDOM', code: 'BRS', lat: 51.4545, lng: -2.5879 },
    { name: 'BARCELONA', country: 'SPAIN', code: 'BCN', lat: 41.3879, lng: 2.1699 },
    { name: 'NEW YORK', country: 'UNITED STATES', code: 'NYC', lat: 40.7128, lng: -74.0060 },
    { name: 'TOKYO', country: 'JAPAN', code: 'TYO', lat: 35.6762, lng: 139.6503 },
    { name: 'GLASGOW', country: 'UNITED KINGDOM', code: 'GLA', lat: 55.8569, lng: -4.2543 },
    { name: 'LONDON', country: 'UNITED KINGDOM', code: 'LON', lat: 51.5074, lng: -0.1278 },
  ];

  for (const c of KNOWN_CITIES) {
    if (combined.includes(c.name)) {
      const cleanedVenue = venue.replace(new RegExp(`,?\\s*${c.name}.*`, 'i'), '').trim() || venue;
      return {
        venue: cleanedVenue,
        city: c.name,
        country: c.country,
        lat: c.lat,
        lng: c.lng,
        code: c.code,
      };
    }
  }

  if (venue.includes(',')) {
    const rawParts = venue.split(',').map((p) => p.trim()).filter(Boolean);
    const v = rawParts[0] || venue;
    let c = rawParts.length > 1 ? rawParts[1].toUpperCase() : 'LONDON';
    let country = rawParts.length > 2 ? rawParts[2].toUpperCase() : 'UNITED KINGDOM';

    if (c.endsWith(' UK') || c.endsWith(' GB')) {
      c = c.replace(/\s+(UK|GB)$/, '').trim();
      country = 'UNITED KINGDOM';
    }
    if (country === 'UK' || country === 'GB' || country === 'SCOTLAND' || country === 'ENGLAND' || country === 'WALES') {
      country = 'UNITED KINGDOM';
    }

    const code = c.slice(0, 3).replace(/[^A-Z]/g, '') || 'LON';
    return {
      venue: v,
      city: c,
      country,
      lat: 51.5074,
      lng: -0.1278,
      code,
    };
  }

  return {
    venue,
    city: 'LONDON',
    country: 'UNITED KINGDOM',
    lat: 51.5074,
    lng: -0.1278,
    code: 'LON',
  };
}

export function parseTicketLink(booking: NotionBooking): string {
  if (booking.ticketLink && booking.ticketLink.startsWith('http')) {
    return booking.ticketLink;
  }
  if (booking.notes) {
    const match = booking.notes.match(/https?:\/\/[^\s]+/);
    if (match) {
      return match[0];
    }
  }
  return 'https://ra.co';
}

export function generateTicketSerial(cityCode: string, id: string, index: number): string {
  const cleanId = id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const num = (9010 + index * 17).toString();
  return `HIX-${cityCode || 'LON'}-${cleanId || num}`;
}

export function mapNotionBookingToTourEvent(booking: NotionBooking, index: number): TourEvent {
  const parsedDate = parseTourDate(booking.eventDate || new Date());
  const geo = parseVenueAndLocation(booking.venue, booking.notes);
  const ticketLink = parseTicketLink(booking);
  const ticketSerial = generateTicketSerial(geo.code, booking.id, index);

  const stageLower = (booking.stage || '').toLowerCase();
  const notesLower = (booking.notes || '').toLowerCase();

  let status = 'TICKETS AVAILABLE';
  if (notesLower.includes('sold out') || stageLower.includes('sold out')) {
    status = 'SOLD OUT';
  } else if (notesLower.includes('selling fast')) {
    status = 'SELLING FAST';
  } else if (notesLower.includes('vip only')) {
    status = 'VIP ONLY';
  } else if (stageLower.includes('confirmed') || booking.depositPaid) {
    status = 'CONFIRMED';
  } else if (stageLower.includes('contract')) {
    status = 'ON SALE';
  }

  let startTime = '23:00';
  let endTime = '04:00';
  let callTime = '22:30';
  let doorsTime = '22:00';

  if (booking.notes) {
    const setMatch = booking.notes.match(/set(?:[\s_-]*time)?[:\s]+(\d{1,2}:\d{2})\s*(?:-|to|—)\s*(\d{1,2}:\d{2})/i);
    if (setMatch) {
      startTime = setMatch[1];
      endTime = setMatch[2];
    }
    const callMatch = booking.notes.match(/call(?:[\s_-]*time)?[:\s]+(\d{1,2}:\d{2})/i);
    if (callMatch) {
      callTime = callMatch[1];
    }
    const doorsMatch = booking.notes.match(/doors(?:[\s_-]*open)?[:\s]+(\d{1,2}:\d{2})/i);
    if (doorsMatch) {
      doorsTime = doorsMatch[1];
    }
  }

  const times = getEventDateTimes(parsedDate.isoDate, startTime, endTime);

  return {
    id: booking.id,
    title: booking.title || `HENRY IX LIVE @ ${geo.venue}`,
    venue: geo.venue,
    city: geo.city,
    country: geo.country,
    dateStr: parsedDate.dateStr,
    isoDate: parsedDate.isoDate,
    displayDay: parsedDate.displayDay,
    displayMonth: parsedDate.displayMonth,
    displayYear: parsedDate.displayYear,
    dayOfWeek: parsedDate.dayOfWeek,
    startTime,
    endTime,
    callTime,
    doorsTime,
    startIso: times.startIso,
    endIso: times.endIso,
    startIcal: times.startIcal,
    endIcal: times.endIcal,
    status,
    lat: geo.lat,
    lng: geo.lng,
    ticketSerial,
    ticketLink,
    promoter: booking.client || undefined,
    notes: booking.notes || undefined,
    eventType: booking.eventType || 'Club Performance',
    depositPaid: booking.depositPaid,
    deckAccentIndex: index % 4,
    source: 'notion',
  };
}

function parseICSDate(dateStr: string): Date {
  const cleanStr = dateStr.replace(/[^0-9TZ]/g, '');
  const year = parseInt(cleanStr.substring(0, 4), 10);
  const month = parseInt(cleanStr.substring(4, 6), 10) - 1;
  const day = parseInt(cleanStr.substring(6, 8), 10);

  if (cleanStr.includes('T')) {
    const hour = parseInt(cleanStr.substring(9, 11), 10);
    const min = parseInt(cleanStr.substring(11, 13), 10);
    const sec = parseInt(cleanStr.substring(13, 15), 10);

    if (cleanStr.endsWith('Z')) {
      return new Date(Date.UTC(year, month, day, hour, min, sec));
    }
    return new Date(year, month, day, hour, min, sec);
  }

  return new Date(year, month, day);
}

export async function fetchGoogleCalendarGigs(): Promise<TourEvent[] | null> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) return null;

  return fetchWithKVCache(
    `gcal_events_${calendarId}`,
    async () => {
      try {
        const url = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId)}/public/basic.ics`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return null;

    const icsText = await res.text();
    const parsedEvents: any[] = [];
    const lines = icsText.split(/\r?\n/);
    let currentEvent: any = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        line += lines[i + 1].substring(1);
        i++;
      }

      if (line.startsWith('BEGIN:VEVENT')) {
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT') && currentEvent) {
        parsedEvents.push(currentEvent);
        currentEvent = null;
      } else if (currentEvent) {
        const match = line.match(/^([^;:]+)(?:;[^:]+)?:(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key === 'SUMMARY') currentEvent.summary = value;
          else if (key === 'LOCATION') currentEvent.location = value;
          else if (key === 'DESCRIPTION') currentEvent.description = value;
          else if (key === 'DTSTART') currentEvent.start = value;
          else if (key === 'UID') currentEvent.uid = value;
        }
      }
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const validEvents = parsedEvents
      .map((ev, idx): TourEvent => {
        const startDate = ev.start ? parseICSDate(ev.start) : new Date();
        const geo = parseVenueAndLocation(ev.location || 'TBA VENUE', ev.description);
        const parsedDate = parseTourDate(startDate);
        const desc = (ev.description || '').replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
        const urlMatch = desc.match(/https?:\/\/[^\s]+/);
        const ticketLink = urlMatch ? urlMatch[0] : 'https://ra.co';

        let status = 'TICKETS AVAILABLE';
        if (desc.toLowerCase().includes('sold out')) status = 'SOLD OUT';
        else if (desc.toLowerCase().includes('free')) status = 'FREE';

        const times = getEventDateTimes(parsedDate.isoDate, '23:00', '04:00');

        return {
          id: ev.uid || `cal-${idx}`,
          title: ev.summary || `HENRY IX LIVE @ ${geo.venue}`,
          venue: geo.venue,
          city: geo.city,
          country: geo.country,
          dateStr: parsedDate.dateStr,
          isoDate: parsedDate.isoDate,
          displayDay: parsedDate.displayDay,
          displayMonth: parsedDate.displayMonth,
          displayYear: parsedDate.displayYear,
          dayOfWeek: parsedDate.dayOfWeek,
          startTime: '23:00',
          endTime: '04:00',
          callTime: '22:30',
          doorsTime: '22:00',
          startIso: times.startIso,
          endIso: times.endIso,
          startIcal: times.startIcal,
          endIcal: times.endIcal,
          status,
          lat: geo.lat,
          lng: geo.lng,
          ticketSerial: generateTicketSerial(geo.code, ev.uid || `gcal${idx}`, idx),
          ticketLink,
          promoter: undefined,
          notes: desc,
          deckAccentIndex: idx % 4,
          source: 'calendar',
        };
      })
      .filter((e) => new Date(e.isoDate).getTime() >= now.getTime())
      .sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime())
      .slice(0, 10);

    return validEvents.length > 0 ? validEvents : null;
  } catch (err) {
    console.warn('[TourEvents] Google Calendar parsing error:', err);
    return null;
  }
    },
    3600
  );
}

/**
 * Fallback alias matching the original task specification
 */
export const fetchCalendarEvents = fetchGoogleCalendarGigs;

export async function fetchPublicTourEvents(): Promise<{
  events: TourEvent[];
  source: 'notion' | 'calendar' | 'verified';
  count: number;
}> {
  // 1. Attempt Notion Bookings (Cached in Cloudflare KV)
  try {
    const bookings = await fetchWithKVCache(
      'notion_tour_bookings',
      async () => {
        return await getNotionBookings().catch((err) => {
          console.warn('[TourEvents] Notion query error, falling back:', err);
          return [];
        });
      },
      1800
    );

    if (Array.isArray(bookings) && bookings.length > 0) {
      // Filter for confirmed/contract gigs:
      // stage containing 'Confirmed' or 'Contract' or depositPaid == true
      const filtered = bookings.filter((b) => {
        const stage = (b.stage || '').toLowerCase();
        const isConfirmedOrContract =
          stage.includes('confirmed') ||
          stage.includes('contract') ||
          Boolean(b.depositPaid);
        if (!isConfirmedOrContract) return false;

        // Future / upcoming check: must have a valid future date
        if (!b.eventDate || !b.eventDate.trim()) {
          return false;
        }
        const parts = b.eventDate.split('T')[0].split('-').map(Number);
        if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          const gigDate = new Date(parts[0], parts[1] - 1, parts[2], 23, 59, 59);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          if (gigDate < now) return false;
        } else {
          return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        const sorted = filtered.sort((a, b) => {
          const timeA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const timeB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          return timeA - timeB;
        });

        const mappedEvents = sorted.map((b, idx) => mapNotionBookingToTourEvent(b, idx));
        return {
          events: mappedEvents,
          source: 'notion',
          count: mappedEvents.length,
        };
      }
    }
  } catch (notionErr) {
    console.warn('[TourEvents] Error processing Notion bookings:', notionErr);
  }

  // 2. Fallback to Google Calendar if configured
  try {
    const calendarEvents = await fetchGoogleCalendarGigs();
    if (calendarEvents && calendarEvents.length > 0) {
      return {
        events: calendarEvents,
        source: 'calendar',
        count: calendarEvents.length,
      };
    }
  } catch (gcalErr) {
    console.warn('[TourEvents] Google calendar fallback error:', gcalErr);
  }

  // 3. Fallback to verified static gigs
  return {
    events: DEFAULT_TOUR_EVENTS,
    source: 'verified',
    count: DEFAULT_TOUR_EVENTS.length,
  };
}
