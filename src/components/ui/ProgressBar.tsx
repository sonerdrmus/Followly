import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radius } from '@/theme';
import { clamp } from '@/utils/clamp';

type ProgressBarProps = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label = 'Progress' }: ProgressBarProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const clamped = clamp(value, 0, 100);

  useEffect(() => {
    progress.set(
      withTiming(clamped, {
        duration: reducedMotion ? 0 : motion.duration.slow,
      }),
    );
  }, [clamped, progress, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={styles.track}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
