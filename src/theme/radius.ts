export const radius = {
  xs: 4,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 22,
  full: 999,
} as const;

export type RadiusName = keyof typeof radius;
