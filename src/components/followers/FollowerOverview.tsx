import { StyleSheet, View } from 'react-native';

import { StatChange } from '@/components/analytics/StatChange';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamily, spacing } from '@/theme';
import type { FollowerTotals } from '@/types/follower';

type FollowerOverviewProps = {
  totals: FollowerTotals;
  sourceLabel: string;
};

const items = [
  { key: 'followers', label: 'Followers', current: 'followers', previous: 'previousFollowers' },
  { key: 'following', label: 'Following', current: 'following', previous: 'previousFollowing' },
  { key: 'mutual', label: 'Mutual', current: 'mutual', previous: 'previousMutual' },
] as const;

/** The profile stat strip: three numbers, each with its label underneath. */
export function FollowerOverview({ totals, sourceLabel }: FollowerOverviewProps) {
  const number = new Intl.NumberFormat('en-US');
  const anyValue = items.some((item) => totals[item.current] !== null);

  return (
    <View style={styles.section}>
      <View style={styles.strip}>
        {items.map((item) => {
          const current = totals[item.current];
          const previous = totals[item.previous];
          const change = current !== null && previous !== null ? current - previous : null;
          return (
            <View
              key={item.key}
              style={styles.metric}
              accessible
              accessibilityLabel={`${item.label}, ${current === null ? 'unavailable' : current}`}
            >
              <Typography
                variant="h2"
                color={current === null ? colors.textMuted : colors.textPrimary}
                style={styles.value}
              >
                {current === null ? '—' : number.format(current)}
              </Typography>
              <Typography variant="bodySmall" color={colors.textPrimary}>
                {item.label}
              </Typography>
              {change !== null && change !== 0 ? (
                <StatChange value={change} precision={0} suffix="" />
              ) : null}
            </View>
          );
        })}
      </View>
      <Typography variant="caption" color={colors.textMuted} style={styles.source}>
        {anyValue ? sourceLabel : 'Totals are unavailable until an account or import exists.'}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  strip: {
    flexDirection: 'row',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  value: {
    fontFamily: fontFamily.display,
  },
  source: {
    textAlign: 'center',
  },
});
