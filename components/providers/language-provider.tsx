"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import en from "@/lib/i18n/en";
import am from "@/lib/i18n/am";

type Lang = "en" | "am";
type Dict = typeof en;

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dict: Dict;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (stored === "en" || stored === "am") setLangState(stored);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  }, []);
  const dict = lang === "am" ? am : en;
  const t = useCallback((key: string) => {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cur: any = dict;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return key;
    }
    return typeof cur === "string" ? cur : key;
  }, [dict]);
  return <LanguageContext.Provider value={{ lang, setLang, t, dict }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

export function bi(value: { en?: string; am?: string } | undefined, lang: Lang, fallback = "") {
  if (!value) return fallback;
  return value[lang] || value.en || fallback;
}
