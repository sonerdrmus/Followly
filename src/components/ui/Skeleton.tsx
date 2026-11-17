import { useEffect } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme';

type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radiusSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 16,
  radiusSize = radius.sm,
  style,
}: SkeletonProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (reducedMotion) {
      opacity.set(0.7);
      return;
    }
    opacity.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [opacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.bone, { width, height, borderRadius: radiusSize }, animatedStyle, style]}
    />
  );
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.cardElevated,
  },
});
