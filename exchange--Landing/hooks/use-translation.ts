// hooks/use-translation.ts
"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import * as React from "react";

import en from "@/locales/en.json";
import es from "@/locales/es.json";

type Locale = "es" | "en";
type Dict = Record<string, unknown>;

const dictionaries: Record<Locale, Dict> = {
  es: es as Dict,
  en: en as Dict,
};

interface TranslationContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

function lookup(dict: Dict, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = dict;
  for (const p of parts) {
    if (current && typeof current === "object" && p in (current as object)) {
      current = (current as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function TranslationProvider({
  children,
  defaultLocale = "es",
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const value = useMemo<TranslationContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      setLocale,
      t: (key, vars) => {
        const raw = lookup(dict, key) ?? lookup(dictionaries.en, key) ?? key;
        return interpolate(raw, vars);
      },
    };
  }, [locale]);

  return React.createElement(
    TranslationContext.Provider,
    { value },
    children
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    // Modo fallback sin provider: idioma fijo "es", para no romper builds aislados.
    return {
      locale: "es" as Locale,
      setLocale: () => undefined,
      t: (key: string, vars?: Record<string, string | number>) => {
        const raw = lookup(dictionaries.es, key) ?? key;
        return interpolate(raw, vars);
      },
    };
  }
  return ctx;
}
