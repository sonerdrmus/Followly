import { en, type MessageKey } from './en';
import { tr } from './tr';

export type { MessageKey };
export type Locale = 'en' | 'tr';

const catalogs = { en, tr } as const;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'tr';
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = catalogs[locale][key] ?? en[key];
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''));
}

export function messageKey(value: string | null | undefined): MessageKey | null {
  if (value && Object.prototype.hasOwnProperty.call(en, value)) {
    return value as MessageKey;
  }
  return null;
}

export function translateMaybe(
  t: (key: MessageKey, vars?: Record<string, string | number>) => string,
  value?: string | null,
): string | undefined {
  if (!value) {
    return undefined;
  }
  const key = messageKey(value);
  return key ? t(key) : value;
}
