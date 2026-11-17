import type { TextStyle } from 'react-native';

/**
 * Followly Sans and Followly Display are the app's own cuts of Geologica
 * (SIL OFL 1.1), instanced at custom weight, sharpness and cursive values.
 * Display ships with tabular figures and tighter spacing built in, so numbers
 * line up in every table without extra props. Files live in assets/fonts.
 */
export const fontFamily = {
  display: 'FollowlyDisplay-Bold',
  displayMedium: 'FollowlySans-SemiBold',
  displayBold: 'FollowlyDisplay-Black',
  body: 'FollowlySans-Regular',
  bodyMedium: 'FollowlySans-Medium',
  bodySemibold: 'FollowlySans-SemiBold',
  wordmark: 'FollowlyDisplay-Black',
} as const;

export const typography = {
  family: fontFamily,
  size: {
    caption: 12,
    label: 13,
    bodySmall: 14,
    body: 15,
    title: 16,
    h3: 16,
    h2: 20,
    h1: 26,
    stat: 32,
    display: 44,
  },
  lineHeight: {
    caption: 16,
    label: 18,
    bodySmall: 19,
    body: 21,
    title: 21,
    h3: 21,
    h2: 25,
    h1: 31,
    stat: 36,
    display: 48,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  letterSpacing: {
    tight: -0.6,
    snug: -0.3,
    normal: 0,
    wide: 0.2,
  },
} as const;

export const textStyles = {
  display: {
    fontFamily: fontFamily.displayBold,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    letterSpacing: typography.letterSpacing.tight,
  },
  h1: {
    fontFamily: fontFamily.display,
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    letterSpacing: typography.letterSpacing.snug,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    letterSpacing: typography.letterSpacing.snug,
  },
  h3: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: typography.size.h3,
    lineHeight: typography.lineHeight.h3,
  },
  title: {
    fontFamily: fontFamily.bodySemibold,
    fontSize: typography.size.title,
    lineHeight: typography.lineHeight.title,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: typography.size.bodySmall,
    lineHeight: typography.lineHeight.bodySmall,
  },
  caption: {
    fontFamily: fontFamily.body,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  label: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  stat: {
    fontFamily: fontFamily.displayBold,
    fontSize: typography.size.stat,
    lineHeight: typography.lineHeight.stat,
    letterSpacing: typography.letterSpacing.snug,
  },
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textStyles;
export type TypographySize = keyof typeof typography.size;
export type FontWeight = (typeof typography.weight)[keyof typeof typography.weight];
