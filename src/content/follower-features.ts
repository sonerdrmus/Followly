import type { DataReadiness } from '@/types/readiness';

export const followerFeatures = [
  {
    id: 'new-followers',
    title: 'New Followers',
    description: 'People added between two imported snapshots.',
    readiness: 'WAITING_FOR_SNAPSHOT',
  },
  {
    id: 'lost-followers',
    title: 'Lost Followers',
    description: 'People missing from a later snapshot.',
    readiness: 'WAITING_FOR_SNAPSHOT',
  },
  {
    id: 'not-following-back',
    title: 'Not Following Back',
    description: 'Accounts you follow that do not follow you back.',
    readiness: 'WAITING_FOR_SNAPSHOT',
  },
  {
    id: 'mutual-followers',
    title: 'Mutual Followers',
    description: 'Accounts in both your followers and following snapshots.',
    readiness: 'WAITING_FOR_SNAPSHOT',
  },
] as const satisfies readonly {
  id: string;
  title: string;
  description: string;
  readiness: DataReadiness;
}[];

export type FollowerFeatureId = (typeof followerFeatures)[number]['id'];
