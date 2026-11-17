export const dataReadinessStates = [
  'READY',
  'COLLECTING_DATA',
  'WAITING_FOR_SNAPSHOT',
  'INSUFFICIENT_DATA',
  'LIMITED_ACCESS',
  'UNAVAILABLE',
  'ERROR',
  'NOT_CONNECTED',
] as const;

export type DataReadiness = (typeof dataReadinessStates)[number];
