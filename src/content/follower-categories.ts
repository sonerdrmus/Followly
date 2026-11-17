import type { RelationshipType } from '@/types/follower';
import type { DataReadiness } from '@/types/readiness';

export const categoryCopy: Record<
  RelationshipType,
  {
    label: string;
    summary: string;
    emptyTitle: string;
    emptyBody: string;
    status: DataReadiness;
  }
> = {
  new: {
    label: 'New Followers',
    summary: 'Present in a newer snapshot and absent from the previous one.',
    emptyTitle: 'No new followers yet',
    emptyBody:
      'New followers appear after two imported snapshots can be compared. Nothing has been imported.',
    status: 'WAITING_FOR_SNAPSHOT',
  },
  lost: {
    label: 'Lost Followers',
    summary:
      'Present in an earlier snapshot and absent from a later one. The source does not say why.',
    emptyTitle: 'No comparison yet',
    emptyBody:
      'This list needs two follower snapshots. Absence from the later snapshot is not treated as a manual unfollow.',
    status: 'WAITING_FOR_SNAPSHOT',
  },
  not_following_back: {
    label: 'Not Following Back',
    summary: 'In the latest following list, and not in the latest followers list.',
    emptyTitle: 'No following list yet',
    emptyBody: 'This comparison needs an imported following list and an imported followers list.',
    status: 'WAITING_FOR_SNAPSHOT',
  },
  not_followed_back: {
    label: "I Don't Follow Back",
    summary: 'In the latest followers list, and not in the latest following list.',
    emptyTitle: 'No follower list yet',
    emptyBody: 'This comparison needs an imported followers list and an imported following list.',
    status: 'WAITING_FOR_SNAPSHOT',
  },
  mutual: {
    label: 'Mutual Followers',
    summary: 'Present in both the latest followers list and the latest following list.',
    emptyTitle: 'No mutual list yet',
    emptyBody: 'Mutual accounts appear when both imported lists contain the same username.',
    status: 'WAITING_FOR_SNAPSHOT',
  },
};
