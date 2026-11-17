import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors, fontFamily, radius } from '@/theme';

import { GradientRing } from './GradientRing';
import { Typography } from './Typography';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

type AvatarProps = {
  name: string;
  source?: string;
  size?: AvatarSize;
  online?: boolean;
  /** `true` or `story` draws the sunrise ring, `seen` a grey ring. */
  ring?: boolean | 'story' | 'seen';
};

const dimensions: Record<AvatarSize, number> = {
  xs: 26,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
  xxl: 88,
};

export function Avatar({ name, source, size = 'md', online = false, ring = false }: AvatarProps) {
  const diameter = dimensions[size];
  const initials = getInitials(name);
  const ringTone = ring === true ? 'story' : ring === false ? 'none' : ring;
  const thickness = diameter >= 72 ? 3 : 2;
  const fontSize = Math.round(diameter * 0.36);

  const face = source ? (
    <Image
      source={{ uri: source }}
      accessibilityIgnoresInvertColors
      style={styles.image}
      contentFit="cover"
    />
  ) : (
    <View style={styles.fallback}>
      <Typography
        variant="title"
        color={colors.textPrimary}
        maxFontSizeMultiplier={1.1}
        style={{ fontSize, lineHeight: Math.round(fontSize * 1.2), fontFamily: fontFamily.display }}
      >
        {initials}
      </Typography>
    </View>
  );

  return (
    <View accessibilityLabel={name} style={{ width: diameter, height: diameter }}>
      {ringTone === 'none' ? (
        <View style={[styles.plain, { width: diameter, height: diameter }]}>{face}</View>
      ) : (
        <GradientRing size={diameter} tone={ringTone} thickness={thickness} gap={thickness}>
          {face}
        </GradientRing>
      )}
      {online ? (
        <View
          style={[styles.online, diameter <= 32 ? styles.onlineSmall : null]}
          accessibilityElementsHidden
        />
      ) : null}
    </View>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) {
    return 'F';
  }
  return parts.map((part) => part.charAt(0).toLocaleUpperCase()).join('');
}

const styles = StyleSheet.create({
  plain: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  online: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.background,
  },
  onlineSmall: {
    width: 10,
    height: 10,
    borderWidth: 2,
  },
});
