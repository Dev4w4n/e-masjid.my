/**
 * Type definitions for i18n package
 */

import type { TranslationKeys } from './locales/en';

export type SupportedLocale = 'en' | 'ms';

export type TranslationNamespace = keyof TranslationKeys;

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationKeys>;

export interface I18nConfig {
  defaultLocale: SupportedLocale;
  fallbackLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
}

export interface TranslateOptions {
  [key: string]: string | number;
}
