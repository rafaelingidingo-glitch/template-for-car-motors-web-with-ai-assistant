"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { translations, type Locale, type Translations } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // BUG FIX: Always initialize locale to "en" to avoid hydration mismatch.
  // Previously, reading localStorage during useState initialization caused the
  // server to render with "en" but the client might hydrate with "sw" (from localStorage),
  // triggering React hydration errors and "Fast Refresh had to perform a full reload" warnings.
  // Now we always start with "en" and sync from localStorage in useEffect after mount.
  const [locale, setLocaleState] = useState<Locale>("en");

  // Track if we've synced from localStorage to avoid unnecessary re-renders
  const hasSyncedRef = useRef(false);

  // Sync locale from localStorage after mount (client-only)
  // This runs after hydration, so server and client initial renders always match
  useEffect(() => {
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    try {
      const saved = localStorage.getItem("locale");
      if (saved === "en" || saved === "sw") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional: syncing client-only state from localStorage after hydration to avoid mismatch
        setLocaleState(saved);
      }
    } catch {
      // localStorage may be unavailable in SSR or private browsing
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("locale", newLocale);
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, []);

  // Memoize the translations object to avoid creating a new reference on every render
  const t = useMemo(() => translations[locale], [locale]);

  // Update the HTML lang attribute when locale changes (for accessibility & SEO)
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Memoize the entire context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
