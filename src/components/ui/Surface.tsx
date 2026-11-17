import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/use-press-scale';
import { colors, radius, spacing } from '@/theme';

type SurfaceVariant = 'default' | 'elevated' | 'outlined';

type SurfaceProps = {
  children: ReactNode;
  variant?: SurfaceVariant;
  onPress?: () => void;
  padding?: number;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Surface({
  children,
  variant = 'default',
  onPress,
  padding = spacing.lg,
  accessibilityLabel,
  testID,
  style,
}: SurfaceProps) {
  const press = usePressScale(!onPress);
  const bodyStyle = [styles.base, styles[variant], { padding }, style];

  if (!onPress) {
    return (
      <View testID={testID} style={bodyStyle}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={press.animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={bodyStyle}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.borderStrong,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
  },
});
