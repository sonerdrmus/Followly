import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { gradients, radius, spacing, type GradientName } from '@/theme';

type GradientSurfaceProps = {
  children: ReactNode;
  variant?: GradientName;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function GradientSurface({
  children,
  variant = 'brand',
  style,
  contentStyle,
}: GradientSurfaceProps) {
  const gradient = gradients[variant];

  return (
    <LinearGradient
      colors={gradient.colors}
      start={gradient.start}
      end={gradient.end}
      style={[styles.frame, style]}
    >
      <View style={[styles.content, contentStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
