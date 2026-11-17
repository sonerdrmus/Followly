import { useCallback } from 'react';

import { useLocaleStore } from '@/stores/locale-store';

import { translate, type Locale, type MessageKey } from './index';

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  return { t, locale, setLocale };
}

export type { Locale, MessageKey };
