import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, fontFamily, gradients } from '@/theme';

type BrandMarkProps = {
  /** Kept for API compatibility; the mark no longer draws a constellation. */
  constellation?: boolean;
  compact?: boolean;
  size?: number;
};

/** The app icon: a sunrise squircle carrying a lowercase f. */
export function BrandMark({ compact = false, size }: BrandMarkProps) {
  const side = size ?? (compact ? 56 : 88);
  const glyph = Math.round(side * 0.62);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: side, height: side }}
    >
      <LinearGradient
        colors={gradients.brand.colors}
        start={gradients.brand.start}
        end={gradients.brand.end}
        style={[styles.mark, { borderRadius: side * 0.28 }]}
      >
        <Typography
          variant="display"
          color="#FFFFFF"
          maxFontSizeMultiplier={1}
          style={{
            fontFamily: fontFamily.wordmark,
            fontSize: glyph,
            lineHeight: Math.round(glyph * 1.15),
            marginTop: -Math.round(side * 0.04),
            marginLeft: Math.round(side * 0.04),
          }}
        >
          f
        </Typography>
      </LinearGradient>
    </View>
  );
}

type WordmarkProps = {
  size?: number;
  color?: string;
};

/** "followly" set in Followly Display Black. */
export function Wordmark({ size = 28, color = colors.textPrimary }: WordmarkProps) {
  return (
    <Typography
      variant="display"
      color={color}
      maxFontSizeMultiplier={1.1}
      accessibilityRole="header"
      accessibilityLabel="Followly"
      style={{
        fontFamily: fontFamily.wordmark,
        fontSize: size,
        lineHeight: Math.round(size * 1.18),
        letterSpacing: -size * 0.03,
      }}
    >
      followly
    </Typography>
  );
}

const styles = StyleSheet.create({
  mark: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
