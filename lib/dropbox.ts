/**
 * HENRY IX Studio — Dropbox Cloud Audio Integration
 * Resolves local/Notion file locations to Dropbox cloud paths and provides high-speed direct audio streams.
 */

export interface DropboxAccountInfo {
  accountId: string;
  name: string;
  email: string;
  connected: boolean;
}

// In-memory cache for temporary streaming links (valid for 4 hours; cached for 3.5 hours)
const linkCache = new Map<string, { link: string; expiresAt: number }>();

function getAccessToken(): string {
  return process.env.DROPBOX_ACCESS_TOKEN || '';
}

/**
 * Resolves a local or Notion file URI (e.g. file://localhost/.../rekordbox/contents_.../track.mp3)
 * into a Dropbox cloud path (e.g. /rekordbox/contents_.../track.mp3).
 */
export function resolveDropboxPath(fileLocation: string): string | null {
  if (!fileLocation) return null;
  try {
    const decoded = decodeURIComponent(fileLocation.trim());
    
    // Check for /rekordbox/ segment
    const idx = decoded.toLowerCase().indexOf('/rekordbox/');
    if (idx !== -1) {
      return decoded.slice(idx);
    }

    // Check for /HENRY IX/ segment
    const hIdx = decoded.toLowerCase().indexOf('/henry ix/');
    if (hIdx !== -1) {
      return decoded.slice(hIdx);
    }

    // If it's already a relative / path
    if (decoded.startsWith('/')) {
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Gets a temporary streaming link for a specific Dropbox path.
 * The link supports HTTP Range requests for instant seeking and Web Audio processing.
 */
export async function getDropboxTemporaryLink(path: string): Promise<string | null> {
  const token = getAccessToken();
  if (!token || !path) return null;

  // Check cache
  const cached = linkCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.link;
  }

  try {
    const res = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn(`[Dropbox Link Error] Path: ${path}`, err);
      return null;
    }

    const data: any = await res.json();
    if (data.link) {
      // Cache for 3.5 hours (12,600,000 ms)
      linkCache.set(path, {
        link: data.link,
        expiresAt: Date.now() + 12_600_000,
      });
      return data.link;
    }
    return null;
  } catch (error) {
    console.error('[Dropbox Fetch Error]', error);
    return null;
  }
}

/**
 * Fallback search: If an exact folder path has moved or changed, search Dropbox for the audio filename.
 */
export async function searchDropboxAudioFile(query: string): Promise<string | null> {
  const token = getAccessToken();
  if (!token || !query) return null;

  try {
    const res = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query.trim(),
        options: { max_results: 3 },
      }),
    });

    if (!res.ok) return null;
    const data: any = await res.json();

    if (data.matches && data.matches.length > 0) {
      for (const m of data.matches) {
        const meta = m.metadata?.metadata;
        if (meta?.path_display && /\.(mp3|wav|aif|aiff|m4a|flac)$/i.test(meta.path_display)) {
          return meta.path_display;
        }
      }
      return data.matches[0].metadata?.metadata?.path_display || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Primary helper: Resolves the direct audio stream URL for a given track object.
 */
export async function getAudioStreamForTrack(track: {
  fileLocation?: string;
  title?: string;
  artist?: string;
}): Promise<string | null> {
  // 1. Try exact path resolution from fileLocation
  if (track.fileLocation) {
    const dropboxPath = resolveDropboxPath(track.fileLocation);
    if (dropboxPath) {
      const link = await getDropboxTemporaryLink(dropboxPath);
      if (link) return link;
    }
  }

  // 2. Fallback: Search by clean filename or title
  if (track.fileLocation) {
    const parts = track.fileLocation.split(/[/\\]/);
    const filename = decodeURIComponent(parts[parts.length - 1] || '');
    if (filename) {
      const foundPath = await searchDropboxAudioFile(filename);
      if (foundPath) {
        const link = await getDropboxTemporaryLink(foundPath);
        if (link) return link;
      }
    }
  }

  // 3. Fallback: Search by "Artist - Title"
  if (track.title) {
    const searchTerms = track.artist ? `${track.artist} ${track.title}` : track.title;
    const foundPath = await searchDropboxAudioFile(searchTerms);
    if (foundPath) {
      const link = await getDropboxTemporaryLink(foundPath);
      if (link) return link;
    }
  }

  return null;
}

/**
 * Returns connected account status for Settings modal
 */
export async function getDropboxAccountInfo(): Promise<DropboxAccountInfo> {
  const token = getAccessToken();
  if (!token) {
    return { accountId: '', name: '', email: '', connected: false };
  }

  try {
    const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) {
      return { accountId: '', name: '', email: '', connected: false };
    }

    const data: any = await res.json();
    return {
      accountId: data.account_id || '',
      name: data.name?.display_name || 'HENRY IX',
      email: data.email || '',
      connected: true,
    };
  } catch {
    return { accountId: '', name: '', email: '', connected: false };
  }
}
