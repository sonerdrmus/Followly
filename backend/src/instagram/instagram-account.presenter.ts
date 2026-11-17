import type { InstagramAccount } from '@prisma/client';

export type PublicInstagramAccount = {
  id: string;
  instagramUserId: string;
  username: string;
  displayName: string | null;
  profilePictureUrl: string | null;
  accountType: string | null;
  followersCount: number | null;
  followsCount: number | null;
  mediaCount: number | null;
  connectionStatus: InstagramAccount['connectionStatus'];
  scopes: string[];
  lastSyncedAt: string | null;
  connectedAt: string;
  disconnectedAt: string | null;
  tokenExpiresAt: string | null;
};

export function toPublicInstagramAccount(account: InstagramAccount): PublicInstagramAccount {
  return {
    id: account.id,
    instagramUserId: account.instagramUserId,
    username: account.username,
    displayName: account.displayName,
    profilePictureUrl: account.profilePictureUrl,
    accountType: account.accountType,
    followersCount: account.followersCount,
    followsCount: account.followsCount,
    mediaCount: account.mediaCount,
    connectionStatus: account.connectionStatus,
    scopes: account.scopes
      .split(',')
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0),
    lastSyncedAt: account.lastSyncedAt?.toISOString() ?? null,
    connectedAt: account.connectedAt.toISOString(),
    disconnectedAt: account.disconnectedAt?.toISOString() ?? null,
    tokenExpiresAt: account.tokenExpiresAt?.toISOString() ?? null,
  };
}
