export const icon = {
  size: {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
  },
  stroke: 1.75,
  strokeActive: 2.5,
} as const;

export type IconSize = keyof typeof icon.size;
