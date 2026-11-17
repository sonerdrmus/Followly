import { createContext, useContext } from 'react';

type FontStatus = {
  loaded: boolean;
};

export const FontStatusContext = createContext<FontStatus>({ loaded: false });

export function useFontStatus() {
  return useContext(FontStatusContext);
}
