import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'sk' | 'en';

const STORAGE_KEY = 'ideaforge_locale';

// Slovníky pre "chrome" aplikácie (app bar, bannery, toasty, drawer).
// Migrácia obsahu obrazoviek (IdeaCapture/Workspace) je follow-up.
export const translations: Record<Locale, Record<string, string>> = {
  sk: {
    'appbar.projects': 'Projekty',
    'appbar.export': 'Export',
    'appbar.newIdea': 'Nový nápad',
    'appbar.historyAria': 'Otvoriť históriu projektov',
    'appbar.exportAria': 'Exportovať projekt',
    'appbar.newIdeaAria': 'Vytvoriť nový nápad',
    'appbar.themeToLight': 'Prepnúť na svetlý režim',
    'appbar.themeToDark': 'Prepnúť na tmavý režim',
    'appbar.langAria': 'Switch language / Zmeniť jazyk',
    'offline.text': 'Ste offline — pracujete s uloženými projektmi v zariadení.',
    'offline.pending': 'Čaká na odoslanie: {count}.',
    'toast.errorTitle': 'Nepodarilo sa dokončiť požiadavku',
    'toast.retry': 'Skúsiť znova',
    'toast.dismiss': 'Zavrieť',
    'toast.closeAria': 'Zavrieť upozornenie',
    'swUpdate.text': 'Je dostupná nová verzia aplikácie',
    'swUpdate.reload': 'Obnoviť',
    'history.title': 'Uložené projekty ({count})',
    'history.closeAria': 'Zavrieť históriu projektov',
    'history.newIdea': 'Nový produktný nápad',
    'history.backup': 'Záloha JSON',
    'history.import': 'Import',
    'history.importAria': 'Importovať zálohu projektov (JSON)',
    'history.emptyTitle': 'Zatiaľ nemáte žiadne uložené projekty',
    'history.emptyHint': 'Všetky vygenerované nápady sa sem automaticky uložia.',
    'pwa.install': 'Nainštalovať apku',
  },
  en: {
    'appbar.projects': 'Projects',
    'appbar.export': 'Export',
    'appbar.newIdea': 'New idea',
    'appbar.historyAria': 'Open project history',
    'appbar.exportAria': 'Export project',
    'appbar.newIdeaAria': 'Create new idea',
    'appbar.themeToLight': 'Switch to light mode',
    'appbar.themeToDark': 'Switch to dark mode',
    'appbar.langAria': 'Switch language / Zmeniť jazyk',
    'offline.text': 'You are offline — working with projects stored on this device.',
    'offline.pending': 'Pending send: {count}.',
    'toast.errorTitle': 'Request could not be completed',
    'toast.retry': 'Try again',
    'toast.dismiss': 'Dismiss',
    'toast.closeAria': 'Dismiss notification',
    'swUpdate.text': 'A new version of the app is available',
    'swUpdate.reload': 'Reload',
    'history.title': 'Saved projects ({count})',
    'history.closeAria': 'Close project history',
    'history.newIdea': 'New product idea',
    'history.backup': 'Backup JSON',
    'history.import': 'Import',
    'history.importAria': 'Import projects backup (JSON)',
    'history.emptyTitle': 'No saved projects yet',
    'history.emptyHint': 'All generated ideas are saved here automatically.',
    'pwa.install': 'Install app',
  },
};

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  let str = translations[locale][key] ?? translations.sk[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'sk';
    } catch {
      return 'sk';
    }
  });

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t: (key, vars) => translate(locale, key, vars) }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
