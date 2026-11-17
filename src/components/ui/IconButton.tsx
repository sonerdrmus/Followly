import { cloneElement, type ReactElement } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/use-press-scale';
import { colors, icon, radius } from '@/theme';

type IconProps = { color?: string; size?: number; strokeWidth?: number };
type IconButtonVariant = 'surface' | 'outline' | 'ghost' | 'bare';

type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  icon: ReactElement<IconProps>;
  accessibilityLabel: string;
  variant?: IconButtonVariant;
  /** Shows a small unread dot in the top-right corner. */
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
};

const iconColor: Record<IconButtonVariant, string> = {
  surface: colors.textPrimary,
  outline: colors.textPrimary,
  ghost: colors.textSecondary,
  bare: colors.textPrimary,
};

export function IconButton({
  icon: glyph,
  accessibilityLabel,
  variant = 'surface',
  dot = false,
  disabled = false,
  style,
  ...rest
}: IconButtonProps) {
  const press = usePressScale(Boolean(disabled));

  return (
    <Animated.View style={[press.animatedStyle, style]}>
      <Pressable
        {...rest}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: Boolean(disabled) }}
        disabled={disabled}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.base, styles[variant], disabled ? styles.disabled : null]}
      >
        {cloneElement(glyph, {
          color: iconColor[variant],
          size: variant === 'bare' ? icon.size.lg : icon.size.md,
          strokeWidth: variant === 'bare' ? 1.9 : icon.stroke,
        })}
        {dot ? <View style={styles.dot} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  surface: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.surfaceRaised,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  bare: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.4,
  },
  dot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
});
