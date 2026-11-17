export const instagramConnectionStatuses = [
  'connected',
  'disconnected',
  'expired',
  'revoked',
] as const;

export type InstagramConnectionState = (typeof instagramConnectionStatuses)[number];

export type InstagramAccount = {
  id: string;
  instagramUserId: string;
  username: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  accountType: string | null;
  followersCount: number | null;
  followsCount: number | null;
  mediaCount: number | null;
  connectionStatus: InstagramConnectionState;
  scopes: string[];
  lastSyncedAt: string | null;
  connectedAt: string;
  disconnectedAt: string | null;
  tokenExpiresAt: string | null;
};

export type InstagramConnectSession = {
  authorizationUrl: string;
  expiresAt: string;
};

export type InstagramDisconnectResult = {
  disconnected: true;
  remoteAuthorizationRevoked: false;
};
