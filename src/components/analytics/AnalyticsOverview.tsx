import { useTranslation } from '@/i18n/use-translation';
import type { AnalyticsMetric } from '@/types/analytics';

import { MetricTable } from './MetricTable';

type AnalyticsOverviewProps = {
  metrics: readonly AnalyticsMetric[];
  onInfo: (metricKey: string) => void;
};

export function AnalyticsOverview({ metrics, onInfo }: AnalyticsOverviewProps) {
  const { t } = useTranslation();
  return <MetricTable title={t('analytics.overview')} metrics={metrics} onInfo={onInfo} />;
}
