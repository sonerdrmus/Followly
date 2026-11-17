import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AreaChart } from '@/components/analytics/AreaChart';
import { TimeRangeSelector } from '@/components/analytics/TimeRangeSelector';
import { DataReadinessBadge } from '@/components/status/DataReadinessBadge';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Surface } from '@/components/ui/Surface';
import { DashedRule } from '@/components/ui/DashedRule';
import { Typography } from '@/components/ui/Typography';
import type { MessageKey } from '@/i18n';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';
import { growthRanges, type GrowthRange, type GrowthSeries } from '@/types/account';
import type { DataReadiness } from '@/types/readiness';

type GrowthOverviewProps = {
  series: GrowthSeries;
  readiness: DataReadiness;
  initialRange?: GrowthRange;
};

const rangeCopy: Record<GrowthRange, MessageKey> = {
  '7D': 'analytics.range7D',
  '30D': 'analytics.range30D',
  '90D': 'analytics.range90D',
  '1Y': 'analytics.range1Y',
};

const gridRows = ['20%', '50%', '80%'] as const;

export function GrowthOverview({ series, readiness, initialRange = '30D' }: GrowthOverviewProps) {
  const { t } = useTranslation();
  const [range, setRange] = useState<GrowthRange>(initialRange);
  const points = series[range] ?? [];
  const hasSeries = points.length >= 2;

  return (
    <View style={styles.section}>
      <SectionHeader
        title={t('home.growth')}
        subtitle={t('home.growthDetail')}
        action={<DataReadinessBadge status={readiness} />}
      />
      <TimeRangeSelector
        options={growthRanges}
        value={range}
        onChange={(value) => {
          if (isGrowthRange(value)) {
            setRange(value);
          }
        }}
      />
      <Surface style={styles.card}>
        {hasSeries ? (
          <AreaChart data={points} />
        ) : (
          <View
            accessibilityRole="text"
            accessibilityLabel={t('home.noHistory', { range: t(rangeCopy[range]) })}
            style={styles.empty}
          >
            <View accessibilityElementsHidden style={styles.plot}>
              {gridRows.map((top) => (
                <DashedRule key={top} top={top} />
              ))}
              <View style={styles.baseline} />
              <Typography variant="label" color={colors.textSecondary}>
                {t('home.waitingHistory')}
              </Typography>
            </View>
            <Typography variant="caption" color={colors.textSecondary}>
              {t('home.historyEmpty', { range: t(rangeCopy[range]) })}
            </Typography>
          </View>
        )}
      </Surface>
    </View>
  );
}

function isGrowthRange(value: string): value is GrowthRange {
  return (growthRanges as readonly string[]).includes(value);
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm + 2,
  },
  card: {
    gap: spacing.md,
  },
  empty: {
    gap: spacing.md,
  },
  plot: {
    height: 132,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
  },
});
