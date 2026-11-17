import type { Follower, FollowerSort, RelationshipType } from '@/types/follower';

export type FollowerQuery = {
  search: string;
  sort: FollowerSort;
  verifiedOnly: boolean;
  namedOnly: boolean;
};

export function dateFieldFor(category: RelationshipType): 'followedAt' | 'lastSeenAt' {
  return category === 'lost' ? 'lastSeenAt' : 'followedAt';
}

export function dateSortAvailable(
  followers: readonly Follower[],
  category: RelationshipType,
): boolean {
  const field = dateFieldFor(category);
  return followers.some((follower) => follower[field] !== null);
}

export function queryFollowers(
  followers: readonly Follower[],
  category: RelationshipType,
  query: FollowerQuery,
): readonly Follower[] {
  const needle = query.search.trim().toLowerCase();
  const field = dateFieldFor(category);
  const filtered = followers.filter((follower) => {
    if (query.verifiedOnly && follower.verified !== true) {
      return false;
    }
    if (query.namedOnly && !follower.displayName) {
      return false;
    }
    if (!needle) {
      return true;
    }
    const name = follower.displayName?.toLowerCase() ?? '';
    return follower.username.toLowerCase().includes(needle) || name.includes(needle);
  });

  const sorted = [...filtered];
  sorted.sort((left, right) => compareFollowers(left, right, query.sort, field));
  return sorted;
}

function compareFollowers(
  left: Follower,
  right: Follower,
  sort: FollowerSort,
  field: 'followedAt' | 'lastSeenAt',
): number {
  if (sort === 'username-asc' || sort === 'username-desc') {
    const result = left.username.localeCompare(right.username);
    return sort === 'username-asc' ? result : -result;
  }

  const leftTime = timeValue(left[field]);
  const rightTime = timeValue(right[field]);
  if (leftTime === null && rightTime === null) {
    return left.username.localeCompare(right.username);
  }
  if (leftTime === null) {
    return 1;
  }
  if (rightTime === null) {
    return -1;
  }

  const result = leftTime - rightTime;
  return sort === 'oldest' ? result : -result;
}

function timeValue(iso: string | null): number | null {
  if (!iso) {
    return null;
  }
  const time = new Date(iso).getTime();
  return Number.isNaN(time) ? null : time;
}

export function isPublicProfileUrl(value: string | null): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('instagram.com');
  } catch {
    return false;
  }
}
