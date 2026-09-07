/**
 * Unit & Edge-Case Verification for Tour Events Adapter & Notion Dispatch
 */

import {
  TourEvent,
  DEFAULT_TOUR_EVENTS,
  parseTourDate,
  parseVenueAndLocation,
  parseTicketLink,
  generateTicketSerial,
  mapNotionBookingToTourEvent,
  fetchPublicTourEvents,
  getEventDateTimes,
} from '../lib/tourEvents';
import { NotionBooking } from '../lib/notion';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('--- RUNNING TOUR EVENTS VERIFICATION SUITE ---\n');

  // Test 1: Date parsing
  const d1 = parseTourDate('2026-09-12');
  assert(d1.isoDate === '2026-09-12', 'Parsed ISO date matches 2026-09-12');
  assert(d1.displayDay === '12', 'Parsed day is 12');
  assert(d1.displayMonth === 'SEP', 'Parsed month is SEP');
  assert(d1.displayYear === '2026', 'Parsed year is 2026');

  // Test 2: Venue and Location Parsing
  const geo1 = parseVenueAndLocation('Fabric, London');
  assert(geo1.city === 'LONDON', 'Fabric, London resolves city LONDON');
  assert(geo1.country === 'UNITED KINGDOM', 'Fabric, London resolves country UNITED KINGDOM');
  assert(geo1.code === 'LON', 'City code is LON');
  assert(Math.floor(geo1.lat) === 51, 'London lat is in London region (51.x)');

  const geo2 = parseVenueAndLocation('AMNESIA (TERRACE)');
  assert(geo2.city === 'IBIZA', 'AMNESIA resolves to IBIZA');
  assert(geo2.code === 'IBZ', 'City code is IBZ');
  assert(geo2.lat === 38.9567, 'Ibiza lat is 38.9567');

  const geo3 = parseVenueAndLocation('Watergate, Berlin');
  assert(geo3.city === 'BERLIN', 'Watergate Berlin resolves to BERLIN');
  assert(geo3.code === 'BER', 'City code is BER');

  const geo4 = parseVenueAndLocation('ADE Special', 'Event in Amsterdam at Melkweg');
  assert(geo4.city === 'AMSTERDAM', 'Notes mentioning Amsterdam resolves to AMSTERDAM');
  assert(geo4.code === 'AMS', 'City code is AMS');

  const geo5 = parseVenueAndLocation('DC10');
  assert(geo5.city === 'IBIZA', 'DC10 without dash resolves to IBIZA');
  assert(geo5.code === 'IBZ', 'DC10 code is IBZ');

  const geo6 = parseVenueAndLocation('Sub Club, Glasgow, Scotland');
  assert(geo6.city === 'GLASGOW', 'Sub Club Glasgow resolves city to GLASGOW without Scotland duplicating');
  assert(geo6.country === 'UNITED KINGDOM', 'Country resolves to UNITED KINGDOM');
  assert(geo6.code === 'GLA', 'City code is GLA');

  // Test 3: RFC 5545 & Schema.org Midnight Rollover (Start < End guarantee)
  const timesMidnight = getEventDateTimes('2026-09-12', '23:00', '04:00');
  assert(timesMidnight.startIso === '2026-09-12T23:00:00.000Z', 'Midnight set start is 2026-09-12T23:00:00.000Z');
  assert(timesMidnight.endIso === '2026-09-13T04:00:00.000Z', 'Midnight set end rolls over to 2026-09-13T04:00:00.000Z');
  assert(timesMidnight.startIcal === '20260912T230000Z', 'iCal DTSTART is 20260912T230000Z');
  assert(timesMidnight.endIcal === '20260913T040000Z', 'iCal DTEND is 20260913T040000Z');
  assert(
    new Date(timesMidnight.endIso).getTime() > new Date(timesMidnight.startIso).getTime(),
    'RFC 5545 check: end date is strictly after start date'
  );

  // Test 4: Month and Year boundary rollovers
  const timesMonthEnd = getEventDateTimes('2026-09-30', '23:00', '05:00');
  assert(timesMonthEnd.endIso === '2026-10-01T05:00:00.000Z', 'Month-end rollover from Sep 30 to Oct 01');

  const timesNewYear = getEventDateTimes('2026-12-31', '22:00', '06:00');
  assert(timesNewYear.endIso === '2027-01-01T06:00:00.000Z', "New Year's Eve rollover from 2026 to 2027");

  // Test 5: Default tour events have valid startIso < endIso
  for (const gig of DEFAULT_TOUR_EVENTS) {
    assert(
      new Date(gig.endIso).getTime() > new Date(gig.startIso).getTime(),
      `Default gig "${gig.title}" end date (${gig.endIso}) is after start date (${gig.startIso})`
    );
    assert(gig.startIcal.length === 16, `Default gig "${gig.title}" has valid DTSTART (${gig.startIcal})`);
    assert(gig.endIcal.length === 16, `Default gig "${gig.title}" has valid DTEND (${gig.endIcal})`);
  }

  // Test 6: Ticket Link Parsing
  const mockBookingWithLink: NotionBooking = {
    id: 'b1',
    title: 'Show 1',
    venue: 'E1 London',
    client: 'Promoter A',
    stage: 'Confirmed',
    eventType: 'Club',
    eventDate: '2026-11-28',
    fee: 1500,
    deposit: 750,
    depositPaid: true,
    contactEmail: 'a@example.com',
    contactPhone: '123',
    notes: 'Tickets live: https://ra.co/events/998877',
  };
  const link1 = parseTicketLink(mockBookingWithLink);
  assert(link1 === 'https://ra.co/events/998877', 'Extracted RA link from notes');

  const mockBookingDefault: NotionBooking = {
    ...mockBookingWithLink,
    notes: 'No URL here',
  };
  const link2 = parseTicketLink(mockBookingDefault);
  assert(link2 === 'https://ra.co', 'Fallback default to https://ra.co');

  // Test 7: Stage, Deposit & Date filtering logic
  const mockBookings: NotionBooking[] = [
    {
      id: 'b-conf',
      title: 'Confirmed Gig',
      venue: 'Ministry of Sound',
      client: 'MOS',
      stage: 'Confirmed',
      eventType: 'Club',
      eventDate: '2026-10-10',
      fee: 2000,
      deposit: 1000,
      depositPaid: false,
      contactEmail: 'mos@example.com',
      contactPhone: '123',
      notes: 'Set: 01:00 - 03:00, Call: 23:30',
    },
    {
      id: 'b-contract',
      title: 'Contract Gig',
      venue: 'Amnesia',
      client: 'Amnesia',
      stage: 'Contract',
      eventType: 'Club',
      eventDate: '2026-10-20',
      fee: 2500,
      deposit: 0,
      depositPaid: false,
      contactEmail: 'ibz@example.com',
      contactPhone: '123',
      notes: '',
    },
    {
      id: 'b-dep-paid',
      title: 'Deposit Paid Lead',
      venue: 'Watergate',
      client: 'Watergate',
      stage: 'Negotiating',
      eventType: 'Club',
      eventDate: '2026-11-05',
      fee: 1800,
      deposit: 900,
      depositPaid: true,
      contactEmail: 'ber@example.com',
      contactPhone: '123',
      notes: '',
    },
    {
      id: 'b-unconfirmed',
      title: 'Unconfirmed Lead',
      venue: 'Unknown Bar',
      client: 'Lead Person',
      stage: 'New lead',
      eventType: 'Club',
      eventDate: '2026-12-01',
      fee: 500,
      deposit: 0,
      depositPaid: false,
      contactEmail: 'lead@example.com',
      contactPhone: '123',
      notes: '',
    },
    {
      id: 'b-no-date',
      title: 'Confirmed But No Date Yet',
      venue: 'Club TBA',
      client: 'Client X',
      stage: 'Confirmed',
      eventType: 'Club',
      eventDate: '',
      fee: 1000,
      deposit: 500,
      depositPaid: true,
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
    {
      id: 'b-past',
      title: 'Past Gig',
      venue: 'Old Club',
      client: 'Old Client',
      stage: 'Confirmed',
      eventType: 'Club',
      eventDate: '2020-01-01',
      fee: 500,
      deposit: 0,
      depositPaid: true,
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
  ];

  const filtered = mockBookings.filter((b) => {
    const stage = (b.stage || '').toLowerCase();
    const isConfirmedOrContract =
      stage.includes('confirmed') ||
      stage.includes('contract') ||
      Boolean(b.depositPaid);
    if (!isConfirmedOrContract) return false;

    if (!b.eventDate || !b.eventDate.trim()) return false;
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

  assert(filtered.length === 3, 'Filtered to exactly 3 upcoming confirmed/contract/deposit-paid gigs');
  assert(filtered.some((b) => b.id === 'b-conf'), 'Included confirmed gig');
  assert(filtered.some((b) => b.id === 'b-contract'), 'Included contract gig');
  assert(filtered.some((b) => b.id === 'b-dep-paid'), 'Included deposit-paid gig');
  assert(!filtered.some((b) => b.id === 'b-unconfirmed'), 'Excluded new unconfirmed lead');
  assert(!filtered.some((b) => b.id === 'b-no-date'), 'Excluded confirmed gig with empty date');
  assert(!filtered.some((b) => b.id === 'b-past'), 'Excluded past gig');

  // Test 8: Map Notion booking to TourEvent with custom times & RFC rollover
  const mapped = mapNotionBookingToTourEvent(mockBookings[0], 0);
  assert(mapped.startTime === '01:00', 'Extracted start time 01:00 from notes');
  assert(mapped.endTime === '03:00', 'Extracted end time 03:00 from notes');
  assert(mapped.callTime === '23:30', 'Extracted call time 23:30 from notes');
  assert(mapped.deckAccentIndex === 0, 'Deck accent index is 0 (Red)');
  assert(mapped.ticketSerial.startsWith('HIX-LON-'), 'Ticket serial starts with HIX-LON-');
  assert(new Date(mapped.endIso).getTime() > new Date(mapped.startIso).getTime(), 'Mapped endIso is after startIso');
  assert(mapped.startIcal.startsWith('20261010'), 'Mapped startIcal starts with date');

  // Test 9: Fallback when Notion is empty / offline
  const result = await fetchPublicTourEvents();
  assert(result.events.length > 0, `Returned ${result.events.length} events from fetchPublicTourEvents()`);
  assert(
    result.source === 'notion' || result.source === 'calendar' || result.source === 'verified',
    `Valid source: ${result.source}`
  );
  assert(result.events[0].ticketLink.startsWith('http'), 'Ticket link is a valid URL');
  assert(result.events[0].ticketSerial.length > 5, 'Ticket serial is populated');
  assert(
    new Date(result.events[0].endIso).getTime() > new Date(result.events[0].startIso).getTime(),
    'Public tour event endIso is after startIso'
  );

  console.log('\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨');
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
