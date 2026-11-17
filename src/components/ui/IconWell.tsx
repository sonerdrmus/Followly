import { cloneElement, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme';

type IconProps = { color?: string; size?: number; strokeWidth?: number };

export type IconTone = 'primary' | 'accent' | 'teal' | 'danger' | 'success' | 'neutral' | 'violet';

const tones: Record<IconTone, { background: string; color: string }> = {
  primary: { background: colors.primarySoft, color: '#4DB5FF' },
  accent: { background: colors.accentSoft, color: '#FF7EB3' },
  teal: { background: colors.tealSoft, color: '#8C95FF' },
  danger: { background: colors.dangerSoft, color: colors.danger },
  success: { background: colors.successSoft, color: colors.success },
  neutral: { background: 'rgba(255, 255, 255, 0.1)', color: colors.textPrimary },
  violet: { background: colors.violetSoft, color: '#C77DFF' },
};

type IconWellProps = {
  icon: ReactElement;
  tone?: IconTone;
  size?: 'sm' | 'md' | 'lg';
};

const dimension = { sm: 36, md: 44, lg: 56 } as const;
const glyphSize = { sm: 18, md: 20, lg: 24 } as const;

export function IconWell({ icon: glyph, tone = 'primary', size = 'md' }: IconWellProps) {
  const palette = tones[tone];
  const side = dimension[size];

  return (
    <View style={[styles.well, { width: side, height: side, backgroundColor: palette.background }]}>
      {cloneElement(glyph as ReactElement<IconProps>, {
        color: palette.color,
        size: glyphSize[size],
        strokeWidth: 1.9,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
