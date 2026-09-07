import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CuePoint {
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  name: string;
  time: number;
  color: string;
}

export interface StudioTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  duration: number; // in seconds
  source: 'Rekordbox' | 'Spotify' | 'SoundCloud' | 'Local';
  energy: number; // 1-10
  artwork: string;
  label?: string;
  year?: number;
  mixPresence?: string;
  heatTag?: 'Peak Weapon' | 'Secret Dub' | 'Hypnotic Warm-up';
  genre?: string;
  clearance?: 'Stream-Safe' | 'DMCA Risk';
  cues?: CuePoint[];
  audioFrequency?: number; // Base synth frequency for live preview
}

export interface StudioGig {
  id: string;
  date: string;
  title: string;
  venue: string;
  address: string;
  setTime: string;
  callTime: string;
  departureTime: string;
  transitRoute: string;
  fee: number;
  depositPaid: boolean;
  promoter: string;
  promoterPhone: string;
  wifi: string;
  guestlistAllocated: number;
  ticketLink: string;
  status: 'Confirmed' | 'Contract' | 'Completed';
  phase: 1 | 2 | 3 | 4 | 5;
}

export interface BagItem {
  id: number;
  name: string;
  checked: boolean;
  critical: boolean;
}

export interface AdmittedGuest {
  code: string;
  name: string;
  type: string;
  time: string;
  status: 'ADMITTED' | 'DUPLICATE' | 'INVALID';
}

export interface InstagramPost {
  id: string;
  title: string;
  date: string;
  type: 'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork';
  scheduled: boolean;
  image: string;
  caption: string;
}

export interface StudioToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: number;
}

export interface StudioSettings {
  theme: 'oled' | 'zinc' | 'light' | 'system';
  glowIntensity: number;
  ditherEnabled: boolean;
  density: 'compact' | 'standard' | 'spacious';
  fontScale: string;
  masterPin: string;
  panicDuration: string;
  homeAddress: string;
  safetyBuffer: string;
  taxReserve: number;
}

export interface StudioState {
  // Navigation & UI
  activeView: string;
  sidebarCollapsed: boolean;
  settingsOpen: boolean;
  commandPaletteOpen: boolean;
  rightDrawerOpen: boolean;
  drawerWidth: number;
  toasts: StudioToast[];
  
  // Audio Player State
  playerState: 'minimised' | 'docked' | 'half-deck' | 'fullscreen';
  currentTrack: StudioTrack;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  pitchSemitones: number;
  
  // Music & Crates
  trackCollection: StudioTrack[];
  activeSetlist: Array<{ pos: number; time: string; track: StudioTrack; energy: number; note: string }>;
  
  // Gigs & Logistics
  gigs: StudioGig[];
  activeGigId: string;
  bagItems: BagItem[];
  admittedGuests: AdmittedGuest[];
  
  // Assets & Crop
  smartCropMode: 'none' | 'tiktok' | 'reels' | '4:5';
  watermarkActive: boolean;
  
  // Social
  instagramGrid: InstagramPost[];
  
  // Settings
  settings: StudioSettings;

  // Actions
  setActiveView: (view: string) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setRightDrawerOpen: (open: boolean) => void;
  setDrawerWidth: (width: number) => void;
  addToast: (toast: Omit<StudioToast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;

  // Audio Actions
  playTrack: (track: StudioTrack) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number | ((prev: number) => number)) => void;
  setVolume: (v: number) => void;
  setIsMuted: (m: boolean) => void;
  setPitchSemitones: (st: number | ((prev: number) => number)) => void;
  setPlayerState: (state: 'minimised' | 'docked' | 'half-deck' | 'fullscreen') => void;

  // Music Actions
  addToSetlist: (track: StudioTrack) => void;
  removeFromSetlist: (index: number) => void;
  cleanTrackTitle: (trackId: string) => void;
  exportRekordboxXml: () => void;

  // Gigs Actions
  setActiveGigId: (id: string) => void;
  toggleBagItem: (id: number) => void;
  admitGuest: (guest: Omit<AdmittedGuest, 'time'>) => void;
  downloadInvoice: (gigId: string) => void;
  downloadDaySheet: (gigId: string) => void;

  // Assets Actions
  setSmartCropMode: (mode: 'none' | 'tiktok' | 'reels' | '4:5') => void;
  setWatermarkActive: (active: boolean) => void;
  triggerEmergencyPurge: () => Promise<void>;

  // Social Actions
  reorderInstagramGrid: (startIndex: number, endIndex: number) => void;
  addInstagramPost: (post: Omit<InstagramPost, 'id'>) => void;

  // Real Data Actions & Loading Flags
  isLoadingTracks: boolean;
  isLoadingGigs: boolean;
  isLoadingSocial: boolean;
  fetchRealTracks: (search?: string, genre?: string) => Promise<void>;
  fetchRealGigs: () => Promise<void>;
  fetchContentPosts: () => Promise<void>;
  setGigs: (gigs: StudioGig[]) => void;

  // Settings Actions
  updateSettings: (patch: Partial<StudioSettings>) => void;
}

const DEFAULT_TRACKS: StudioTrack[] = [
  {
    id: 'track-maja-kept',
    source: 'Rekordbox',
    title: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]',
    artist: 'MAJA',
    bpm: 150.0,
    key: '7A',
    duration: 217,
    mixPresence: 'Knight Club 4',
    heatTag: 'Peak Weapon',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
    energy: 9.0,
    label: 'Bootleg Special',
    year: 2024,
    audioFrequency: 150.0,
    cues: [
      { letter: 'A', name: 'Intro Kick', time: 0.0, color: '#10b981' },
      { letter: 'B', name: 'Vocal Breakdown', time: 54.0, color: '#06b6d4' },
      { letter: 'C', name: 'Main Drop', time: 98.0, color: '#ef4444' },
      { letter: 'D', name: 'Secondary Hook', time: 152.0, color: '#eab308' },
      { letter: 'E', name: 'Double Drop', time: 180.0, color: '#a855f7' },
      { letter: 'F', name: 'Outro Mix-Out', time: 195.0, color: '#f97316' },
    ]
  },
  {
    id: 'track-dj-g2g-rudeboy',
    source: 'Rekordbox',
    title: 'rude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend)',
    artist: 'dj g2g',
    bpm: 150.0,
    key: '2A',
    duration: 216,
    mixPresence: 'Corner N1',
    heatTag: 'Peak Weapon',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Corner%20New%20Cross/Mix%20Artwork/Night%201.png',
    energy: 9.5,
    label: 'Club Edit',
    year: 2024,
    audioFrequency: 150.0,
    cues: [
      { letter: 'A', name: 'Downbeat', time: 0.0, color: '#10b981' },
      { letter: 'B', name: 'Vocal Hook', time: 45.0, color: '#eab308' },
      { letter: 'C', name: 'Sub Drop', time: 75.0, color: '#ef4444' },
    ]
  },
  {
    id: 'track-zpectrum-do-it-diva',
    source: 'Rekordbox',
    title: 'Do It Diva (Don Omar x Heidi Montag) [free DL]',
    artist: 'zpectrum',
    bpm: 145.0,
    key: '3A',
    duration: 399,
    mixPresence: 'Royal Court 2',
    heatTag: 'Secret Dub',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Royal%20Court/Mix%20Artwork/Session%202.png',
    energy: 8.5,
    label: 'Free Download',
    year: 2023,
    audioFrequency: 145.0,
    cues: [
      { letter: 'A', name: 'Atmosphere In', time: 0.0, color: '#10b981' },
      { letter: 'B', name: 'Breakdown Vocal', time: 50.0, color: '#eab308' },
      { letter: 'C', name: 'Bass Assault', time: 80.0, color: '#ef4444' },
    ]
  },
  {
    id: 'track-flori-pori-favela-funk',
    source: 'Rekordbox',
    title: 'Flori Pori - Favela Funk',
    artist: 'Flori Pori',
    bpm: 150.0,
    key: '7B',
    duration: 184,
    mixPresence: 'Knight Club 2',
    heatTag: 'Peak Weapon',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%202.png',
    energy: 9.0,
    year: 2024,
    audioFrequency: 150.0,
  },
  {
    id: 'track-sunshine-vendetta-my-neck',
    source: 'Rekordbox',
    title: 'My Neck My Back [FREE DL]',
    artist: 'Sunshine Vendetta',
    bpm: 145.0,
    key: '3A',
    duration: 232,
    mixPresence: 'Knight Club 3',
    heatTag: 'Peak Weapon',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%203.png',
    energy: 9.2,
    year: 2024,
    audioFrequency: 145.0,
  },
  {
    id: 'track-dj-g2g-djadja',
    source: 'Rekordbox',
    title: 'Aya Nakamura - Djadja (dj g2g CLUB EDIT)',
    artist: 'dj g2g',
    bpm: 153.0,
    key: '9A',
    duration: 204,
    mixPresence: 'Knight Club 5',
    heatTag: 'Peak Weapon',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%205.png',
    energy: 9.6,
    year: 2024,
    audioFrequency: 153.0,
  },
  {
    id: 'track-jumbogoat-mas-que-nada',
    source: 'Rekordbox',
    title: 'Mas Que Nada (Brazilian Jiu Jitsu 2 Mashup)',
    artist: 'JumbogoatXXL',
    bpm: 145.0,
    key: '4A',
    duration: 245,
    mixPresence: 'Knight Club 6',
    heatTag: 'Secret Dub',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%206.png',
    energy: 8.8,
    year: 2024,
    audioFrequency: 145.0,
  },
  {
    id: 'track-pezuti-mas-mala',
    source: 'Rekordbox',
    title: 'Pezuti - Más Mala De Brazil',
    artist: 'Pezuti',
    bpm: 145.0,
    key: '12A',
    duration: 210,
    mixPresence: 'Corner N2',
    heatTag: 'Peak Weapon',
    clearance: 'Stream-Safe',
    artwork: 'https://assets.henryix.com/Mixes/Corner%20New%20Cross/Mix%20Artwork/Night%202.png',
    energy: 9.0,
    year: 2024,
    audioFrequency: 145.0,
  },
];

const DEFAULT_GIGS: StudioGig[] = [];

const DEFAULT_BAG_ITEMS: BagItem[] = [
  { id: 1, name: 'Master Corsair GTX 3.2 USB Drive', checked: true, critical: true },
  { id: 2, name: 'Clone Emergency Backup USB Drive', checked: true, critical: true },
  { id: 3, name: 'Sennheiser HD 25 Headphones', checked: true, critical: true },
  { id: 4, name: '1/4" Screw-on Gold Jack Adapter', checked: false, critical: true },
  { id: 5, name: 'Custom Molded ACS Pro-17 Earplugs', checked: true, critical: true },
  { id: 6, name: 'Zoom H4n Recorder + RCA Booth Cable', checked: false, critical: false },
  { id: 7, name: 'USB-C Cables & Anker High-Capacity Battery Pack', checked: true, critical: false },
];

const DEFAULT_POSTS: InstagramPost[] = [];

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      // UI Navigation
      activeView: 'streaming-live',
      sidebarCollapsed: false,
      settingsOpen: false,
      commandPaletteOpen: false,
      rightDrawerOpen: true,
      drawerWidth: 380,
      toasts: [],

      // Async loading flags
      isLoadingTracks: false,
      isLoadingGigs: false,
      isLoadingSocial: false,

      // Audio
      playerState: 'docked',
      currentTrack: DEFAULT_TRACKS[0],
      isPlaying: false,
      currentTime: 92,
      volume: 0.85,
      isMuted: false,
      pitchSemitones: 0,

      // Collections
      trackCollection: DEFAULT_TRACKS,
      activeSetlist: [
        { pos: 1, time: '00:00', track: DEFAULT_TRACKS[0], energy: 9.0, note: 'Intro tease, cut bass EQ' },
        { pos: 2, time: '03:37', track: DEFAULT_TRACKS[1], energy: 9.5, note: 'Harmonic drop on 32-bar boundary' },
        { pos: 3, time: '07:13', track: DEFAULT_TRACKS[2], energy: 8.5, note: 'Peak weapon double drop' },
      ],

      // Gigs
      gigs: DEFAULT_GIGS,
      activeGigId: '',
      bagItems: DEFAULT_BAG_ITEMS,
      admittedGuests: [],

      // Assets
      smartCropMode: 'none',
      watermarkActive: false,

      // Social
      instagramGrid: DEFAULT_POSTS,

      // Settings
      settings: {
        theme: 'oled',
        glowIntensity: 65,
        ditherEnabled: true,
        density: 'standard',
        fontScale: '100',
        masterPin: '180800',
        panicDuration: '1.5',
        homeAddress: 'London, UK',
        safetyBuffer: '30',
        taxReserve: 20,
      },

      // UI Actions
      setActiveView: (view) => set({ activeView: view }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setRightDrawerOpen: (open) => set({ rightDrawerOpen: open }),
      setDrawerWidth: (width) => set({ drawerWidth: Math.max(280, Math.min(width, 600)) }),
      
      addToast: (toast) => {
        const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const newToast: StudioToast = { ...toast, id, timestamp: Date.now() };
        set(state => ({ toasts: [...state.toasts, newToast] }));
        setTimeout(() => {
          get().removeToast(id);
        }, 3500);
      },

      removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

      // Audio Actions
      playTrack: (track) => {
        set({
          currentTrack: track,
          isPlaying: true,
          currentTime: 0,
        });
        get().addToast({
          title: 'AUDIO ENGINE LOADED',
          message: `Now Playing: ${track.artist} - ${track.title} [${track.key} • ${track.bpm} BPM]`,
          type: 'success',
        });
      },

      togglePlay: () => {
        const nextState = !get().isPlaying;
        set({ isPlaying: nextState });
      },

      setCurrentTime: (time) => set(state => ({
        currentTime: typeof time === 'function' ? time(state.currentTime) : time
      })),

      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)), isMuted: false }),
      setIsMuted: (m) => set({ isMuted: m }),
      setPitchSemitones: (st) => set(state => ({
        pitchSemitones: typeof st === 'function' ? Math.max(-2, Math.min(2, st(state.pitchSemitones))) : Math.max(-2, Math.min(2, st))
      })),
      setPlayerState: (state) => set({ playerState: state }),

      // Music Actions
      addToSetlist: (track) => {
        const setlist = get().activeSetlist;
        const nextPos = setlist.length + 1;
        const newEntry = {
          pos: nextPos,
          time: `1${nextPos * 4}:00`,
          track,
          energy: track.energy || 8.0,
          note: 'Harmonic transition',
        };
        set({ activeSetlist: [...setlist, newEntry] });
        get().addToast({
          title: 'ADDED TO SETLIST',
          message: `${track.title} appended at position #${nextPos}.`,
          type: 'info',
        });
      },

      removeFromSetlist: (index) => {
        set(state => ({
          activeSetlist: state.activeSetlist.filter((_, idx) => idx !== index).map((entry, idx) => ({ ...entry, pos: idx + 1 }))
        }));
      },

      cleanTrackTitle: (trackId) => {
        set(state => ({
          trackCollection: state.trackCollection.map(t => {
            if (t.id === trackId) {
              const cleaned = t.title
                .replace(/\[.*?\]/g, '')
                .replace(/\(.*?\)/g, '')
                .replace(/\.mp3|\.wav|\.aiff/gi, '')
                .replace(/320kbps|rip|official|video|download/gi, '')
                .trim();
              return { ...t, title: cleaned || t.title };
            }
            return t;
          })
        }));
        get().addToast({
          title: 'METADATA SANITIZED',
          message: 'Removed bootleg strings, rip tags, and bitrates.',
          type: 'success',
        });
      },

      exportRekordboxXml: () => {
        const setlist = get().activeSetlist;
        const trackXmlEntries = setlist.map((item, idx) => 
          `    <TRACK TrackID="${idx + 1}" Name="${item.track.title}" Artist="${item.track.artist}" AverageBpm="${item.track.bpm}" Tonality="${item.track.key}"/>`
        ).join('\n');
        
        const playlistKeyEntries = setlist.map((_, idx) => 
          `        <TRACK Key="${idx + 1}"/>`
        ).join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<DJ_PLAYLISTS Version="1.0.0">\n  <PRODUCT Name="rekordbox" Version="6.8.5" Company="Pioneer DJ"/>\n  <COLLECTION Entries="${setlist.length}">\n${trackXmlEntries}\n  </COLLECTION>\n  <PLAYLISTS>\n    <NODE Type="0" Name="ROOT">\n      <NODE Name="HENRY_IX_STUDIO_SETLIST" Type="1" KeyType="0" Entries="${setlist.length}">\n${playlistKeyEntries}\n      </NODE>\n    </NODE>\n  </PLAYLISTS>\n</DJ_PLAYLISTS>`;

        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'HENRY_IX_REKORDBOX_SETLIST.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        get().addToast({
          title: 'REKORDBOX XML EXPORTED',
          message: 'Saved HENRY_IX_REKORDBOX_SETLIST.xml ready for USB sync.',
          type: 'success',
        });
      },

      // Gigs Actions
      setActiveGigId: (id) => set({ activeGigId: id }),

      toggleBagItem: (id) => {
        set(state => ({
          bagItems: state.bagItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
        }));
      },

      admitGuest: (guest) => {
        const time = new Date().toLocaleTimeString().slice(0, 5);
        const newEntry: AdmittedGuest = { ...guest, time };
        set(state => ({
          admittedGuests: [newEntry, ...state.admittedGuests]
        }));
      },

      downloadInvoice: (gigId) => {
        const gig = get().gigs.find(g => g.id === gigId) || get().gigs[0];
        if (!gig) {
          get().addToast({
            title: 'NO ACTIVE GIG',
            message: 'No gig available in Notion to generate invoice. Please add a gig first.',
            type: 'warning',
          });
          return;
        }

        const taxRate = get().settings.taxReserve;
        const taxReserve = (gig.fee * (taxRate / 100)).toFixed(2);
        const net = (gig.fee * (1 - taxRate / 100)).toFixed(2);

        const invoiceDoc = `================================================================================\nHENRY IX // OFFICIAL DJ PERFORMANCE INVOICE\n================================================================================\nInvoice No: H9-INV-${gig.id.toUpperCase()}\nDate: ${new Date().toLocaleDateString('en-GB')}\nPayment Terms: 14 Days Net\n\nBILL TO:\nPromoter: ${gig.promoter}\nVenue: ${gig.venue}\nAddress: ${gig.address}\n\nPERFORMANCE DETAILS:\nEvent: ${gig.title}\nDate: ${gig.date}\nSet Time: ${gig.setTime}\n\nFINANCIAL BREAKDOWN:\nGross DJ Performance Fee:        £${gig.fee.toFixed(2)}\nDeposit Status:                  ${gig.depositPaid ? 'PAID' : 'DUE ON ARRIVAL'}\n${taxRate}% UK HMRC Tax Reserve:          £${taxReserve}\nNet Artist Remittance:           £${net}\n\nBANK PAYMENT DETAILS (UK FASTER PAYMENTS / BACS):\nAccount Name: Henry IX Music Ltd\nSort Code: 04-00-04\nAccount No: 18080000\nBank: Monzo Business UK\nReference: ${gig.id.toUpperCase()}\n================================================================================`;

        const blob = new Blob([invoiceDoc], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `INVOICE_${gig.venue.replace(/\s+/g, '_')}_${gig.date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        get().addToast({
          title: 'INVOICE GENERATED',
          message: `Saved invoice for ${gig.venue} with ${taxRate}% HMRC tax reserve.`,
          type: 'success',
        });
      },

      downloadDaySheet: (gigId) => {
        const gig = get().gigs.find(g => g.id === gigId) || get().gigs[0];
        if (!gig) {
          get().addToast({
            title: 'NO ACTIVE GIG',
            message: 'No gig available in Notion to generate day sheet. Please add a gig first.',
            type: 'warning',
          });
          return;
        }

        const daySheet = `================================================================================\nHENRY IX // 1-PAGE TOUR DAY SHEET\n================================================================================\nEVENT: ${gig.title}\nDATE: ${gig.date}\nVENUE: ${gig.venue}\nADDRESS: ${gig.address}\n\nSCHEDULE:\nDeparture Time:     ${gig.departureTime} (Home Studio)\nTransit Route:      ${gig.transitRoute}\nDoors Open:         22:00\nArtist Call-Time:   ${gig.callTime} (30-min buffer)\nPERFORMANCE TIME:   ${gig.setTime}\n\nCONTACTS & ACCESS:\nPromoter:           ${gig.promoter} (${gig.promoterPhone})\nStage Manager:      Alex (07890 112233)\nWi-Fi:              ${gig.wifi}\nGuestlist:          ${gig.guestlistAllocated} Slots Allocated\n\nEQUIPMENT SPECS:\n- 3x or 4x Pioneer CDJ-3000 (Firmware updated)\n- 1x Pioneer DJM-A9 Mixer\n- 2x Active Stereo Booth Monitors (L-Acoustics/d&b)\n- Zoom H4n Booth Recorder connected to Record Out\n================================================================================`;

        const blob = new Blob([daySheet], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DAYSHEET_${gig.venue.replace(/\s+/g, '_')}_${gig.date}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        get().addToast({
          title: 'DAY SHEET DOWNLOADED',
          message: `1-Page Day Sheet saved for ${gig.venue}.`,
          type: 'success',
        });
      },

      // Assets
      setSmartCropMode: (mode) => set({ smartCropMode: mode }),
      setWatermarkActive: (active) => set({ watermarkActive: active }),

      triggerEmergencyPurge: async () => {
        try {
          await fetch('/api/revalidate?secret=henryix_revalidate_secret&path=/');
          get().addToast({
            title: 'EMERGENCY CACHE PURGED',
            message: 'Global Cloudflare R2 & Next.js edge nodes invalidated (<5s SLA).',
            type: 'error',
          });
        } catch {
          get().addToast({
            title: 'PURGE SIGNAL SENT',
            message: 'Edge invalidation requested.',
            type: 'warning',
          });
        }
      },

      // Social
      reorderInstagramGrid: (startIndex, endIndex) => {
        const grid = [...get().instagramGrid];
        const [removed] = grid.splice(startIndex, 1);
        grid.splice(endIndex, 0, removed);
        set({ instagramGrid: grid });
        get().addToast({
          title: '3X3 GRID REORDERED',
          message: 'Instagram layout arrangement updated.',
          type: 'info',
        });
      },

      addInstagramPost: (post) => {
        const newPost: InstagramPost = { ...post, id: 'post_' + Date.now() };
        set(state => ({
          instagramGrid: [newPost, ...state.instagramGrid.slice(0, 8)]
        }));
        get().addToast({
          title: 'NEW POST STAGED',
          message: `${post.title} added to visual grid.`,
          type: 'success',
        });
      },

      // Real Data Actions
      fetchRealTracks: async (search?: string, genre?: string) => {
        set({ isLoadingTracks: true });
        try {
          const params = new URLSearchParams();
          if (search) params.set('search', search);
          if (genre && genre !== 'All') params.set('genre', genre);
          params.set('limit', '100');

          const res = await fetch(`/api/studio/tracks?${params.toString()}`);
          if (res.ok) {
            const data: any = await res.json();
            if (data.success && Array.isArray(data.tracks)) {
              if (data.tracks.length > 0) {
                set(state => ({
                  trackCollection: data.tracks,
                  currentTrack: state.currentTrack || data.tracks[0],
                }));
              } else if (search || (genre && genre !== 'All')) {
                set({ trackCollection: [] });
              }
            }
          }
        } catch (err) {
          console.warn('Failed to fetch real tracks from Notion:', err);
        } finally {
          set({ isLoadingTracks: false });
        }
      },

      fetchRealGigs: async () => {
        set({ isLoadingGigs: true });
        try {
          const res = await fetch('/api/studio/gigs');
          if (res.ok) {
            const data: any = await res.json();
            if (data.success && Array.isArray(data.gigs)) {
              const liveGigs: StudioGig[] = data.gigs;
              const currentActive = get().activeGigId;
              const nextActive = liveGigs.length > 0
                ? (currentActive && liveGigs.some(g => g.id === currentActive) ? currentActive : liveGigs[0].id)
                : '';
              set({ gigs: liveGigs, activeGigId: nextActive });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch real gigs from Notion:', err);
        } finally {
          set({ isLoadingGigs: false });
        }
      },

      fetchContentPosts: async () => {
        set({ isLoadingSocial: true });
        try {
          const res = await fetch('/api/studio/social');
          if (res.ok) {
            const data: any = await res.json();
            if (data.success && Array.isArray(data.posts)) {
              set({ instagramGrid: data.posts });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch content posts from Notion:', err);
        } finally {
          set({ isLoadingSocial: false });
        }
      },

      setGigs: (gigs: StudioGig[]) => {
        set({
          gigs,
          activeGigId: gigs.length > 0 ? gigs[0].id : '',
        });
      },

      // Settings
      updateSettings: (patch) => {
        set(state => {
          const updated = { ...state.settings, ...patch };
          if (typeof document !== 'undefined') {
            if (updated.theme === 'oled') {
              document.documentElement.classList.remove('theme-zinc', 'theme-light');
              document.documentElement.style.setProperty('--bg-studio', '#000000');
            } else if (updated.theme === 'zinc') {
              document.documentElement.classList.add('theme-zinc');
              document.documentElement.classList.remove('theme-light');
              document.documentElement.style.setProperty('--bg-studio', '#09090b');
            } else if (updated.theme === 'light') {
              document.documentElement.classList.add('theme-light');
              document.documentElement.classList.remove('theme-zinc');
              document.documentElement.style.setProperty('--bg-studio', '#f4f4f5');
            }
            document.documentElement.style.setProperty(
              '--color-primary-glow',
              `rgba(216, 22, 63, ${updated.glowIntensity / 100})`
            );
          }
          return { settings: updated };
        });

        get().addToast({
          title: 'SETTINGS APPLIED',
          message: 'Changes saved to workspace state.',
          type: 'success',
        });
      },
    }),
    {
      name: 'henryix_studio_master_store_v2',
      partialize: (state) => ({
        settings: state.settings,
        bagItems: state.bagItems,
        instagramGrid: state.instagramGrid,
      }),
    }
  )
);
