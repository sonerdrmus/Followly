import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme';

/**
 * Press feedback in the Instagram manner: the control dims while held and
 * returns as soon as the finger lifts. No scaling.
 */
export function usePressScale(disabled = false) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const onPressIn = () => {
    if (disabled) {
      return;
    }
    opacity.set(
      reducedMotion
        ? motion.pressOpacity
        : withTiming(motion.pressOpacity, { duration: motion.duration.press }),
    );
  };

  const onPressOut = () => {
    opacity.set(reducedMotion ? 1 : withTiming(1, { duration: motion.duration.fast }));
  };

  return { animatedStyle, onPressIn, onPressOut };
}
