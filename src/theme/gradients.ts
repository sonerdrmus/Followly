/**
 * The sunrise gradient is Followly's one loud element. It appears on story
 * rings, the brand mark, and chart strokes. Everything else stays neutral.
 */
export const sunrise = ['#FEDA75', '#FA7E1E', '#D62976', '#962FBF', '#4F5BD5'] as const;

export const gradients = {
  brand: {
    colors: sunrise,
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
  },
  ring: {
    colors: ['#FEDA75', '#FA7E1E', '#D62976', '#962FBF'] as const,
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
  },
  ambient: {
    colors: ['rgba(150, 47, 191, 0.24)', 'rgba(79, 91, 213, 0.06)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  surface: {
    colors: ['#1C1C1C', '#121212'] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  hero: {
    colors: ['#1A1A1A', '#121212'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  insight: {
    colors: [
      'rgba(214, 41, 118, 0.20)',
      'rgba(150, 47, 191, 0.14)',
      'rgba(18, 18, 18, 1)',
    ] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

export type GradientName = keyof typeof gradients;
