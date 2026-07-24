"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getMessages,
  interpolate,
  isLocale,
  LOCALE_STORAGE_KEY,
  type Locale,
  type Messages,
} from "@/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
  format: (template: string, vars: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isLocale(stored)) return stored;
  const nav = navigator.language.slice(0, 2).toLowerCase();
  if (nav === "zh") return "zh";
  if (isLocale(nav)) return nav;
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readStoredLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial === "zh" ? "zh-CN" : initial;
    setReady(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next === "zh" ? "zh-CN" : next;
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getMessages(locale),
      format: interpolate,
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <div
        className={ready && locale === "zh" ? "font-cjk" : undefined}
        lang={locale === "zh" ? "zh-CN" : locale}
      >
        {children}
      </div>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
