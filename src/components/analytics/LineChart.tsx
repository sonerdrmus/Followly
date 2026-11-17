import { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Polyline } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { ChartPoint } from '@/types/chart';

import { plotPoints } from './chart-geometry';
import { SunriseStroke } from './SunriseDefs';

type LineChartProps = {
  data: readonly ChartPoint[];
  height?: number;
  /** A single colour. Omit for the sunrise stroke. */
  color?: string;
};

export function LineChart({ data, height = 168, color }: LineChartProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const strokeId = `${useId().replace(/:/g, '')}-s`;
  const points = plotPoints(data, width, height, spacing.sm);
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');

  if (data.length < 2) {
    return <Typography variant="caption">{t('analytics.lineEmpty')}</Typography>;
  }

  return (
    <View
      accessibilityLabel={t('analytics.lineChart', { n: data.length })}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <>
          <Svg width={width} height={height}>
            {color ? null : (
              <Defs>
                <SunriseStroke id={strokeId} />
              </Defs>
            )}
            <Polyline
              points={polyline}
              fill="none"
              stroke={color ?? `url(#${strokeId})`}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>
          <View style={styles.labels}>
            {data.map((point) => (
              <Typography key={point.label} variant="caption" color={colors.textMuted}>
                {point.label}
              </Typography>
            ))}
          </View>
        </>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
