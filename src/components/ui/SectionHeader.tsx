import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Typography } from './Typography';
import { Touchable } from './Touchable';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  /** A text link on the right, such as "See all". */
  link?: { label: string; onPress: () => void; testID?: string };
};

export function SectionHeader({ title, subtitle, action, link }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Typography variant="title" accessibilityRole="header">
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color={colors.textSecondary}>
            {subtitle}
          </Typography>
        ) : null}
      </View>
      {action}
      {link ? (
        <Touchable
          accessibilityRole="link"
          onPress={link.onPress}
          hitSlop={10}
          testID={link.testID}
          style={({ pressed }) => (pressed ? styles.pressed : null)}
        >
          <Typography variant="bodySmall" color={colors.primary} strong>
            {link.label}
          </Typography>
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  pressed: {
    opacity: 0.5,
  },
});
