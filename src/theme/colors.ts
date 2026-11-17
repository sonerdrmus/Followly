/**
 * Followly runs on Instagram's dark vernacular: true black canvas, neutral
 * greys for structure, one action blue, and the sunrise gradient reserved for
 * story rings and data lines.
 */
export const colors = {
  background: '#000000',
  backgroundSecondary: '#000000',
  backgroundTertiary: '#0A0A0A',

  surface: '#121212',
  surfaceRaised: '#262626',
  surfaceElevated: '#363636',
  card: '#121212',
  cardElevated: '#1C1C1C',

  primary: '#0095F6',
  primaryDark: '#0074CC',

  // Sunrise gradient stops, also used one at a time as tones.
  sunYellow: '#FEDA75',
  sunOrange: '#FA7E1E',
  accent: '#D62976',
  violet: '#962FBF',
  teal: '#4F5BD5',

  success: '#58C322',
  danger: '#ED4956',
  warning: '#FFB547',

  textPrimary: '#F5F5F5',
  textSecondary: '#A8A8A8',
  textMuted: '#737373',
  textInverse: '#000000',

  border: '#262626',
  borderStrong: '#363636',

  primarySoft: 'rgba(0, 149, 246, 0.16)',
  violetSoft: 'rgba(150, 47, 191, 0.2)',
  successSoft: 'rgba(88, 195, 34, 0.16)',
  dangerSoft: 'rgba(237, 73, 86, 0.16)',
  warningSoft: 'rgba(255, 181, 71, 0.16)',
  tealSoft: 'rgba(79, 91, 213, 0.2)',
  accentSoft: 'rgba(214, 41, 118, 0.18)',
  scrim: 'rgba(0, 0, 0, 0.64)',

  highlight: 'rgba(255, 255, 255, 0.06)',
  pressed: 'rgba(255, 255, 255, 0.08)',
  primaryMuted: 'rgba(0, 149, 246, 0.24)',
  accentMuted: 'rgba(214, 41, 118, 0.26)',
  ink: '#000000',
} as const;

export type ColorName = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorName];
