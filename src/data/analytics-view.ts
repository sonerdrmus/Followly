import { analyticsFixture } from '@/fixtures/analytics';
import type { GrowthRange } from '@/types/account';
import type { AnalyticsDataset, AnalyticsMetric } from '@/types/analytics';
import type { DataReadiness } from '@/types/readiness';

function unavailable(
  key: string,
  label: string,
  unit: AnalyticsMetric['unit'],
  availability: DataReadiness,
  detail: string,
): AnalyticsMetric {
  return {
    key,
    label,
    value: null,
    previousValue: null,
    changePercentage: null,
    unit,
    availability,
    source: null,
    updatedAt: null,
    detail,
  };
}

const emptySeries: Record<GrowthRange, readonly []> = {
  '7D': [],
  '30D': [],
  '90D': [],
  '1Y': [],
};

const emptyAnalytics: AnalyticsDataset = {
  preview: false,
  provenance: {
    source: null,
    updatedAt: null,
    comparisonPeriod: null,
    availability: 'NOT_CONNECTED',
    note: 'No Instagram account is connected. Metrics stay empty until a supported source provides them.',
  },
  overview: [
    unavailable(
      'followers',
      'Followers',
      'count',
      'NOT_CONNECTED',
      'Connect an account before a follower total can appear.',
    ),
    unavailable(
      'following',
      'Following',
      'count',
      'NOT_CONNECTED',
      'Connect an account before a following total can appear.',
    ),
    unavailable(
      'engagementRate',
      'Engagement Rate',
      'percent',
      'NOT_CONNECTED',
      'No rate is available.',
    ),
    unavailable(
      'reach',
      'Reach',
      'count',
      'LIMITED_ACCESS',
      'Reach depends on Instagram permissions and the account type.',
    ),
    unavailable(
      'impressions',
      'Impressions',
      'count',
      'LIMITED_ACCESS',
      'Impressions depend on Instagram permissions and the account type.',
    ),
    unavailable(
      'profileVisits',
      'Profile Visits',
      'count',
      'LIMITED_ACCESS',
      'Profile visits are an Insights field this build does not have.',
    ),
  ],
  growth: emptySeries,
  engagement: [
    unavailable(
      'likes',
      'Likes',
      'count',
      'LIMITED_ACCESS',
      'Likes appear when Insights provides them.',
    ),
    unavailable(
      'comments',
      'Comments',
      'count',
      'LIMITED_ACCESS',
      'Comments appear when Insights provides them.',
    ),
    unavailable(
      'engagementRate',
      'Engagement Rate',
      'percent',
      'NOT_CONNECTED',
      'No rate is available.',
    ),
    unavailable(
      'interactions',
      'Interactions',
      'count',
      'LIMITED_ACCESS',
      'Interactions appear when the source provides that total.',
    ),
  ],
  posts: [],
  reachSeries: emptySeries,
  impressionSeries: emptySeries,
  stories: [
    unavailable('storyViews', 'Views', 'count', 'LIMITED_ACCESS', 'Story views are not available.'),
    unavailable('storyReach', 'Reach', 'count', 'LIMITED_ACCESS', 'Story reach is not available.'),
    unavailable(
      'storyInteractions',
      'Interactions',
      'count',
      'LIMITED_ACCESS',
      'Story interactions are not available.',
    ),
    unavailable(
      'storyReplies',
      'Replies',
      'count',
      'LIMITED_ACCESS',
      'Story replies are not available.',
    ),
    unavailable('storyExits', 'Exits', 'count', 'LIMITED_ACCESS', 'Story exits are not available.'),
  ],
};

export function analyticsDataset(preview: boolean): AnalyticsDataset {
  return preview ? analyticsFixture : emptyAnalytics;
}
