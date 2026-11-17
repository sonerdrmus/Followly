import type { DataReadiness } from './readiness';

export const dataSourceKinds = [
  'official_insights',
  'imported_export',
  'calculated_from_snapshots',
  'development_fixture',
] as const;

export type DataSourceKind = (typeof dataSourceKinds)[number];

export type DataProvenance = {
  source: DataSourceKind | null;
  updatedAt: string | null;
  comparisonPeriod: string | null;
  availability: DataReadiness;
  note: string;
};

export const sourceLabels: Record<DataSourceKind, string> = {
  official_insights: 'Official Instagram Insights',
  imported_export: 'Imported Instagram export',
  calculated_from_snapshots: 'Calculated from snapshots',
  development_fixture: 'Development fixture',
};
