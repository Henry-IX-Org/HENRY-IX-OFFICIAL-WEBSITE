// Modular OAuth Provider Adapters for HENRY IX Studio
// Implements strict isolation: an error in one provider never impacts others.

import type {
  OAuthProviderId,
  OAuthProviderAdapter,
  OAuthTokenData,
  OAuthUserProfile,
} from './types';

// ============================================================================
// 1. SPOTIFY PROVIDER
// ============================================================================
export const spotifyProvider: OAuthProviderAdapter = {
  id: 'spotify',
  name: 'Spotify Web API',

  isConfigured(): boolean {
    return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  },

  getMissingEnvKeys(): string[] {
    const missing: string[] = [];
    if (!process.env.SPOTIFY_CLIENT_ID) missing.push('SPOTIFY_CLIENT_ID');
    if (!process.env.SPOTIFY_CLIENT_SECRET) missing.push('SPOTIFY_CLIENT_SECRET');
    return missing;
  },

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.SPOTIFY_CLIENT_ID || '';
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-top-read',
      'user-read-playback-state',
    ].join(' ');

    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', scopes);
    url.searchParams.set('state', state);
    url.searchParams.set('show_dialog', 'true');
    return url.toString();
  },

  async exchangeCode(code: string, redirectUri: string) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: 'Spotify Client ID or Secret missing on server' };
    }

    try {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenJson = (await tokenRes.json()) as any;
      if (!tokenRes.ok || !tokenJson.access_token) {
        return {
          success: false,
          error: tokenJson.error_description || tokenJson.error || 'Failed to exchange Spotify token',
        };
      }

      const tokens: OAuthTokenData = {
        accessToken: tokenJson.access_token,
        refreshToken: tokenJson.refresh_token,
        expiresIn: tokenJson.expires_in,
        expiresAt: Date.now() + (tokenJson.expires_in || 3600) * 1000,
        tokenType: tokenJson.token_type,
        scope: tokenJson.scope,
      };

      const profile = await this.getProfile!(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile: profile || {
          id: 'spotify-user',
          username: 'Spotify Account',
          displayName: 'Spotify User',
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Spotify network request failed' };
    }
  },

  async refreshAccessToken(refreshToken: string) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return { success: false, error: 'Spotify credentials missing' };
    }

    try {
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.access_token) {
        return { success: false, error: json.error_description || 'Refresh failed' };
      }

      return {
        success: true,
        tokens: {
          accessToken: json.access_token,
          refreshToken: json.refresh_token || refreshToken,
          expiresIn: json.expires_in,
          expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
          tokenType: json.token_type,
          scope: json.scope,
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Spotify token refresh failed' };
    }
  },

  async getProfile(accessToken: string): Promise<OAuthUserProfile | null> {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      return {
        id: data.id,
        username: data.id,
        displayName: data.display_name || data.id,
        email: data.email,
        avatarUrl: data.images?.[0]?.url,
        profileUrl: data.external_urls?.spotify,
      };
    } catch {
      return null;
    }
  },
};

// ============================================================================
// 2. ARE.NA PROVIDER
// ============================================================================
export const arenaProvider: OAuthProviderAdapter = {
  id: 'arena',
  name: 'Are.na Visual Research & Moodboards',

  isConfigured(): boolean {
    const hasOauth = Boolean(
      (process.env.ARENA_APP_ID || process.env.ARENA_CLIENT_ID) &&
      (process.env.ARENA_APP_SECRET || process.env.ARENA_CLIENT_SECRET)
    );
    const hasPersonalToken = Boolean(process.env.ARENA_PERSONAL_TOKEN || process.env.ARENA_ACCESS_TOKEN);
    return hasOauth || hasPersonalToken;
  },

  getMissingEnvKeys(): string[] {
    const missing: string[] = [];
    if (!process.env.ARENA_APP_ID && !process.env.ARENA_CLIENT_ID && !process.env.ARENA_PERSONAL_TOKEN && !process.env.ARENA_ACCESS_TOKEN) {
      missing.push('ARENA_APP_ID (or ARENA_PERSONAL_TOKEN)');
      missing.push('ARENA_APP_SECRET');
    }
    return missing;
  },

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.ARENA_APP_ID || process.env.ARENA_CLIENT_ID || '';
    const url = new URL('https://dev.are.na/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    return url.toString();
  },

  async exchangeCode(code: string, redirectUri: string) {
    const clientId = process.env.ARENA_APP_ID || process.env.ARENA_CLIENT_ID;
    const clientSecret = process.env.ARENA_APP_SECRET || process.env.ARENA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: 'Are.na App ID or Secret missing on server' };
    }

    try {
      const res = await fetch('https://dev.are.na/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.access_token) {
        return {
          success: false,
          error: json.error_description || json.error || 'Failed to exchange Are.na token',
        };
      }

      const tokens: OAuthTokenData = {
        accessToken: json.access_token,
        tokenType: json.token_type || 'Bearer',
        expiresAt: undefined, // Are.na access tokens generally do not expire
      };

      const profile = await this.getProfile!(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile: profile || {
          id: 'arena-user',
          username: 'Are.na User',
          displayName: 'Are.na Channel Sync',
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Are.na token exchange request failed' };
    }
  },

  async getProfile(accessToken: string): Promise<OAuthUserProfile | null> {
    try {
      const res = await fetch('https://api.are.na/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      return {
        id: String(data.id),
        username: data.slug || data.username || String(data.id),
        displayName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'Are.na User',
        avatarUrl: data.avatar_image?.display,
        profileUrl: `https://www.are.na/${data.slug}`,
      };
    } catch {
      return null;
    }
  },
};

// ============================================================================
// 3. SOUNDCLOUD PROVIDER
// ============================================================================
export const soundcloudProvider: OAuthProviderAdapter = {
  id: 'soundcloud',
  name: 'SoundCloud API',

  isConfigured(): boolean {
    return Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET);
  },

  getMissingEnvKeys(): string[] {
    const missing: string[] = [];
    if (!process.env.SOUNDCLOUD_CLIENT_ID) missing.push('SOUNDCLOUD_CLIENT_ID');
    if (!process.env.SOUNDCLOUD_CLIENT_SECRET) missing.push('SOUNDCLOUD_CLIENT_SECRET');
    return missing;
  },

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID || '';
    const url = new URL('https://secure.soundcloud.com/connect');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('state', state);
    return url.toString();
  },

  async exchangeCode(code: string, redirectUri: string) {
    const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
    const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: 'SoundCloud credentials missing on server' };
    }

    try {
      const res = await fetch('https://api.soundcloud.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.access_token) {
        return { success: false, error: json.error || 'Failed to exchange SoundCloud token' };
      }

      const tokens: OAuthTokenData = {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        expiresIn: json.expires_in,
        expiresAt: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
      };

      const profile = await this.getProfile!(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile: profile || {
          id: 'soundcloud-user',
          username: 'SoundCloud Artist',
          displayName: 'SoundCloud User',
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'SoundCloud token exchange failed' };
    }
  },

  async getProfile(accessToken: string): Promise<OAuthUserProfile | null> {
    try {
      const res = await fetch('https://api.soundcloud.com/me', {
        headers: { Authorization: `OAuth ${accessToken}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      return {
        id: String(data.id),
        username: data.permalink || String(data.id),
        displayName: data.username || data.permalink || 'SoundCloud User',
        avatarUrl: data.avatar_url,
        profileUrl: data.permalink_url,
      };
    } catch {
      return null;
    }
  },
};

// ============================================================================
// 4. GOOGLE DRIVE PROVIDER
// ============================================================================
export const googleDriveProvider: OAuthProviderAdapter = {
  id: 'google_drive',
  name: 'Google Drive Audio & Stems',

  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  },

  getMissingEnvKeys(): string[] {
    const missing: string[] = [];
    if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
    if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
    return missing;
  },

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', state);
    return url.toString();
  },

  async exchangeCode(code: string, redirectUri: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return { success: false, error: 'Google Client credentials missing' };
    }

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.access_token) {
        return { success: false, error: json.error_description || 'Google token exchange failed' };
      }

      const tokens: OAuthTokenData = {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        expiresIn: json.expires_in,
        expiresAt: Date.now() + (json.expires_in || 3600) * 1000,
        tokenType: json.token_type,
        scope: json.scope,
      };

      const profile = await this.getProfile!(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile: profile || {
          id: 'google-user',
          username: 'Google Account',
          displayName: 'Google Workspace',
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google token exchange failed' };
    }
  },

  async getProfile(accessToken: string): Promise<OAuthUserProfile | null> {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      return {
        id: data.sub,
        username: data.email,
        displayName: data.name || data.email,
        email: data.email,
        avatarUrl: data.picture,
      };
    } catch {
      return null;
    }
  },
};

// ============================================================================
// 5. DROPBOX PROVIDER
// ============================================================================
export const dropboxProvider: OAuthProviderAdapter = {
  id: 'dropbox',
  name: 'Dropbox Cloud Audio',

  isConfigured(): boolean {
    const hasKeyAndSecret = Boolean(process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET);
    const hasStaticToken = Boolean(process.env.DROPBOX_ACCESS_TOKEN);
    return hasKeyAndSecret || hasStaticToken;
  },

  getMissingEnvKeys(): string[] {
    const missing: string[] = [];
    if (!process.env.DROPBOX_APP_KEY && !process.env.DROPBOX_ACCESS_TOKEN) {
      missing.push('DROPBOX_APP_KEY');
      missing.push('DROPBOX_APP_SECRET');
    }
    return missing;
  },

  getAuthUrl(redirectUri: string, state: string): string {
    const appKey = process.env.DROPBOX_APP_KEY || '';
    const url = new URL('https://www.dropbox.com/oauth2/authorize');
    url.searchParams.set('client_id', appKey);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('token_access_type', 'offline');
    url.searchParams.set('state', state);
    return url.toString();
  },

  async exchangeCode(code: string, redirectUri: string) {
    const appKey = process.env.DROPBOX_APP_KEY;
    const appSecret = process.env.DROPBOX_APP_SECRET;

    if (!appKey || !appSecret) {
      return { success: false, error: 'Dropbox App Key or Secret missing on server' };
    }

    try {
      const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: appKey,
          client_secret: appSecret,
          redirect_uri: redirectUri,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok || !json.access_token) {
        return { success: false, error: json.error_description || 'Dropbox token exchange failed' };
      }

      const tokens: OAuthTokenData = {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        expiresIn: json.expires_in,
        expiresAt: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
      };

      const profile = await this.getProfile!(tokens.accessToken);

      return {
        success: true,
        tokens,
        profile: profile || {
          id: json.account_id || 'dropbox-user',
          username: 'Dropbox User',
          displayName: 'Dropbox Audio Vault',
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Dropbox token exchange failed' };
    }
  },

  async getProfile(accessToken: string): Promise<OAuthUserProfile | null> {
    try {
      const res = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: 'null',
      });
      if (!res.ok) return null;
      const data = (await res.json()) as any;
      return {
        id: data.account_id,
        username: data.email,
        displayName: data.name?.display_name || data.email,
        email: data.email,
        avatarUrl: data.profile_photo_url,
      };
    } catch {
      return null;
    }
  },
};

// ============================================================================
// REGISTRY ACCESSOR
// ============================================================================
export const OAUTH_PROVIDERS: Record<OAuthProviderId, OAuthProviderAdapter> = {
  spotify: spotifyProvider,
  arena: arenaProvider,
  soundcloud: soundcloudProvider,
  google_drive: googleDriveProvider,
  dropbox: dropboxProvider,
};

export function getOAuthProvider(id: string): OAuthProviderAdapter | null {
  return OAUTH_PROVIDERS[id as OAuthProviderId] || null;
}
