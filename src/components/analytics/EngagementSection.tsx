import { useTranslation } from '@/i18n/use-translation';
import type { AnalyticsMetric } from '@/types/analytics';

import { MetricTable } from './MetricTable';

type EngagementSectionProps = {
  metrics: readonly AnalyticsMetric[];
  onInfo: (metricKey: string) => void;
};

export function EngagementSection({ metrics, onInfo }: EngagementSectionProps) {
  const { t } = useTranslation();
  return (
    <MetricTable
      title={t('analytics.engagement')}
      description={t('analytics.engagementBody')}
      metrics={metrics}
      onInfo={onInfo}
    />
  );
}
