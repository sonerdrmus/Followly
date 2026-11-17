import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/ui/Typography';
import { colors, motion, spacing } from '@/theme';

import { BrandMark, Wordmark } from './BrandMark';

type BrandSplashProps = {
  onFinish: () => void;
  hold?: boolean;
};

/**
 * Instagram's launch screen: the mark in the middle, the name at the foot.
 * It holds while the app gets ready, then fades once.
 */
export function BrandSplash({ onFinish, hold = false }: BrandSplashProps) {
  const reducedMotion = Boolean(useReducedMotion());
  const insets = useSafeAreaInsets();
  const onFinishRef = useRef(onFinish);
  const [armed, setArmed] = useState(false);
  const overlay = useSharedValue(1);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  function finishSplash() {
    onFinishRef.current();
  }

  useEffect(() => {
    const wait = setTimeout(() => setArmed(true), reducedMotion ? 120 : 650);
    return () => clearTimeout(wait);
  }, [reducedMotion]);

  useEffect(() => {
    if (!armed || hold) {
      return;
    }
    if (reducedMotion) {
      onFinishRef.current();
      return;
    }
    overlay.set(
      withTiming(0, { duration: motion.duration.base }, (finished) => {
        if (finished) {
          runOnJS(finishSplash)();
        }
      }),
    );
  }, [armed, hold, overlay, reducedMotion]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));

  return (
    <Animated.View
      accessibilityRole="header"
      accessibilityLabel="Followly"
      style={[styles.overlay, overlayStyle]}
    >
      <View style={styles.center}>
        <BrandMark size={84} />
      </View>
      <View style={[styles.foot, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Typography variant="caption" color={colors.textMuted}>
          Your Instagram growth, understood.
        </Typography>
        <Wordmark size={24} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foot: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
