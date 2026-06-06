export { translations } from "./translations";
export { default as defaultTranslations } from "./translations";
export {
  DEFAULT_LANGUAGE_CODE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGE_CODES,
  isSupportedLanguage,
  readStoredLanguage,
  writeStoredLanguage,
} from "./languageConfig";
export { buildLocale } from "./mergeLocale";
