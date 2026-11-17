import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, gradients } from '@/theme';

type GradientRingProps = {
  /** Outer diameter, ring included. */
  size: number;
  /** `story` is the sunrise ring, `seen` a quiet grey ring, `none` no ring. */
  tone?: 'story' | 'seen' | 'none';
  thickness?: number;
  /** Gap between the ring and the content, filled with the canvas colour. */
  gap?: number;
  gapColor?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * The story ring. Instagram's most recognisable shape, used in Followly to
 * mark the things that are waiting for you.
 */
export function GradientRing({
  size,
  tone = 'story',
  thickness = 2,
  gap = 2,
  gapColor = colors.background,
  children,
  style,
}: GradientRingProps) {
  const inner = size - thickness * 2;
  const content = inner - gap * 2;

  const core = (
    <View
      style={[
        styles.center,
        { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: gapColor },
      ]}
    >
      <View
        style={[
          styles.center,
          styles.clip,
          { width: content, height: content, borderRadius: content / 2 },
        ]}
      >
        {children}
      </View>
    </View>
  );

  if (tone === 'none') {
    return <View style={[styles.center, { width: size, height: size }, style]}>{core}</View>;
  }

  if (tone === 'seen') {
    return (
      <View
        style={[
          styles.center,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.borderStrong,
          },
          style,
        ]}
      >
        {core}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradients.ring.colors}
      start={gradients.ring.start}
      end={gradients.ring.end}
      style={[styles.center, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {core}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clip: {
    overflow: 'hidden',
  },
});
