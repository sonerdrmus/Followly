import { changePercentage } from '@/utils/change-percentage';
import type { GrowthRange } from '@/types/account';
import type {
  AnalyticsDataset,
  AnalyticsMetric,
  ContentPerformance,
  GrowthDataPoint,
} from '@/types/analytics';
import type { DataReadiness } from '@/types/readiness';

/**
 * Labeled sample metrics for chart and card interaction.
 * Nothing in this file is an Instagram account result.
 */
const updatedAt = '2026-03-08T12:00:00.000Z';
const source = 'development_fixture' as const;

function metric(
  key: string,
  label: string,
  value: number | null,
  previousValue: number | null,
  unit: AnalyticsMetric['unit'],
  availability: DataReadiness,
  detail: string,
): AnalyticsMetric {
  return {
    key,
    label,
    value,
    previousValue,
    changePercentage: changePercentage(value, previousValue),
    unit,
    availability,
    source: value === null ? null : source,
    updatedAt: value === null ? null : updatedAt,
    detail,
  };
}

function series(values: readonly number[], startDay: number): readonly GrowthDataPoint[] {
  return values.map((value, index) => ({
    date: new Date(Date.UTC(2026, 2, startDay + index)).toISOString(),
    value,
  }));
}

const growth: Record<GrowthRange, readonly GrowthDataPoint[]> = {
  '7D': series([10, 10, 11, 11, 12, 12, 14], 2),
  '30D': series([8, 9, 9, 11, 12, 14], 1),
  '90D': series([6, 7, 8, 9, 11, 14], 1),
  '1Y': series([4, 5, 6, 8, 10, 14], 1),
};

const reachSeries: Record<GrowthRange, readonly GrowthDataPoint[]> = {
  '7D': series([40, 42, 38, 50, 47, 55, 52], 2),
  '30D': series([30, 36, 33, 44, 49, 52], 1),
  '90D': series([22, 28, 31, 29, 40, 52], 1),
  '1Y': series([12, 18, 24, 30, 41, 52], 1),
};

const impressionSeries: Record<GrowthRange, readonly GrowthDataPoint[]> = {
  '7D': series([90, 110, 96, 140, 128, 160, 150], 2),
  '30D': series([70, 88, 92, 120, 136, 150], 1),
  '90D': series([48, 66, 80, 74, 110, 150], 1),
  '1Y': series([20, 40, 55, 78, 104, 150], 1),
};

const posts: readonly ContentPerformance[] = [
  {
    id: 'sample-post-1',
    thumbnailUrl: null,
    caption: 'Sample caption one. This is not a published Instagram post.',
    publishedAt: '2026-03-07T15:00:00.000Z',
    likes: 24,
    comments: 3,
    reach: 180,
    engagementRate: 4.2,
    source,
  },
  {
    id: 'sample-post-2',
    thumbnailUrl: null,
    caption: 'Sample caption two, with a supplied like count and no reach.',
    publishedAt: '2026-03-04T15:00:00.000Z',
    likes: 11,
    comments: 1,
    reach: null,
    engagementRate: 2.1,
    source,
  },
  {
    id: 'sample-post-3',
    thumbnailUrl: null,
    caption: null,
    publishedAt: '2026-02-26T15:00:00.000Z',
    likes: 40,
    comments: 6,
    reach: 260,
    engagementRate: 6.4,
    source,
  },
  {
    id: 'sample-post-4',
    thumbnailUrl: null,
    caption: 'Sample caption four. Comments were not included by the source.',
    publishedAt: '2026-03-01T15:00:00.000Z',
    likes: 8,
    comments: null,
    reach: 90,
    engagementRate: null,
    source,
  },
];

export const analyticsFixture: AnalyticsDataset = {
  preview: true,
  provenance: {
    source,
    updatedAt,
    comparisonPeriod: 'Sample window ending Mar 8, 2026. Not your account.',
    availability: 'READY',
    note: 'Development fixture. Overview, charts, posts, and story rows are sample values for interaction testing. They are not Instagram Insights.',
  },
  overview: [
    metric('followers', 'Followers', 14, 12, 'count', 'READY', 'Sample follower total.'),
    metric('following', 'Following', 8, 8, 'count', 'READY', 'Sample following total.'),
    metric(
      'engagementRate',
      'Engagement Rate',
      2.4,
      2.1,
      'percent',
      'READY',
      'Rate supplied by the fixture, not calculated from a hidden denominator.',
    ),
    metric('reach', 'Reach', 52, 47, 'count', 'READY', 'Sample accounts reached.'),
    metric(
      'impressions',
      'Impressions',
      150,
      128,
      'count',
      'READY',
      'Sample impressions. Not derived from reach.',
    ),
    metric(
      'profileVisits',
      'Profile Visits',
      9,
      null,
      'count',
      'READY',
      'A current sample value with no previous value, so no change is shown.',
    ),
  ],
  growth,
  engagement: [
    metric('likes', 'Likes', 83, 70, 'count', 'READY', 'Supplied like total.'),
    metric('comments', 'Comments', 10, 12, 'count', 'READY', 'Supplied comment total.'),
    metric('engagementRate', 'Engagement Rate', 2.4, 2.1, 'percent', 'READY', 'Supplied rate.'),
    metric(
      'interactions',
      'Interactions',
      120,
      100,
      'count',
      'READY',
      'Supplied interaction total. It is not the sum of the like and comment rows.',
    ),
  ],
  posts,
  reachSeries,
  impressionSeries,
  stories: [
    metric('storyViews', 'Views', 64, 58, 'count', 'READY', 'Supplied story views.'),
    metric('storyReach', 'Reach', 40, 36, 'count', 'READY', 'Supplied story reach.'),
    metric(
      'storyInteractions',
      'Interactions',
      15,
      null,
      'count',
      'READY',
      'Supplied story interactions.',
    ),
    metric('storyReplies', 'Replies', 2, 2, 'count', 'READY', 'Supplied replies.'),
    metric(
      'storyExits',
      'Exits',
      null,
      null,
      'count',
      'LIMITED_ACCESS',
      'This sample source does not include story exits.',
    ),
  ],
};
