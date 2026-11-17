import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Typography } from './Typography';

type BadgeVariant = 'success' | 'danger' | 'neutral' | 'premium' | 'insight';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
};

const palette: Record<BadgeVariant, { background: string; text: string }> = {
  success: { background: colors.successSoft, text: colors.success },
  danger: { background: colors.dangerSoft, text: colors.danger },
  neutral: { background: colors.surfaceRaised, text: colors.textPrimary },
  premium: { background: colors.accentSoft, text: '#FF7EB3' },
  insight: { background: colors.primarySoft, text: '#4DB5FF' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const tone = palette[variant];

  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <Typography variant="caption" color={tone.text} strong numberOfLines={1}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
});
