import { useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, spacing } from '@/theme';
import type { ChartPoint } from '@/types/chart';

import { areaPath, linePath, plotPoints } from './chart-geometry';
import { SunriseFill, SunriseStroke } from './SunriseDefs';

type AreaChartProps = {
  data: readonly ChartPoint[];
  height?: number;
  /** A single colour. Omit for the sunrise stroke. */
  color?: string;
};

export function AreaChart({ data, height = 168, color }: AreaChartProps) {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const baseId = useId().replace(/:/g, '');
  const points = plotPoints(data, width, height, spacing.md);
  const baseline = height - spacing.md;
  const sunrise = color === undefined;

  if (data.length < 2) {
    return <Typography variant="caption">{t('analytics.areaEmpty')}</Typography>;
  }

  return (
    <View
      accessibilityLabel={t('analytics.areaChart', { n: data.length })}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <>
          <Svg width={width} height={height}>
            <Defs>
              {sunrise ? (
                <>
                  <SunriseStroke id={`${baseId}-s`} />
                  <SunriseFill id={`${baseId}-f`} />
                </>
              ) : (
                <LinearGradient id={`${baseId}-f`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={color} stopOpacity={0.3} />
                  <Stop offset="1" stopColor={color} stopOpacity={0} />
                </LinearGradient>
              )}
            </Defs>
            <Path d={areaPath(points, baseline)} fill={`url(#${baseId}-f)`} />
            <Path
              d={linePath(points)}
              stroke={sunrise ? `url(#${baseId}-s)` : color}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
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
