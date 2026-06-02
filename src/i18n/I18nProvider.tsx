import { type ReactNode, createContext, useContext, useMemo } from 'react';
import type { Locale, Translations } from '../types';
import { translations as defaults, rtlLocales } from './translations';

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  locale?: Locale;
  /** Override or extend translations for the active locale. */
  messages?: Partial<Translations>;
  children: ReactNode;
}

export function I18nProvider({ locale = 'en', messages, children }: I18nProviderProps) {
  const value = useMemo<I18nContextValue>(() => {
    const base = defaults[locale] ?? defaults.en;
    return {
      locale,
      t: { ...base, ...messages },
      isRtl: rtlLocales.has(locale),
    };
  }, [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  return { locale: 'en', t: defaults.en, isRtl: false };
}
