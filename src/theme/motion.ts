/**
 * Motion answers touches and nothing else. Durations are short so the app
 * feels immediate.
 */
export const motion = {
  duration: {
    press: 80,
    fast: 140,
    base: 200,
    slow: 280,
  },
  easing: {
    standard: [0.2, 0.8, 0.2, 1] as const,
    enter: [0.16, 1, 0.3, 1] as const,
  },
  pressScale: 0.98,
  pressOpacity: 0.55,
} as const;
