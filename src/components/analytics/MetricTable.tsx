import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { Divider } from '@/components/ui/Divider';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import type { AnalyticsMetric } from '@/types/analytics';

import { AnalyticsMetricCard } from './AnalyticsMetricCard';

type MetricTableProps = {
  title: string;
  description?: string;
  metrics: readonly AnalyticsMetric[];
  onInfo: (metricKey: string) => void;
};

export function MetricTable({ title, description, metrics, onInfo }: MetricTableProps) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} />
      {description ? (
        <Typography variant="caption" color={colors.textSecondary}>
          {description}
        </Typography>
      ) : null}
      <Surface padding={0}>
        {metrics.map((metric, index) => (
          <Fragment key={metric.key}>
            {index > 0 ? <Divider inset /> : null}
            <AnalyticsMetricCard metric={metric} onInfo={onInfo} />
          </Fragment>
        ))}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm + 2,
  },
});
