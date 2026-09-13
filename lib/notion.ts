/**
 * HENRY IX Studio Notion Client
 * Central relational bridge connecting live Notion workspace databases to the public website and studio.
 */

// Node TLS Support on Windows local development & builds to prevent UNABLE_TO_VERIFY_LEAF_SIGNATURE
if (process.env.NODE_ENV !== 'production' || process.platform === 'win32') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export const NOTION_DATABASES = {
  ASSETS: process.env.NOTION_ASSETS_DB_ID || '6472955a-5f46-46ee-beb0-e1d0404f8ca1',
  SETS: process.env.NOTION_SETS_DB_ID || '00c67473-24ed-4b74-a194-4364f640a13d',
  SET_TRACKS: process.env.NOTION_SET_TRACKS_DB_ID || '9d87baee-088c-4bdc-9121-501a204980cf',
  MUSIC_LIBRARY: process.env.NOTION_MUSIC_LIBRARY_DB_ID || '36b39285-d06b-4f46-a76c-5ff8e14d2880',
  BOOKINGS: process.env.NOTION_BOOKINGS_DB_ID || '40826b67-e077-4713-a899-d532c81d9429',
  CLIENTS: process.env.NOTION_CLIENTS_DB_ID || 'd2af96e5-64c7-486c-8c2e-b0dc1f8d89aa',
  FINANCE: process.env.NOTION_FINANCE_DB_ID || '94d73397-bc39-413d-8de8-59ac718c7265',
  CONTENT_CALENDAR: process.env.NOTION_CONTENT_CALENDAR_DB_ID || '2e91474c-c6ac-4658-9c40-027366a47628',
};

const NOTION_API_KEY = process.env.NOTION_API_KEY || '';
const NOTION_VERSION = '2022-06-28';

// Simple in-memory cache for high-speed queries (<40ms) & rate-limit safety
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cacheStore: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh, stale-while-revalidate

async function queryNotionAPI(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const apiKey = process.env.NOTION_API_KEY || NOTION_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  const url = `https://api.notion.com/v1${endpoint}`;
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Notion API] Error ${res.status} on ${endpoint}:`, errText);
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(`[Notion API] Network request error on ${endpoint}:`, error);
    return null;
  }
}

/**
 * Query a database with optional caching
 */
export async function queryNotionDatabase(databaseId: string, filter?: any, sorts?: any, forceFresh: boolean = false) {
  const cacheKey = `${databaseId}_${JSON.stringify(filter)}_${JSON.stringify(sorts)}`;
  const now = Date.now();

  if (!forceFresh && cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return cacheStore[cacheKey].data;
  }

  const payload: any = {};
  if (filter) payload.filter = filter;
  if (sorts) payload.sorts = sorts;

  const result = await queryNotionAPI(`/databases/${databaseId}/query`, 'POST', payload);
  if (result && result.results) {
    cacheStore[cacheKey] = { data: result.results, timestamp: now };
    return result.results;
  }

  // If failed but stale cache exists, return stale cache
  if (cacheStore[cacheKey]) {
    return cacheStore[cacheKey].data;
  }
  return [];
}

/**
 * Query a database with pagination support
 */
export async function queryNotionDatabasePaged(
  databaseId: string,
  filter?: any,
  sorts?: any,
  pageSize?: number,
  startCursor?: string,
  forceFresh: boolean = false
): Promise<{ results: any[]; nextCursor: string | null; hasMore: boolean }> {
  const cacheKey = `${databaseId}_${JSON.stringify(filter)}_${JSON.stringify(sorts)}_${pageSize}_${startCursor}`;
  const now = Date.now();

  if (!forceFresh && cacheStore[cacheKey] && now - cacheStore[cacheKey].timestamp < CACHE_TTL_MS) {
    return cacheStore[cacheKey].data;
  }

  const payload: any = {};
  if (filter) payload.filter = filter;
  if (sorts) payload.sorts = sorts;
  if (pageSize) payload.page_size = Math.min(pageSize, 100);
  if (startCursor) payload.start_cursor = startCursor;

  const result = await queryNotionAPI(`/databases/${databaseId}/query`, 'POST', payload);
  if (result && result.results) {
    const data = {
      results: result.results,
      nextCursor: result.next_cursor || null,
      hasMore: Boolean(result.has_more),
    };
    cacheStore[cacheKey] = { data, timestamp: now };
    return data;
  }

  if (cacheStore[cacheKey]) {
    return cacheStore[cacheKey].data;
  }
  return { results: [], nextCursor: null, hasMore: false };
}

/**
 * Helper to extract plain text from a Notion title/rich_text property
 */
export function getNotionText(property: any): string {
  if (!property) return '';
  if (property.type === 'title' && Array.isArray(property.title)) {
    return property.title.map((t: any) => t.plain_text).join('');
  }
  if (property.type === 'rich_text' && Array.isArray(property.rich_text)) {
    return property.rich_text.map((t: any) => t.plain_text).join('');
  }
  if (property.type === 'email') return property.email || '';
  if (property.type === 'phone_number') return property.phone_number || '';
  if (property.type === 'url') return property.url || '';
  return '';
}

/**
 * Helper to extract select / status
 */
export function getNotionSelect(property: any): string {
  if (!property) return '';
  if (property.type === 'select' && property.select) return property.select.name;
  if (property.type === 'status' && property.status) return property.status.name;
  if (property.type === 'multi_select' && Array.isArray(property.multi_select) && property.multi_select.length > 0) {
    return property.multi_select.map((m: any) => m.name).join(', ');
  }
  return '';
}

/**
 * Helper to extract number
 */
export function getNotionNumber(property: any): number {
  if (!property) return 0;
  if (property.type === 'number' && typeof property.number === 'number') return property.number;
  return 0;
}

/**
 * Helper to extract checkbox
 */
export function getNotionCheckbox(property: any): boolean {
  if (!property) return false;
  if (property.type === 'checkbox') return Boolean(property.checkbox);
  return false;
}

/**
 * Helper to extract date
 */
export function getNotionDate(property: any): string {
  if (!property || property.type !== 'date' || !property.date) return '';
  return property.date.start || '';
}

// -------------------------------------------------------------
// 1. [03 / ASSETS] Website Assets
// -------------------------------------------------------------
export interface NotionAsset {
  id: string;
  name: string;
  cloudflareUrl: string;
  storageKey: string;
  previewUrl: string;
  section: string;
  assetType: string;
  status: string;
  publishOnWebsite: boolean;
  fileFormat: string;
  altText: string;
  caption: string;
  credit: string;
  notes: string;
  lastUpdated: string;
}

export async function getNotionAssets(onlyPublished: boolean = false): Promise<NotionAsset[]> {
  const filter = onlyPublished
    ? { property: 'Publish on Website', checkbox: { equals: true } }
    : undefined;

  const results = await queryNotionDatabase(NOTION_DATABASES.ASSETS, filter);

  return results.map((page: any): NotionAsset => {
    const p = page.properties || {};
    return {
      id: page.id,
      name: getNotionText(p['Asset Name']) || 'Untitled Asset',
      cloudflareUrl: getNotionText(p['Cloudflare URL']),
      storageKey: getNotionText(p['Cloudflare Storage Key']),
      previewUrl: p['Preview']?.files?.[0]?.file?.url || p['Preview']?.files?.[0]?.external?.url || '',
      section: getNotionSelect(p['Website Section']),
      assetType: getNotionSelect(p['Asset Type']),
      status: getNotionSelect(p['Status']),
      publishOnWebsite: getNotionCheckbox(p['Publish on Website']),
      fileFormat: getNotionSelect(p['File Format']),
      altText: getNotionText(p['Alt Text']),
      caption: getNotionText(p['Caption']),
      credit: getNotionText(p['Credit']),
      notes: getNotionText(p['Notes']),
      lastUpdated: page.last_edited_time || '',
    };
  });
}

// -------------------------------------------------------------
// 2. [02 / MUSIC] Sets & Set Tracks
// -------------------------------------------------------------
export interface NotionSet {
  id: string;
  name: string;
  venue: string;
  occasion: string;
  eventDate: string;
  status: string;
  targetMinutes: number;
  soundcloudUrl: string;
  spotifyUrl: string;
  rekordboxExport: string;
  exportStatus: string;
  notes: string;
  lastExported: string;
  trackIds: string[];
}

export async function getNotionSets(): Promise<NotionSet[]> {
  const results = await queryNotionDatabase(NOTION_DATABASES.SETS, undefined, [
    { property: 'Event Date', direction: 'descending' }
  ]);

  return results.map((page: any): NotionSet => {
    const p = page.properties || {};
    return {
      id: page.id,
      name: getNotionText(p['Set Name']) || 'Untitled Set',
      venue: getNotionText(p['Venue']),
      occasion: getNotionText(p['Occasion']),
      eventDate: getNotionDate(p['Event Date']),
      status: getNotionSelect(p['Status']),
      targetMinutes: getNotionNumber(p['Target Minutes']),
      soundcloudUrl: getNotionText(p['SoundCloud Playlist URL']),
      spotifyUrl: getNotionText(p['Spotify Playlist URL']),
      rekordboxExport: getNotionText(p['Rekordbox Export']),
      exportStatus: getNotionSelect(p['Export Status']),
      notes: getNotionText(p['Notes']),
      lastExported: getNotionDate(p['Last Exported']),
      trackIds: (p['Tracks']?.relation || []).map((r: any) => r.id),
    };
  });
}

export interface NotionSetTrack {
  id: string;
  title: string;
  position: number;
  energy: number;
  ready: boolean;
  keyNotes: string;
  bpmNotes: string;
  transitionNotes: string;
  cueIn: string;
  cueOut: string;
  setId?: string;
  notes: string;
}

export async function getNotionSetTracks(setId?: string): Promise<NotionSetTrack[]> {
  const filter = setId
    ? { property: 'Set', relation: { contains: setId } }
    : undefined;

  const results = await queryNotionDatabase(NOTION_DATABASES.SET_TRACKS, filter, [
    { property: 'Position', direction: 'ascending' }
  ]);

  return results.map((page: any): NotionSetTrack => {
    const p = page.properties || {};
    return {
      id: page.id,
      title: getNotionText(p['Set Entry']) || 'Track',
      position: getNotionNumber(p['Position']),
      energy: getNotionNumber(p['Energy']),
      ready: getNotionCheckbox(p['Ready']),
      keyNotes: getNotionText(p['Key Notes']),
      bpmNotes: getNotionText(p['BPM Notes']),
      transitionNotes: getNotionText(p['Transition Notes']),
      cueIn: getNotionText(p['Cue In']),
      cueOut: getNotionText(p['Cue Out']),
      setId: p['Set']?.relation?.[0]?.id,
      notes: getNotionText(p['Notes']),
    };
  });
}

// -------------------------------------------------------------
// 3. [02 / MUSIC] Music Library & Master Crates
// -------------------------------------------------------------
export interface NotionMusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  bpm: number;
  key: string;
  energy: number;
  rating: number;
  source: string;
  sourceUrl: string;
  spotifyUrl: string;
  soundcloudUrl: string;
  playCount: number;
  durationSeconds: number;
  dateAdded: string;
  label: string;
  year: number;
  rekordboxTrackId: string;
  notes: string;
  fileLocation: string;
}

export interface NotionMusicLibraryPage {
  tracks: NotionMusicTrack[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getNotionMusicLibrary(limit: number = 100): Promise<NotionMusicTrack[]> {
  const results = await queryNotionDatabase(NOTION_DATABASES.MUSIC_LIBRARY, undefined, [
    { property: 'Date Added', direction: 'descending' }
  ]);

  return results.slice(0, limit).map((page: any): NotionMusicTrack => {
    const p = page.properties || {};
    const genreStr = Array.isArray(p['Genre']?.multi_select) && p['Genre'].multi_select.length > 0
      ? p['Genre'].multi_select.map((m: any) => m.name).join(', ')
      : getNotionSelect(p['Genre']) || getNotionText(p['Rekordbox Genre']);

    return {
      id: page.id,
      title: getNotionText(p['Track / Setlist']) || 'Unknown Title',
      artist: getNotionText(p['Artist']) || 'Unknown Artist',
      album: getNotionText(p['Album']),
      genre: genreStr,
      bpm: getNotionNumber(p['BPM']) || 140,
      key: getNotionText(p['Key']) || getNotionSelect(p['Key']) || '8A',
      energy: Number(getNotionSelect(p['Energy'])) || getNotionNumber(p['Energy']) || 8.0,
      rating: getNotionNumber(p['Rating']),
      source: getNotionSelect(p['Source']),
      sourceUrl: getNotionText(p['Source URL']),
      spotifyUrl: getNotionText(p['Spotify URL']),
      soundcloudUrl: getNotionText(p['SoundCloud URL']),
      playCount: getNotionNumber(p['Play Count']),
      durationSeconds: getNotionNumber(p['Duration Seconds']) || 240,
      dateAdded: getNotionDate(p['Date Added']),
      label: getNotionText(p['Label']),
      year: getNotionNumber(p['Year']),
      rekordboxTrackId: getNotionText(p['Rekordbox Track ID']),
      notes: getNotionText(p['Notes']),
      fileLocation: getNotionText(p['File Location']),
    };
  });
}

export async function getNotionMusicLibraryPaged(options: {
  search?: string;
  genre?: string;
  pageSize?: number;
  startCursor?: string;
  forceFresh?: boolean;
} = {}): Promise<NotionMusicLibraryPage> {
  const { search, genre, pageSize = 50, startCursor, forceFresh = false } = options;

  const andFilters: any[] = [];
  if (search && search.trim()) {
    const s = search.trim();
    andFilters.push({
      or: [
        { property: 'Track / Setlist', title: { contains: s } },
        { property: 'Artist', rich_text: { contains: s } },
        { property: 'Key', rich_text: { contains: s } },
      ]
    });
  }

  if (genre && genre.trim() && genre !== 'All') {
    andFilters.push({
      property: 'Genre',
      multi_select: { contains: genre.trim() }
    });
  }

  const filter = andFilters.length > 1 ? { and: andFilters } : andFilters[0];

  const page = await queryNotionDatabasePaged(
    NOTION_DATABASES.MUSIC_LIBRARY,
    filter,
    [{ property: 'Date Added', direction: 'descending' }],
    pageSize,
    startCursor,
    forceFresh
  );

  const tracks = page.results.map((pageObj: any): NotionMusicTrack => {
    const p = pageObj.properties || {};
    const genreStr = Array.isArray(p['Genre']?.multi_select) && p['Genre'].multi_select.length > 0
      ? p['Genre'].multi_select.map((m: any) => m.name).join(', ')
      : getNotionSelect(p['Genre']) || getNotionText(p['Rekordbox Genre']);

    return {
      id: pageObj.id,
      title: getNotionText(p['Track / Setlist']) || 'Unknown Title',
      artist: getNotionText(p['Artist']) || 'Unknown Artist',
      album: getNotionText(p['Album']),
      genre: genreStr,
      bpm: getNotionNumber(p['BPM']) || 140,
      key: getNotionText(p['Key']) || getNotionSelect(p['Key']) || '8A',
      energy: Number(getNotionSelect(p['Energy'])) || getNotionNumber(p['Energy']) || 8.0,
      rating: getNotionNumber(p['Rating']),
      source: getNotionSelect(p['Source']),
      sourceUrl: getNotionText(p['Source URL']),
      spotifyUrl: getNotionText(p['Spotify URL']),
      soundcloudUrl: getNotionText(p['SoundCloud URL']),
      playCount: getNotionNumber(p['Play Count']),
      durationSeconds: getNotionNumber(p['Duration Seconds']) || 240,
      dateAdded: getNotionDate(p['Date Added']),
      label: getNotionText(p['Label']),
      year: getNotionNumber(p['Year']),
      rekordboxTrackId: getNotionText(p['Rekordbox Track ID']),
      notes: getNotionText(p['Notes']),
      fileLocation: getNotionText(p['File Location']),
    };
  });

  return {
    tracks,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
  };
}

// -------------------------------------------------------------
// 4. [04 / GIGS] Bookings & Leads
// -------------------------------------------------------------
export interface NotionBooking {
  id: string;
  title: string;
  venue: string;
  client: string;
  stage: string;
  eventType: string;
  eventDate: string;
  fee: number;
  deposit: number;
  depositPaid: boolean;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  ticketLink?: string;
}

export async function getNotionBookings(): Promise<NotionBooking[]> {
  const results = await queryNotionDatabase(NOTION_DATABASES.BOOKINGS, undefined, [
    { property: 'Event Date', direction: 'ascending' }
  ]);

  return results.map((page: any): NotionBooking => {
    const p = page.properties || {};
    const notesText = getNotionText(p['Notes']);
    const ticketProp = getNotionText(
      p['Ticket Link'] ||
      p['Ticket URL'] ||
      p['Tickets'] ||
      p['RA Link'] ||
      p['Link'] ||
      p['URL']
    );
    const urlFromNotes = notesText.match(/https?:\/\/[^\s]+/)?.[0];
    const ticketLink = ticketProp || urlFromNotes || undefined;

    return {
      id: page.id,
      title: getNotionText(p['Booking / Enquiry']) || 'Upcoming Gig',
      venue: getNotionText(p['Venue']),
      client: getNotionText(p['Client']),
      stage: getNotionSelect(p['Stage']),
      eventType: getNotionSelect(p['Event Type']),
      eventDate: getNotionDate(p['Event Date']),
      fee: getNotionNumber(p['Fee']),
      deposit: getNotionNumber(p['Deposit']),
      depositPaid: getNotionCheckbox(p['Deposit Paid']),
      contactEmail: getNotionText(p['Contact Email']),
      contactPhone: getNotionText(p['Contact Phone']),
      notes: notesText,
      ticketLink,
    };
  });
}

// -------------------------------------------------------------
// 5. [04 / GIGS] Finance Tracker
// -------------------------------------------------------------
export interface NotionFinanceRecord {
  id: string;
  transaction: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  paymentStatus: string;
  reference: string;
  notes: string;
}

export async function getNotionFinance(): Promise<NotionFinanceRecord[]> {
  const results = await queryNotionDatabase(NOTION_DATABASES.FINANCE, undefined, [
    { property: 'Date', direction: 'descending' }
  ]);

  return results.map((page: any): NotionFinanceRecord => {
    const p = page.properties || {};
    return {
      id: page.id,
      transaction: getNotionText(p['Transaction']) || 'Transaction',
      amount: getNotionNumber(p['Amount']),
      type: getNotionSelect(p['Type']),
      category: getNotionSelect(p['Category']),
      date: getNotionDate(p['Date']),
      paymentStatus: getNotionSelect(p['Payment Status']),
      reference: getNotionText(p['Reference']),
      notes: getNotionText(p['Notes']),
    };
  });
}

// -------------------------------------------------------------
// 6. [05 / SOCIAL] Content Calendar
// -------------------------------------------------------------
export interface NotionContentItem {
  id: string;
  content: string;
  platform: string;
  contentType: string;
  publishDate: string;
  status: string;
  campaign: string;
  publishedLink: string;
  notes: string;
}

export async function getNotionContentCalendar(): Promise<NotionContentItem[]> {
  const results = await queryNotionDatabase(NOTION_DATABASES.CONTENT_CALENDAR, undefined, [
    { property: 'Publish Date', direction: 'ascending' }
  ]);

  return results.map((page: any): NotionContentItem => {
    const p = page.properties || {};
    return {
      id: page.id,
      content: getNotionText(p['Content']) || 'Content Drop',
      platform: getNotionSelect(p['Platform']),
      contentType: getNotionSelect(p['Content Type']),
      publishDate: getNotionDate(p['Publish Date']),
      status: getNotionSelect(p['Status']),
      campaign: getNotionText(p['Campaign']),
      publishedLink: getNotionText(p['Published Link']),
      notes: getNotionText(p['Notes']),
    };
  });
}

// -------------------------------------------------------------
// Outbound Creation & Mutation Helpers
// -------------------------------------------------------------
export async function createNotionSubscriberLead(email: string) {
  return await queryNotionAPI('/pages', 'POST', {
    parent: { database_id: NOTION_DATABASES.BOOKINGS },
    properties: {
      'Booking / Enquiry': {
        title: [{ text: { content: `VIP Subscriber: ${email}` } }],
      },
      'Contact Email': {
        email: email,
      },
      'Event Type': {
        select: { name: 'Other' },
      },
      'Stage': {
        status: { name: 'New lead' },
      },
      'Notes': {
        rich_text: [{ text: { content: `Subscribed via website on ${new Date().toISOString()}` } }],
      },
    },
  });
}

export async function createNotionBookingLead(lead: {
  name: string;
  email: string;
  phone?: string;
  venue?: string;
  date?: string;
  fee?: number;
  notes?: string;
}) {
  return await queryNotionAPI('/pages', 'POST', {
    parent: { database_id: NOTION_DATABASES.BOOKINGS },
    properties: {
      'Booking / Enquiry': {
        title: [{ text: { content: lead.name } }],
      },
      'Contact Email': {
        email: lead.email,
      },
      'Contact Phone': lead.phone ? { phone_number: lead.phone } : undefined,
      'Venue': lead.venue ? { rich_text: [{ text: { content: lead.venue } }] } : undefined,
      'Event Date': lead.date ? { date: { start: lead.date } } : undefined,
      'Fee': lead.fee ? { number: lead.fee } : undefined,
      'Stage': {
        status: { name: 'New lead' },
      },
      'Notes': lead.notes ? { rich_text: [{ text: { content: lead.notes } }] } : undefined,
    },
  });
}

export async function createNotionBooking(booking: {
  title: string;
  venue?: string;
  client?: string;
  stage?: string;
  eventType?: string;
  eventDate?: string;
  fee?: number;
  deposit?: number;
  depositPaid?: boolean;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  ticketLink?: string;
}) {
  // Validate Stage status against Notion schema: 'New lead' | 'Contacted' | 'Quoted' | 'Confirmed' | 'Completed' | 'Lost'
  const validStages = ['New lead', 'Contacted', 'Quoted', 'Confirmed', 'Completed', 'Lost'];
  const stageName = validStages.find(s => s.toLowerCase() === (booking.stage || '').toLowerCase()) || 'Confirmed';

  // Validate Event Type select: 'Club' | 'Festival' | 'Corporate' | 'Private party' | 'Wedding' | 'Other'
  const validEventTypes = ['Club', 'Festival', 'Corporate', 'Private party', 'Wedding', 'Other'];
  const eventTypeName = validEventTypes.find(e => e.toLowerCase() === (booking.eventType || '').toLowerCase()) || 'Club';

  const properties: any = {
    'Booking / Enquiry': {
      title: [{ text: { content: booking.title } }],
    },
    'Stage': {
      status: { name: stageName },
    },
    'Event Type': {
      select: { name: eventTypeName },
    },
  };

  if (booking.venue) {
    properties['Venue'] = { rich_text: [{ text: { content: booking.venue } }] };
  }
  if (booking.client) {
    properties['Client'] = { rich_text: [{ text: { content: booking.client } }] };
  }
  if (booking.eventDate) {
    properties['Event Date'] = { date: { start: booking.eventDate } };
  }
  if (typeof booking.fee === 'number') {
    properties['Fee'] = { number: booking.fee };
  }
  if (typeof booking.deposit === 'number') {
    properties['Deposit'] = { number: booking.deposit };
  }
  if (typeof booking.depositPaid === 'boolean') {
    properties['Deposit Paid'] = { checkbox: booking.depositPaid };
  }
  if (booking.contactEmail) {
    properties['Contact Email'] = { email: booking.contactEmail };
  }
  if (booking.contactPhone) {
    properties['Contact Phone'] = { phone_number: booking.contactPhone };
  }
  
  let finalNotes = booking.notes || '';
  if (booking.ticketLink && !finalNotes.includes(booking.ticketLink)) {
    finalNotes = finalNotes ? `${finalNotes}\nTickets: ${booking.ticketLink}` : `Tickets: ${booking.ticketLink}`;
  }
  if (finalNotes) {
    properties['Notes'] = { rich_text: [{ text: { content: finalNotes } }] };
  }

  return await queryNotionAPI('/pages', 'POST', {
    parent: { database_id: NOTION_DATABASES.BOOKINGS },
    properties,
  });
}

export async function createNotionContentPost(post: {
  content: string;
  platform?: string;
  contentType?: string;
  publishDate?: string;
  status?: string;
  campaign?: string;
  publishedLink?: string;
  notes?: string;
}) {
  // Validate Status: 'Idea' | 'Creating' | 'Scheduled' | 'Published'
  const validStatuses = ['Idea', 'Creating', 'Scheduled', 'Published'];
  const statusName = validStatuses.find(s => s.toLowerCase() === (post.status || '').toLowerCase()) || 'Scheduled';

  // Validate Platform multi_select: 'Instagram' | 'TikTok' | 'YouTube' | 'SoundCloud' | 'Website' | 'Email'
  const validPlatforms = ['Instagram', 'TikTok', 'YouTube', 'SoundCloud', 'Website', 'Email'];
  const platformName = validPlatforms.find(p => p.toLowerCase() === (post.platform || '').toLowerCase()) || 'Instagram';

  // Validate Content Type: 'Video' | 'Photo' | 'Mix' | 'Announcement' | 'Testimonial' | 'Behind the scenes'
  const validContentTypes = ['Video', 'Photo', 'Mix', 'Announcement', 'Testimonial', 'Behind the scenes'];
  const rawType = post.contentType?.toLowerCase() || '';
  const contentTypeName = rawType.includes('flyer') || rawType.includes('announce')
    ? 'Announcement'
    : rawType.includes('video') || rawType.includes('reel') || rawType.includes('clip')
    ? 'Video'
    : rawType.includes('photo') || rawType.includes('artwork')
    ? 'Photo'
    : rawType.includes('mix')
    ? 'Mix'
    : validContentTypes.find(c => c.toLowerCase() === rawType) || 'Announcement';

  const properties: any = {
    'Content': {
      title: [{ text: { content: post.content } }],
    },
    'Status': {
      status: { name: statusName },
    },
    'Platform': {
      multi_select: [{ name: platformName }],
    },
    'Content Type': {
      select: { name: contentTypeName },
    },
  };

  if (post.publishDate) {
    properties['Publish Date'] = { date: { start: post.publishDate } };
  }
  if (post.campaign) {
    properties['Campaign'] = { rich_text: [{ text: { content: post.campaign } }] };
  }
  if (post.publishedLink) {
    properties['Published Link'] = { url: post.publishedLink };
  }
  if (post.notes) {
    properties['Notes'] = { rich_text: [{ text: { content: post.notes } }] };
  }

  return await queryNotionAPI('/pages', 'POST', {
    parent: { database_id: NOTION_DATABASES.CONTENT_CALENDAR },
    properties,
  });
}
