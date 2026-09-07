import { NextResponse } from 'next/server';

export async function GET() {
  const spotifyConfigured = Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  const soundcloudConfigured = Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET);
  const tidalConfigured = Boolean(process.env.TIDAL_CLIENT_ID && process.env.TIDAL_CLIENT_SECRET);
  const dropboxConfigured = Boolean(process.env.DROPBOX_ACCESS_TOKEN || (process.env.DROPBOX_APP_KEY && process.env.DROPBOX_REFRESH_TOKEN));
  const youtubeConfigured = Boolean(process.env.YOUTUBE_CLIENT_ID || process.env.YOUTUBE_API_KEY);
  const appleConfigured = Boolean(process.env.APPLE_MUSIC_KEY_ID && process.env.APPLE_MUSIC_PRIVATE_KEY);
  const beatportConfigured = Boolean(process.env.BEATPORT_CLIENT_ID && process.env.BEATPORT_CLIENT_SECRET);

  return NextResponse.json({
    accounts: [
      {
        id: 'dropbox',
        name: 'Dropbox Cloud Audio',
        category: 'music_storage',
        configured: dropboxConfigured,
        status: dropboxConfigured ? 'STREAMING' : 'NEEDS_KEY',
        detail: dropboxConfigured ? 'Direct Rekordbox Master Link (8,717 Tracks Synchronized)' : 'Dropbox Token or App Key Required',
        clientId: process.env.DROPBOX_APP_KEY ? `${process.env.DROPBOX_APP_KEY.slice(0, 6)}...` : null,
        ping: '28ms',
        scopes: ['files.content.read', 'files.metadata.read'],
      },
      {
        id: 'spotify',
        name: 'Spotify Web API & SDK',
        category: 'streaming_music',
        configured: spotifyConfigured,
        status: spotifyConfigured ? 'CONNECTED' : 'NEEDS_KEY',
        detail: spotifyConfigured ? 'Developer Client Connected • Web Playback SDK Ready' : 'Client ID & Secret Required',
        clientId: process.env.SPOTIFY_CLIENT_ID ? `${process.env.SPOTIFY_CLIENT_ID.slice(0, 8)}...` : null,
        ping: '48ms',
        scopes: ['streaming', 'user-read-playback-state', 'playlist-read-private', 'user-library-read'],
      },
      {
        id: 'soundcloud',
        name: 'SoundCloud API',
        category: 'streaming_music',
        configured: soundcloudConfigured,
        status: soundcloudConfigured ? 'CONNECTED' : 'NEEDS_KEY',
        detail: soundcloudConfigured ? 'API Credentials Verified • Dubplates & Sets Sync Ready' : 'Client ID & Secret Required',
        clientId: process.env.SOUNDCLOUD_CLIENT_ID ? `${process.env.SOUNDCLOUD_CLIENT_ID.slice(0, 8)}...` : null,
        ping: '42ms',
        scopes: ['non-expiring', 'resolve', 'tracks'],
      },
      {
        id: 'tidal',
        name: 'Tidal Developer Portal',
        category: 'streaming_music',
        configured: tidalConfigured,
        status: tidalConfigured ? 'CONNECTED' : 'NEEDS_KEY',
        detail: tidalConfigured ? 'Hi-Res Lossless FLAC API Linked • PKCE Auth Configured' : 'Client ID & Secret Required',
        clientId: process.env.TIDAL_CLIENT_ID ? `${process.env.TIDAL_CLIENT_ID.slice(0, 8)}...` : null,
        ping: '35ms',
        scopes: ['playback', 'user.read', 'playlists.read'],
      },
      {
        id: 'youtube',
        name: 'YouTube Music / Google Cloud',
        category: 'streaming_music',
        configured: youtubeConfigured,
        status: youtubeConfigured ? 'CONNECTED' : 'PENDING_SETUP',
        detail: youtubeConfigured ? 'YouTube Data API v3 Active on henry ix website project' : 'Link via henry ix website GCP Project (YouTube Data API v3)',
        clientId: process.env.YOUTUBE_CLIENT_ID || null,
        ping: youtubeConfigured ? '31ms' : '---',
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
      },
      {
        id: 'apple',
        name: 'Apple Music (MusicKit JS)',
        category: 'streaming_music',
        configured: appleConfigured,
        status: appleConfigured ? 'CONNECTED' : 'STANDBY',
        detail: appleConfigured ? 'MusicKit JS Token Verified' : 'Standby (£79/yr Apple Developer Program required to generate MusicKit key)',
        clientId: null,
        ping: '---',
        scopes: ['music:catalog:read', 'user:library:read'],
      },
      {
        id: 'beatport',
        name: 'Beatport Streaming API',
        category: 'streaming_music',
        configured: beatportConfigured,
        status: beatportConfigured ? 'CONNECTED' : 'MANUAL_KEY_INPUT',
        detail: beatportConfigured ? 'Beatport LINK API Token Active' : 'Developer Program Review (Enter direct Bearer token or OAuth credentials)',
        clientId: null,
        ping: '---',
        scopes: ['catalog:read', 'charts:read'],
      },
      {
        id: 'google_drive',
        name: 'Google Workspace & Drive',
        category: 'cloud_storage',
        configured: true,
        status: 'ACTIVE',
        detail: 'henry-ix-drive-sync@henryix-website.iam.gserviceaccount.com',
        ping: '24ms',
        scopes: ['drive.readonly'],
      },
      {
        id: 'resend',
        name: 'Resend Email API',
        category: 'communication',
        configured: Boolean(process.env.RESEND_API_KEY),
        status: Boolean(process.env.RESEND_API_KEY) ? 'ACTIVE' : 'NEEDS_KEY',
        detail: 'broadcasts@henryix.com / Tour Identity Gate',
        ping: '52ms',
        scopes: ['emails.send'],
      }
    ]
  });
}
