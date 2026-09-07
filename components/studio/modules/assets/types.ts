export interface StudioAsset {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'flyer';
  event: string;
  dimensions: string;
  aspectRatio: '9:16' | '4:5' | '16:9' | '1:1';
  r2Key: string;
  published: boolean;
  size: string;
}

export const INITIAL_VAULT_ASSETS: StudioAsset[] = [
  {
    id: 'asset-rc1',
    title: 'Royal Court Session 1 Track Artwork',
    type: 'photo',
    event: 'Royal Court',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Mixes/Royal Court/Mix Artwork/Session 1.png',
    published: true,
    size: '6.8 MB',
  },
  {
    id: 'asset-kc1',
    title: 'Knight Club Session 1 Artwork',
    type: 'photo',
    event: 'Knight Club',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Mixes/Knight Club/Mix Artwork/Knight Club Track Artwork Session 1.jpg',
    published: true,
    size: '6.8 MB',
  },
  {
    id: 'asset-cnc1',
    title: 'Corner New Cross N1 Artwork',
    type: 'photo',
    event: 'Corner New Cross',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Mixes/Corner New Cross/Mix Artwork/CNC N1 Artwork.png',
    published: true,
    size: '3.1 MB',
  },
  {
    id: 'asset-pfp',
    title: 'Official Red Background With PFP Cutout',
    type: 'photo',
    event: 'Identity Archive',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Official Red Background With PFP Cutout - No Text.png',
    published: true,
    size: '4.2 MB',
  },
  {
    id: 'asset-video-drop',
    title: 'Booth Drop Overhead (0:45s)',
    type: 'video',
    event: 'Knight Club Vol 4',
    dimensions: '1080x1920',
    aspectRatio: '9:16',
    r2Key: 'Videos/KC4_Booth_Drop_1080p.mp4',
    published: true,
    size: '24.2 MB',
  },
];

export const DROPZONE_FILES = [
  { id: 'dz-1', name: 'CORNER_N1_4K_RAW_BOOTH.MOV', size: '1.42 GB', event: 'Corner New Cross N1', status: 'Pending Transcode', format: 'Apple ProRes 422' },
  { id: 'dz-2', name: 'ROYAL_COURT_SESSION_1.WAV', size: '1.12 GB', event: 'Royal Court', status: 'Ready for WebP/MP3', format: '24-bit 48kHz WAV' },
  { id: 'dz-3', name: 'KNIGHT_CLUB_SESSION_4_COVER.PNG', size: '6.8 MB', event: 'Knight Club Vol 4', status: 'Ready to Publish', format: 'PNG 3000x3000' },
  { id: 'dz-4', name: 'BOILER_ROOM_DROP_CLIP.MP4', size: '64.5 MB', event: 'Boiler Room Style', status: 'Ready to Publish', format: '1080p60 H.264' },
];
