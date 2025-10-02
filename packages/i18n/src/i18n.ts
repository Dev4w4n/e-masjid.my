/**
 * Core i18n functionality
 */

import { en } from './locales/en';
import { ms } from './locales/ms';
import type { SupportedLocale, TranslationKey, TranslateOptions, I18nConfig } from './types';

const translations = {
  en,
  ms,
} as const;

const defaultConfig: I18nConfig = {
  defaultLocale: 'ms', // Bahasa Malaysia as primary per project requirements
  fallbackLocale: 'en',
  supportedLocales: ['en', 'ms'],
};

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return path; // Return the key if not found
    }
  }
  
  return typeof current === 'string' ? current : path;
}

/**
 * Replace placeholders in a string with values
 */
function replacePlaceholders(text: string, options?: TranslateOptions): string {
  if (!options) return text;
  
  return Object.keys(options).reduce((acc, key) => {
    const placeholder = `{{${key}}}`;
    return acc.replace(new RegExp(placeholder, 'g'), String(options[key]));
  }, text);
}

/**
 * Translate a key to the current locale
 */
export function translate(
  key: TranslationKey,
  locale: SupportedLocale = defaultConfig.defaultLocale,
  options?: TranslateOptions
): string {
  const localeData = translations[locale] || translations[defaultConfig.fallbackLocale];
  const text = getNestedValue(localeData, key);
  return replacePlaceholders(text, options);
}

/**
 * Get translation function for a specific locale
 */
export function getTranslator(locale: SupportedLocale = defaultConfig.defaultLocale) {
  return (key: TranslationKey, options?: TranslateOptions) => translate(key, locale, options);
}

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return defaultConfig.supportedLocales.includes(locale as SupportedLocale);
}

/**
 * Get the display name for a locale
 */
export function getLocaleDisplayName(locale: SupportedLocale): string {
  const names: Record<SupportedLocale, string> = {
    en: 'English',
    ms: 'Bahasa Malaysia',
  };
  return names[locale];
}

/**
 * Get prayer time name in the specified locale
 */
export function getPrayerName(
  prayer: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha',
  locale: SupportedLocale = defaultConfig.defaultLocale
): string {
  const t = getTranslator(locale);
  
  const prayerMap = {
    fajr: 'prayer.fajr',
    sunrise: 'prayer.sunrise',
    dhuhr: 'prayer.dhuhr',
    asr: 'prayer.asr',
    maghrib: 'prayer.maghrib',
    isha: 'prayer.isha',
  } as const;
  
  return t(prayerMap[prayer] as TranslationKey);
}

/**
 * Get all prayer names in order
 */
export function getAllPrayerNames(locale: SupportedLocale = defaultConfig.defaultLocale) {
  return {
    fajr: getPrayerName('fajr', locale),
    sunrise: getPrayerName('sunrise', locale),
    dhuhr: getPrayerName('dhuhr', locale),
    asr: getPrayerName('asr', locale),
    maghrib: getPrayerName('maghrib', locale),
    isha: getPrayerName('isha', locale),
  };
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: SupportedLocale = defaultConfig.defaultLocale): string {
  const localeCode = locale === 'ms' ? 'ms-MY' : 'en-MY';
  return date.toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time according to locale
 */
export function formatTime(date: Date, locale: SupportedLocale = defaultConfig.defaultLocale): string {
  const localeCode = locale === 'ms' ? 'ms-MY' : 'en-MY';
  return date.toLocaleTimeString(localeCode, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(date: Date, locale: SupportedLocale = defaultConfig.defaultLocale): string {
  const localeCode = locale === 'ms' ? 'ms-MY' : 'en-MY';
  return date.toLocaleString(localeCode, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
