import { LinearGradient } from 'expo-linear-gradient';
import { cloneElement, type ReactElement, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/hooks/use-press-scale';
import { colors, gradients, icon, radius, spacing } from '@/theme';

import { Typography } from './Typography';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'premium';
type ButtonSize = 'md' | 'sm';
type ButtonShape = 'rounded' | 'pill';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: ReactElement<IconProps>;
  trailing?: ReactElement<IconProps>;
  style?: StyleProp<ViewStyle>;
};

const labelColor: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  secondary: colors.textPrimary,
  outline: colors.textPrimary,
  ghost: colors.textSecondary,
  destructive: colors.danger,
  premium: '#FFFFFF',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  loading = false,
  disabled = false,
  fullWidth = false,
  leading,
  trailing,
  style,
  onPress,
  ...rest
}: ButtonProps) {
  const inactive = disabled || loading;
  const press = usePressScale(inactive);
  const color = labelColor[variant];
  const corner = shape === 'pill' ? radius.full : size === 'sm' ? radius.sm : radius.md;

  return (
    <Animated.View style={[fullWidth ? styles.fullWidth : null, press.animatedStyle, style]}>
      <Pressable
        {...rest}
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        hitSlop={size === 'sm' ? 6 : 0}
        style={[
          styles.base,
          styles[variant],
          styles[size],
          { borderRadius: corner },
          inactive ? styles.inactive : null,
        ]}
      >
        {variant === 'premium' ? (
          <LinearGradient
            colors={gradients.brand.colors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[StyleSheet.absoluteFill, { borderRadius: corner }]}
          />
        ) : null}
        {loading ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <View style={styles.row}>
            {tint(leading, color)}
            <Typography
              variant={size === 'sm' ? 'label' : 'bodySmall'}
              color={color}
              strong
              numberOfLines={1}
            >
              {label}
            </Typography>
            {tint(trailing, color)}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function tint(node: ReactElement<IconProps> | undefined, color: string): ReactNode {
  if (!node) {
    return null;
  }
  return cloneElement(node, { color, size: icon.size.sm, strokeWidth: 2 });
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sm: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
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
  destructive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  premium: {
    backgroundColor: colors.accent,
    borderColor: 'transparent',
  },
  inactive: {
    opacity: 0.45,
  },
});
