import type { ChartPoint } from './chart';
import type { DataReadiness } from './readiness';

export type InstagramConnectionStatus = 'not_connected' | 'connected';

export type UserProfile = {
  displayName: string | null;
  username: string | null;
  avatarUrl: string | null;
  connection: InstagramConnectionStatus;
};

export type AccountMetricId = 'followers' | 'following' | 'engagementRate';

export type AccountMetric = {
  id: AccountMetricId;
  label: string;
  value: number | null;
  hint: string;
  readiness: DataReadiness;
};

export const growthRanges = ['7D', '30D', '90D', '1Y'] as const;

export type GrowthRange = (typeof growthRanges)[number];

export type GrowthSeries = Partial<Record<GrowthRange, readonly ChartPoint[]>>;

export type GrowthChartData = {
  series: GrowthSeries;
  readiness: DataReadiness;
};

export type FeatureReadiness = {
  id: string;
  readiness: DataReadiness;
};
