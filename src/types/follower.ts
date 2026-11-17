import type { DataProvenance, DataSourceKind } from './provenance';

export const relationshipTypes = [
  'new',
  'lost',
  'not_following_back',
  'not_followed_back',
  'mutual',
] as const;

export type RelationshipType = (typeof relationshipTypes)[number];

export type Follower = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  followedAt: string | null;
  lastSeenAt: string | null;
  relationshipType: RelationshipType;
  source: DataSourceKind;
  verified: boolean | null;
  isPublic: boolean | null;
  profileUrl: string | null;
};

export type FollowerGroups = Record<RelationshipType, readonly Follower[]>;

export type FollowerTotals = {
  followers: number | null;
  following: number | null;
  mutual: number | null;
  previousFollowers: number | null;
  previousFollowing: number | null;
  previousMutual: number | null;
};

export type FollowerDataset = {
  preview: boolean;
  provenance: DataProvenance;
  groups: FollowerGroups;
  totals: FollowerTotals;
};

export const followerSorts = ['username-asc', 'username-desc', 'newest', 'oldest'] as const;

export type FollowerSort = (typeof followerSorts)[number];
