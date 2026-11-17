export function changePercentage(value: number | null, previous: number | null): number | null {
  if (value === null || previous === null || previous === 0) {
    return null;
  }

  return ((value - previous) / Math.abs(previous)) * 100;
}
