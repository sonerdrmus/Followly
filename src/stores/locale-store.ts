import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

import { isLocale, type Locale } from '@/i18n';

const storageKey = 'followly.locale';

type LocaleState = {
  locale: Locale;
  ready: boolean;
  hydrate: () => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
};

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return code === 'tr' ? 'tr' : 'en';
}

let localeWrite = 0;

type LocaleStore = UseBoundStore<StoreApi<LocaleState>>;

const localeGlobal = globalThis as typeof globalThis & {
  __followlyLocaleStore?: LocaleStore;
};

function createLocaleStore(): LocaleStore {
  return create<LocaleState>((set) => ({
    locale: 'en',
    ready: false,

    hydrate: async () => {
      const ticket = localeWrite;
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (ticket !== localeWrite) {
          return;
        }
        set({ locale: isLocale(stored) ? stored : deviceLocale(), ready: true });
      } catch {
        if (ticket === localeWrite) {
          set({ locale: deviceLocale(), ready: true });
        }
      }
    },

    setLocale: async (locale) => {
      localeWrite += 1;
      set({ locale, ready: true });
      await AsyncStorage.setItem(storageKey, locale);
    },
  }));
}

export const useLocaleStore: LocaleStore =
  localeGlobal.__followlyLocaleStore ?? createLocaleStore();

localeGlobal.__followlyLocaleStore = useLocaleStore;

void useLocaleStore.getState().hydrate();
