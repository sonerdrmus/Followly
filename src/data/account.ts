import type { AccountMetric, GrowthChartData, UserProfile } from '@/types/account';

/**
 * Signed-out UI state. There is no connected Instagram account and no sample
 * analytics. A later source can replace this module without changing the screens.
 */
export const currentProfile: UserProfile = {
  displayName: null,
  username: null,
  avatarUrl: null,
  connection: 'not_connected',
};

export const accountMetrics: readonly AccountMetric[] = [
  {
    id: 'followers',
    label: 'Followers',
    value: null,
    hint: 'Connect account',
    readiness: 'NOT_CONNECTED',
  },
  {
    id: 'following',
    label: 'Following',
    value: null,
    hint: 'Connect account',
    readiness: 'NOT_CONNECTED',
  },
  {
    id: 'engagementRate',
    label: 'Engagement Rate',
    value: null,
    hint: 'Awaiting data',
    readiness: 'NOT_CONNECTED',
  },
];

export const growthChart: GrowthChartData = {
  series: {},
  readiness: 'UNAVAILABLE',
};

export function displayMetricValue(metric: AccountMetric): string {
  if (metric.value === null) {
    return '—';
  }

  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    metric.value,
  );

  return metric.id === 'engagementRate' ? `${formatted}%` : formatted;
}
