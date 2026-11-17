import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients, radius, spacing } from '@/theme';

type TonalCardProps = {
  children: ReactNode;
  tone?: 'hero' | 'insight';
  style?: StyleProp<ViewStyle>;
};

export function TonalCard({ children, tone = 'hero', style }: TonalCardProps) {
  const gradient = tone === 'hero' ? gradients.hero : gradients.insight;

  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
    padding: spacing.lg,
    gap: spacing.md,
  },
});
