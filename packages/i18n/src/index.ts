/**
 * @masjid-suite/i18n
 *
 * Internationalization package for E-Masjid.My
 * Provides translations for Bahasa Malaysia (primary) and English (fallback)
 */

export { en } from "./locales/en";
export { ms } from "./locales/ms";

export type { TranslationKeys } from "./locales/en";

export type {
  SupportedLocale,
  TranslationNamespace,
  TranslationKey,
  I18nConfig,
  TranslateOptions,
} from "./types";

export {
  translate,
  getTranslator,
  isSupportedLocale,
  getLocaleDisplayName,
  getPrayerName,
  getAllPrayerNames,
  formatDate,
  formatTime,
  formatDateTime,
} from "./i18n";

export { useTranslation, useUserLocale } from "./hooks";
