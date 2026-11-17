import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Surface } from '@/components/ui/Surface';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

type AudienceVisualProps = {
  active: boolean;
};

const people = [
  { name: 'North Row', handle: 'sample.one', label: 'New', variant: 'success', ring: true },
  { name: 'West Lane', handle: 'sample.two', label: 'Mutual', variant: 'insight', ring: 'seen' },
  { name: 'East Gate', handle: 'sample.three', label: 'Left', variant: 'danger', ring: false },
] as const;

/** A still illustration of a comparison list, not a live follower list. */
export function AudienceVisual(_props: AudienceVisualProps) {
  return (
    <View style={styles.scene}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.stories}
      >
        {people.map((person) => (
          <View key={person.handle} style={styles.story}>
            <Avatar name={person.name} size="xl" ring={person.ring} />
            <Typography variant="caption" numberOfLines={1}>
              {person.handle}
            </Typography>
          </View>
        ))}
      </View>
      <Surface padding={0} style={styles.list}>
        {people.map((person, index) => (
          <View
            key={person.handle}
            style={[styles.row, index > 0 ? styles.rowBorder : null]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Avatar name={person.name} size="sm" />
            <View style={styles.copy}>
              <Typography variant="bodySmall" strong>
                {person.handle}
              </Typography>
              <Typography variant="caption" color={colors.textSecondary}>
                {person.name}
              </Typography>
            </View>
            <Badge label={person.label} variant={person.variant} />
          </View>
        ))}
      </Surface>
      <Typography variant="caption" color={colors.textMuted} style={styles.caption}>
        Illustration of a comparison, not a live follower list.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    gap: spacing.md,
  },
  stories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  story: {
    alignItems: 'center',
    gap: spacing.xs,
    width: 88,
  },
  list: {
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  copy: {
    flex: 1,
  },
  caption: {
    textAlign: 'center',
  },
});
