import { useLocaleStore } from '@/stores/locale-store';

function activeLocale() {
  return useLocaleStore.getState().locale;
}

export function formatShortDate(iso: string | null): string | null {
  if (!iso) {
    return null;
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(activeLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatChartDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat(activeLocale(), { month: 'short', day: 'numeric' }).format(date);
}
