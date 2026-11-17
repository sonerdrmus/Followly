import { cloneElement, type ReactElement, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Typography } from './Typography';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type EmptyStateProps = {
  icon?: ReactElement<IconProps>;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Instagram's empty state: an outlined circle, a short title, one sentence. */
export function EmptyState({ icon: glyph, title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      {glyph ? (
        <View style={styles.circle}>
          {cloneElement(glyph, { color: colors.textPrimary, size: 30, strokeWidth: 1.5 })}
        </View>
      ) : null}
      <Typography variant="h2" style={styles.center}>
        {title}
      </Typography>
      <Typography variant="bodySmall" color={colors.textSecondary} style={styles.center}>
        {description}
      </Typography>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  center: {
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});
