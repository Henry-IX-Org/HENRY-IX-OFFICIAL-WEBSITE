// Studio OAuth Types & Architecture Definitions
// Provides type safety for modular, decoupled third-party account connections.

export type OAuthProviderId = 'spotify' | 'arena' | 'soundcloud' | 'google_drive' | 'dropbox';

export interface OAuthTokenData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // In seconds from issuance
  expiresAt?: number; // Unix epoch ms
  tokenType?: string;
  scope?: string;
}

export interface OAuthUserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  profileUrl?: string;
}

export interface OAuthProviderConfig {
  id: OAuthProviderId;
  name: string;
  description: string;
  category: 'music' | 'visuals' | 'cloud_storage';
  configured: boolean;
  missingEnvKeys?: string[];
  authUrl: string;
  tokenUrl: string;
  defaultScopes: string[];
}

export interface OAuthProviderAdapter {
  id: OAuthProviderId;
  name: string;
  isConfigured(): boolean;
  getMissingEnvKeys(): string[];
  getAuthUrl(redirectUri: string, state: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<{
    success: boolean;
    tokens?: OAuthTokenData;
    profile?: OAuthUserProfile;
    error?: string;
  }>;
  refreshAccessToken?(refreshToken: string): Promise<{
    success: boolean;
    tokens?: OAuthTokenData;
    error?: string;
  }>;
  getProfile?(accessToken: string): Promise<OAuthUserProfile | null>;
}

export interface PublicConnectedAccountInfo {
  id: OAuthProviderId | 'obs';
  name: string;
  category: 'music' | 'visuals' | 'cloud_storage' | 'broadcast';
  connected: boolean;
  configured: boolean;
  missingEnvKeys?: string[];
  accountName?: string;
  accountUsername?: string;
  avatarUrl?: string;
  connectedAt?: string;
  detail?: string;
  isExpired?: boolean;
}
