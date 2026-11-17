import { emptyFollowerGroups, followerFixture } from '@/fixtures/followers';
import type { FollowerDataset } from '@/types/follower';

const emptyFollowers: FollowerDataset = {
  preview: false,
  provenance: {
    source: null,
    updatedAt: null,
    comparisonPeriod: null,
    availability: 'NOT_CONNECTED',
    note: 'No Instagram account is connected and no export has been imported. Counts stay empty until a real source provides them.',
  },
  groups: emptyFollowerGroups,
  totals: {
    followers: null,
    following: null,
    mutual: null,
    previousFollowers: null,
    previousFollowing: null,
    previousMutual: null,
  },
};

export function followerDataset(preview: boolean): FollowerDataset {
  return preview ? followerFixture : emptyFollowers;
}
