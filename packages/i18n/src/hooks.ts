/**
 * React hook for i18n in Hub app
 */

import { useState, useEffect, useCallback } from "react";
import {
  translate,
  getTranslator,
  isSupportedLocale,
  type SupportedLocale,
  type TranslationKey,
  type TranslateOptions,
} from "@masjid-suite/i18n";

/**
 * Get user's preferred language from profile or localStorage
 */
function getUserLocale(): SupportedLocale {
  // Try localStorage first
  const stored = localStorage.getItem("preferred_locale");
  if (stored && isSupportedLocale(stored)) {
    return stored;
  }

  // Default to Bahasa Malaysia
  return "ms";
}

/**
 * Hook for using i18n in React components
 */
export function useTranslation() {
  const [locale, setLocaleState] = useState<SupportedLocale>(getUserLocale);

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem("preferred_locale", newLocale);
  }, []);

  const t = useCallback(
    (key: TranslationKey, options?: TranslateOptions) => {
      return translate(key, locale, options);
    },
    [locale]
  );

  return {
    t,
    locale,
    setLocale,
  };
}

/**
 * Hook for using locale from user profile
 */
export function useUserLocale(userPreferredLanguage?: string | null) {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    if (userPreferredLanguage && isSupportedLocale(userPreferredLanguage)) {
      return userPreferredLanguage;
    }
    return getUserLocale();
  });

  useEffect(() => {
    if (userPreferredLanguage && isSupportedLocale(userPreferredLanguage)) {
      setLocale(userPreferredLanguage);
      localStorage.setItem("preferred_locale", userPreferredLanguage);
    }
  }, [userPreferredLanguage]);

  const t = useCallback(
    (key: TranslationKey, options?: TranslateOptions) => {
      return translate(key, locale, options);
    },
    [locale]
  );

  return {
    t,
    locale,
  };
}
