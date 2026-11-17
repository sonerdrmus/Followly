import type { ViewStyle } from 'react-native';

import { colors } from './colors';

const shadowColor = colors.ink;

/**
 * On a black canvas, depth comes from surface tone, not drop shadows.
 * These stay for floating layers such as sheets and the tooltip.
 */
export const shadows = {
  none: {
    shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
} as const satisfies Record<string, ViewStyle>;

export type ShadowName = keyof typeof shadows;
