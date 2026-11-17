import type { GrowthRange } from './account';
import type { DataProvenance, DataSourceKind } from './provenance';
import type { DataReadiness } from './readiness';

export type MetricUnit = 'count' | 'percent';

export type AnalyticsMetric = {
  key: string;
  label: string;
  value: number | null;
  previousValue: number | null;
  changePercentage: number | null;
  unit: MetricUnit;
  availability: DataReadiness;
  source: DataSourceKind | null;
  updatedAt: string | null;
  detail: string;
};

export type GrowthDataPoint = {
  date: string;
  value: number;
};

export type ContentPerformance = {
  id: string;
  thumbnailUrl: string | null;
  caption: string | null;
  publishedAt: string | null;
  likes: number | null;
  comments: number | null;
  reach: number | null;
  engagementRate: number | null;
  source: DataSourceKind | null;
};

export type AnalyticsDataset = {
  preview: boolean;
  provenance: DataProvenance;
  overview: readonly AnalyticsMetric[];
  growth: Record<GrowthRange, readonly GrowthDataPoint[]>;
  engagement: readonly AnalyticsMetric[];
  posts: readonly ContentPerformance[];
  reachSeries: Record<GrowthRange, readonly GrowthDataPoint[]>;
  impressionSeries: Record<GrowthRange, readonly GrowthDataPoint[]>;
  stories: readonly AnalyticsMetric[];
};
