import type { Follower, FollowerDataset, FollowerGroups, RelationshipType } from '@/types/follower';
import type { DataSourceKind } from '@/types/provenance';

/**
 * Local sample records for interaction testing.
 * Usernames are numbered samples. This module is not an Instagram account.
 */
const source: DataSourceKind = 'development_fixture';

function sample(
  relationshipType: RelationshipType,
  index: number,
  extras: Partial<Omit<Follower, 'id' | 'relationshipType' | 'source' | 'username'>> = {},
): Follower {
  const number = String(index).padStart(2, '0');
  return {
    id: `sample-${relationshipType}-${number}`,
    username: `sample.${relationshipType.replaceAll('_', '.')}.${number}`,
    displayName: extras.displayName === undefined ? `Sample profile ${number}` : extras.displayName,
    avatarUrl: null,
    followedAt: extras.followedAt ?? null,
    lastSeenAt: extras.lastSeenAt ?? null,
    relationshipType,
    source,
    verified: extras.verified ?? null,
    isPublic: extras.isPublic ?? null,
    profileUrl: null,
  };
}

const groups: FollowerGroups = {
  new: [
    sample('new', 1, { followedAt: '2026-03-08T12:00:00.000Z', verified: true, isPublic: true }),
    sample('new', 2, { followedAt: '2026-03-07T12:00:00.000Z', verified: false, isPublic: true }),
    sample('new', 3, { followedAt: '2026-03-06T12:00:00.000Z', verified: null, isPublic: false }),
    sample('new', 4, { followedAt: '2026-03-04T12:00:00.000Z', displayName: null, isPublic: true }),
    sample('new', 5, { followedAt: null, verified: true, isPublic: null }),
    sample('new', 6, {
      followedAt: '2026-03-02T12:00:00.000Z',
      displayName: 'Sample Cedar',
      isPublic: true,
    }),
    sample('new', 7, { followedAt: '2026-03-03T12:00:00.000Z', verified: false, isPublic: false }),
    sample('new', 8, { followedAt: '2026-03-05T12:00:00.000Z', displayName: 'Sample North' }),
  ],
  lost: [
    sample('lost', 1, {
      lastSeenAt: '2026-03-01T12:00:00.000Z',
      followedAt: '2026-01-12T12:00:00.000Z',
      isPublic: true,
    }),
    sample('lost', 2, {
      lastSeenAt: '2026-03-01T12:00:00.000Z',
      followedAt: '2026-02-02T12:00:00.000Z',
      verified: true,
    }),
    sample('lost', 3, { lastSeenAt: '2026-03-01T12:00:00.000Z', displayName: null }),
    sample('lost', 4, { lastSeenAt: '2026-02-20T12:00:00.000Z', isPublic: false }),
  ],
  not_following_back: [
    sample('not_following_back', 1, { followedAt: '2026-02-18T12:00:00.000Z', isPublic: true }),
    sample('not_following_back', 2, {
      followedAt: '2026-01-30T12:00:00.000Z',
      verified: true,
      isPublic: true,
    }),
    sample('not_following_back', 3, { followedAt: '2026-02-11T12:00:00.000Z', displayName: null }),
    sample('not_following_back', 4, { followedAt: null, isPublic: false }),
  ],
  not_followed_back: [
    sample('not_followed_back', 1, { followedAt: '2026-02-21T12:00:00.000Z', isPublic: true }),
    sample('not_followed_back', 2, { followedAt: '2026-03-01T12:00:00.000Z', verified: false }),
    sample('not_followed_back', 3, {
      followedAt: '2026-01-19T12:00:00.000Z',
      displayName: 'Sample West',
    }),
    sample('not_followed_back', 4, {
      followedAt: '2026-02-08T12:00:00.000Z',
      verified: true,
      isPublic: true,
    }),
  ],
  mutual: [
    sample('mutual', 1, { followedAt: '2025-11-02T12:00:00.000Z', verified: true, isPublic: true }),
    sample('mutual', 2, { followedAt: '2026-01-04T12:00:00.000Z', isPublic: true }),
    sample('mutual', 3, {
      followedAt: '2025-12-16T12:00:00.000Z',
      displayName: null,
      isPublic: false,
    }),
    sample('mutual', 4, { followedAt: '2026-02-14T12:00:00.000Z' }),
  ],
};

const followers = groups.new.length + groups.not_followed_back.length + groups.mutual.length;
const following = groups.not_following_back.length + groups.mutual.length;

export const followerFixture: FollowerDataset = {
  preview: true,
  provenance: {
    source: 'development_fixture',
    updatedAt: '2026-03-08T12:00:00.000Z',
    comparisonPeriod: 'Sample snapshots dated Mar 1 and Mar 8, 2026. Not your account.',
    availability: 'READY',
    note: 'Development fixture. These profiles and counts are sample records for testing search, sort, and detail. They are not your Instagram account.',
  },
  groups,
  totals: {
    followers,
    following,
    mutual: groups.mutual.length,
    previousFollowers: followers - groups.new.length + groups.lost.length,
    previousFollowing: following,
    previousMutual: Math.max(groups.mutual.length - 1, 0),
  },
};

export const emptyFollowerGroups: FollowerGroups = {
  new: [],
  lost: [],
  not_following_back: [],
  not_followed_back: [],
  mutual: [],
};
