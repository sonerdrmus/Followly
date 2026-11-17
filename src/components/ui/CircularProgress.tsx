import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors, motion } from '@/theme';
import { clamp } from '@/utils/clamp';

import { Typography } from './Typography';

type CircularProgressProps = {
  value: number;
  size?: number;
  label?: string;
  showValue?: boolean;
};

export function CircularProgress({
  value,
  size = 96,
  label = 'Progress',
  showValue = true,
}: CircularProgressProps) {
  const reducedMotion = useReducedMotion();
  const clamped = clamp(value, 0, 100);
  const shown = useAnimatedNumber(clamped, reducedMotion);
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceRaised}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - shown / 100)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showValue ? (
        <View style={styles.value}>
          <Typography variant="h3">{Math.round(shown)}</Typography>
        </View>
      ) : null}
    </View>
  );
}

function useAnimatedNumber(target: number, reducedMotion: boolean) {
  const [shown, setShown] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const from = fromRef.current;
    const start = globalThis.performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / motion.duration.slow);
      const eased = 1 - (1 - progress) ** 3;
      const next = from + (target - from) * eased;
      fromRef.current = next;
      setShown(next);
      if (progress < 1) {
        frame = globalThis.requestAnimationFrame(tick);
      }
    };
    frame = globalThis.requestAnimationFrame(tick);
    return () => globalThis.cancelAnimationFrame(frame);
  }, [reducedMotion, target]);

  return reducedMotion ? target : shown;
}

const styles = StyleSheet.create({
  value: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
