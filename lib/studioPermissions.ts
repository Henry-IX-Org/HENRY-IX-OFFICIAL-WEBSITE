// Role-Based Access Control (RBAC) & Permissions Engine for HENRY IX Studio

export type StudioRole = 
  | 'owner' 
  | 'manager' 
  | 'media' 
  | 'audio_engineer' 
  | 'guest_operator'
  | 'viewer';

export const ALL_STUDIO_ROLES: StudioRole[] = [
  'owner',
  'manager',
  'media',
  'audio_engineer',
  'guest_operator',
  'viewer',
];

export type StudioPermission =
  | 'streaming:view'
  | 'streaming:broadcast'
  | 'streaming:clips'
  | 'music:view'
  | 'music:edit'
  | 'music:export'
  | 'assets:view'
  | 'assets:upload'
  | 'assets:delete'
  | 'assets:watermark'
  | 'gigs:view'
  | 'gigs:edit'
  | 'gigs:finance'
  | 'gigs:scanner'
  | 'social:view'
  | 'social:publish'
  | 'team:manage'
  | 'settings:master_services'
  | 'settings:edit';

export interface RoleMetadata {
  key: StudioRole;
  title: string;
  badge: string;
  description: string;
  primaryView: string;
}

export const ROLE_METADATA: Record<StudioRole, RoleMetadata> = {
  owner: {
    key: 'owner',
    title: 'Owner & Resident DJ',
    badge: 'OWNER',
    description: 'Full unrestricted superadmin access to all audio DSP, cloud vault, finance, and master infrastructure.',
    primaryView: 'music-all',
  },
  manager: {
    key: 'manager',
    title: 'Tour & Booking Manager',
    badge: 'MANAGER',
    description: 'Manages gig logistics, TfL travel departure buffers, day sheets, promoter EPK, and HMRC invoices.',
    primaryView: 'gigs-hub',
  },
  media: {
    key: 'media',
    title: 'Media & Visuals Director',
    badge: 'MEDIA',
    description: 'Controls asset vault, video transcoding, Instagram 3x3 layout, watermark guard, and story card generator.',
    primaryView: 'assets-vault',
  },
  audio_engineer: {
    key: 'audio_engineer',
    title: 'Sound & Broadcast Engineer',
    badge: 'AUDIO ENG',
    description: 'Manages OBS live broadcast stream, transient beat-sync director, CDJ waveform telemetry, and VU meters.',
    primaryView: 'streaming-live',
  },
  guest_operator: {
    key: 'guest_operator',
    title: 'Guest / Door Staff',
    badge: 'DOOR CREW',
    description: 'Specialized mobile-ready guestlist verification, fast QR door scanner, and day sheet reader.',
    primaryView: 'gigs-scanner',
  },
  viewer: {
    key: 'viewer',
    title: 'Guest / Viewer',
    badge: 'GUEST',
    description: 'Read-only access to public day sheets and guestlist validation.',
    primaryView: 'gigs-daysheet',
  },
};

export const ROLE_PERMISSIONS: Record<StudioRole, StudioPermission[]> = {
  owner: [
    'streaming:view',
    'streaming:broadcast',
    'streaming:clips',
    'music:view',
    'music:edit',
    'music:export',
    'assets:view',
    'assets:upload',
    'assets:delete',
    'assets:watermark',
    'gigs:view',
    'gigs:edit',
    'gigs:finance',
    'gigs:scanner',
    'social:view',
    'social:publish',
    'team:manage',
    'settings:master_services',
    'settings:edit',
  ],
  manager: [
    'streaming:view',
    'streaming:clips',
    'music:view',
    'assets:view',
    'gigs:view',
    'gigs:edit',
    'gigs:finance',
    'gigs:scanner',
    'settings:edit',
  ],
  media: [
    'assets:view',
    'assets:upload',
    'assets:watermark',
    'social:view',
    'social:publish',
    'settings:edit',
  ],
  audio_engineer: [
    'streaming:view',
    'streaming:broadcast',
    'streaming:clips',
    'music:view',
    'music:edit',
    'gigs:view',
    'settings:edit',
  ],
  guest_operator: [
    'gigs:view',
    'gigs:scanner',
  ],
  viewer: [
    'gigs:view',
  ],
};

export function hasPermission(
  userRole?: StudioRole | null,
  permission?: StudioPermission
): boolean {
  if (!userRole || !permission) return false;
  if (userRole === 'owner') return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

export function canAccessModule(role?: StudioRole | null, moduleKey?: string): boolean {
  if (!role || !moduleKey) return false;
  if (role === 'owner') return true;

  if (moduleKey.startsWith('streaming-')) {
    return hasPermission(role, 'streaming:view');
  }
  if (moduleKey.startsWith('music-')) {
    return hasPermission(role, 'music:view');
  }
  if (moduleKey.startsWith('assets-')) {
    return hasPermission(role, 'assets:view');
  }
  if (moduleKey.startsWith('gigs-')) {
    if (moduleKey === 'gigs-scanner') return hasPermission(role, 'gigs:scanner');
    if (moduleKey === 'gigs-finance') return hasPermission(role, 'gigs:finance');
    return hasPermission(role, 'gigs:view');
  }
  if (moduleKey.startsWith('social-')) {
    return hasPermission(role, 'social:view');
  }

  return false;
}
