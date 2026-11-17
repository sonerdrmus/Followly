import { useTranslation } from '@/i18n/use-translation';
import type { AnalyticsMetric } from '@/types/analytics';

import { MetricTable } from './MetricTable';

type StoryInsightsSectionProps = {
  metrics: readonly AnalyticsMetric[];
  onInfo: (metricKey: string) => void;
};

export function StoryInsightsSection({ metrics, onInfo }: StoryInsightsSectionProps) {
  const { t } = useTranslation();
  return (
    <MetricTable
      title={t('analytics.stories')}
      description={t('analytics.storiesBody')}
      metrics={metrics}
      onInfo={onInfo}
    />
  );
}
