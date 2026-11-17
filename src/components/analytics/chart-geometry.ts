import type { ChartPoint } from '@/types/chart';

export type PlotPoint = ChartPoint & {
  x: number;
  y: number;
};

export function plotPoints(
  data: readonly ChartPoint[],
  width: number,
  height: number,
  padding: number,
): PlotPoint[] {
  if (data.length === 0 || width <= 0) {
    return [];
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerWidth = Math.max(width - padding * 2, 0);
  const innerHeight = Math.max(height - padding * 2, 0);

  return data.map((point, index) => {
    const x =
      padding + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
    const y = padding + (1 - (point.value - min) / span) * innerHeight;
    return { ...point, x, y };
  });
}

export function linePath(points: readonly PlotPoint[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export function areaPath(points: readonly PlotPoint[], baseline: number) {
  if (points.length === 0) {
    return '';
  }
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) {
    return '';
  }
  return `${linePath(points)} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}
