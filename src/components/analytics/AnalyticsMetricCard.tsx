import { StyleSheet, View } from 'react-native';

import { StatChange } from '@/components/analytics/StatChange';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamily, spacing } from '@/theme';
import type { AnalyticsMetric } from '@/types/analytics';
import { sourceLabels } from '@/types/provenance';

import { MetricInfoButton } from './MetricInfoTooltip';

type AnalyticsMetricCardProps = {
  metric: AnalyticsMetric;
  onInfo: (metricKey: string) => void;
};

/**
 * One line of an Insights table: the metric and its status on the left, the
 * figure and its change on the right.
 */
export function AnalyticsMetricCard({ metric, onInfo }: AnalyticsMetricCardProps) {
  const value = formatMetric(metric);
  const empty = metric.value === null;

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Typography variant="body" numberOfLines={1} style={styles.label}>
            {metric.label}
          </Typography>
          <MetricInfoButton metricKey={metric.key} onOpen={onInfo} />
        </View>
        <View style={styles.meta}>
          <DataReadinessBadge status={metric.availability} quiet />
          {metric.source ? (
            <Typography variant="caption" color={colors.textMuted} numberOfLines={1}>
              {sourceLabels[metric.source]}
            </Typography>
          ) : null}
        </View>
      </View>
      <View style={styles.figure}>
        <Typography
          variant="h2"
          color={empty ? colors.textMuted : colors.textPrimary}
          style={styles.value}
          accessibilityLabel={empty ? `${metric.label} unavailable` : `${metric.label} ${value}`}
        >
          {value}
        </Typography>
        {metric.changePercentage !== null ? <StatChange value={metric.changePercentage} /> : null}
      </View>
    </View>
  );
}

function formatMetric(metric: AnalyticsMetric): string {
  if (metric.value === null) {
    return '—';
  }
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    metric.value,
  );
  return metric.unit === 'percent' ? `${formatted}%` : formatted;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  label: {
    flexShrink: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacing.sm,
    rowGap: 2,
  },
  figure: {
    alignItems: 'flex-end',
    gap: 2,
  },
  value: {
    fontFamily: fontFamily.display,
  },
});
