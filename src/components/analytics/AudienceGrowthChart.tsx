import { useCallback, useId, useRef, useState, type ElementRef } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, Path } from 'react-native-svg';

import { Skeleton } from '@/components/ui/Skeleton';
import { DashedRule } from '@/components/ui/DashedRule';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamily, radius, spacing } from '@/theme';
import type { GrowthDataPoint } from '@/types/analytics';
import type { ChartPoint } from '@/types/chart';
import { formatChartDate } from '@/utils/format-date';

import { areaPath, linePath, plotPoints } from './chart-geometry';
import { SunriseFill, SunriseStroke } from './SunriseDefs';

type AudienceGrowthChartProps = {
  points: readonly GrowthDataPoint[];
  loading?: boolean;
  emptyMessage: string;
  sample?: boolean;
};

const HEIGHT = 168;
const PAD = spacing.md;
const gridRows = [0.2, 0.5, 0.8];

export function AudienceGrowthChart({
  points,
  loading = false,
  emptyMessage,
  sample = false,
}: AudienceGrowthChartProps) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<{ key: string; index: number } | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const bindWidth = useCallback((node: ElementRef<typeof View> | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!node || Platform.OS !== 'web' || typeof ResizeObserver === 'undefined') {
      return;
    }
    const element = node as unknown as HTMLElement;
    const nextObserver = new ResizeObserver(() => {
      const next = element.clientWidth - spacing.lg * 2;
      if (next > 0) {
        setWidth((current) => (current === next ? current : next));
      }
    });
    nextObserver.observe(element);
    observer.current = nextObserver;
  }, []);
  const baseId = useId().replace(/:/g, '');
  const strokeId = `${baseId}-stroke`;
  const fillId = `${baseId}-fill`;
  const chartPoints: ChartPoint[] = points.map((point) => ({
    label: formatChartDate(point.date),
    value: point.value,
  }));
  const key = points.map((point) => point.date).join('|');
  const plotted = plotPoints(chartPoints, width, HEIGHT, PAD);
  const activeIndex = selected?.key === key ? selected.index : points.length - 1;
  const active = plotted[activeIndex] ?? null;

  if (loading) {
    return <Skeleton height={HEIGHT + 64} radiusSize={radius.xl} />;
  }

  if (points.length < 2) {
    return (
      <View accessibilityRole="text" accessibilityLabel={emptyMessage} style={styles.frame}>
        <View accessibilityElementsHidden style={styles.plot}>
          {gridRows.map((row) => (
            <DashedRule key={row} top={`${row * 100}%`} />
          ))}
          <View style={styles.baseline} />
          <View style={styles.waiting}>
            <Typography variant="label" color={colors.textSecondary}>
              Waiting for data
            </Typography>
          </View>
        </View>
        <Typography variant="caption" color={colors.textSecondary}>
          {emptyMessage}
        </Typography>
      </View>
    );
  }

  const first = chartPoints[0];
  const last = chartPoints[chartPoints.length - 1];

  return (
    <View
      ref={bindWidth}
      accessibilityLabel={
        sample ? `Sample chart, ${points.length} points` : `Chart, ${points.length} points`
      }
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width - spacing.lg * 2;
        if (next > 0) {
          setWidth((current) => (current === next ? current : next));
        }
      }}
      style={styles.frame}
    >
      {active ? (
        <View style={styles.readout}>
          <Typography variant="stat" style={styles.readoutValue}>
            {new Intl.NumberFormat('en-US').format(active.value)}
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            {active.label}
            {sample ? ' · sample' : ''}
          </Typography>
        </View>
      ) : null}
      {width > 0 ? (
        <Pressable
          accessibilityHint="Shows the value for the nearest point"
          onPress={(event) => {
            const x = event.nativeEvent.locationX;
            let nearest = 0;
            let best = Number.POSITIVE_INFINITY;
            plotted.forEach((point, index) => {
              const distance = Math.abs(point.x - x);
              if (distance < best) {
                best = distance;
                nearest = index;
              }
            });
            setSelected({ key, index: nearest });
          }}
        >
          <Svg width={width} height={HEIGHT}>
            <Defs>
              <SunriseStroke id={strokeId} />
              <SunriseFill id={fillId} />
            </Defs>
            {gridRows.map((row) => (
              <Line
                key={row}
                x1={0}
                x2={width}
                y1={HEIGHT * row}
                y2={HEIGHT * row}
                stroke={colors.border}
                strokeDasharray="3 5"
              />
            ))}
            <Path d={areaPath(plotted, HEIGHT - PAD)} fill={`url(#${fillId})`} />
            <Path
              d={linePath(plotted)}
              stroke={`url(#${strokeId})`}
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {active ? (
              <>
                <Line
                  x1={active.x}
                  x2={active.x}
                  y1={0}
                  y2={HEIGHT}
                  stroke={colors.borderStrong}
                  strokeWidth={1}
                />
                <Circle
                  cx={active.x}
                  cy={active.y}
                  r={6}
                  fill={colors.textPrimary}
                  stroke={colors.surface}
                  strokeWidth={3}
                />
              </>
            ) : null}
          </Svg>
          <View style={styles.labels}>
            <Typography variant="caption" color={colors.textMuted}>
              {first?.label}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              Tap to read a point
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {last?.label}
            </Typography>
          </View>
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  readout: {
    gap: 2,
  },
  readoutValue: {
    fontFamily: fontFamily.displayBold,
  },
  plot: {
    height: 132,
    overflow: 'hidden',
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
  waiting: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: { height: HEIGHT },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
});
