import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, Path } from 'react-native-svg';

import { SunriseFill, SunriseStroke } from '@/components/analytics/SunriseDefs';
import { Badge } from '@/components/ui/Badge';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { useTranslation } from '@/i18n/use-translation';
import { colors, radius, spacing } from '@/theme';

type GrowthVisualProps = {
  active: boolean;
};

const line = 'M8 104 C 48 104, 52 78, 86 74 C 120 70, 128 96, 160 84 C 196 70, 200 36, 272 28';
const bars = [0.35, 0.5, 0.42, 0.68, 0.6, 0.85, 1];

/** A still illustration of an insights card. Nothing here is account data. */
export function GrowthVisual(_props: GrowthVisualProps) {
  const { t } = useTranslation();

  return (
    <View
      style={styles.scene}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Surface padding={spacing.lg} style={styles.card}>
        <View style={styles.head}>
          <View style={styles.headCopy}>
            <Typography variant="caption">{t('home.growthDetail')}</Typography>
            <Typography variant="h2">{t('home.growth')}</Typography>
          </View>
          <Badge label={t('onboarding.illustration')} />
        </View>
        <Svg width="100%" height={120} viewBox="0 0 280 128">
          <Defs>
            <SunriseStroke id="onb-stroke" />
            <SunriseFill id="onb-fill" />
          </Defs>
          {[32, 64, 96].map((y) => (
            <Line
              key={y}
              x1={8}
              x2={272}
              y1={y}
              y2={y}
              stroke={colors.border}
              strokeDasharray="3 5"
            />
          ))}
          <Path d={`${line} V 120 H 8 Z`} fill="url(#onb-fill)" />
          <Path
            d={line}
            stroke="url(#onb-stroke)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={272} cy={28} r={5} fill={colors.textPrimary} />
        </Svg>
      </Surface>
      <View style={styles.row}>
        <Surface padding={spacing.md} style={styles.mini}>
          <Typography variant="caption">Weekly shape</Typography>
          <View style={styles.bars}>
            {bars.map((value, index) => (
              <View
                key={index}
                style={[
                  styles.bar,
                  { height: 6 + value * 26 },
                  index === bars.length - 1 ? styles.barLast : null,
                ]}
              />
            ))}
          </View>
        </Surface>
        <Surface padding={spacing.md} style={styles.mini}>
          <Typography variant="caption">Sample shape</Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            Not account data.
          </Typography>
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    gap: spacing.sm,
  },
  card: {
    gap: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headCopy: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mini: {
    flex: 1,
    gap: spacing.sm,
    minHeight: 84,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 32,
  },
  bar: {
    width: 8,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceElevated,
  },
  barLast: {
    backgroundColor: colors.accent,
  },
});
