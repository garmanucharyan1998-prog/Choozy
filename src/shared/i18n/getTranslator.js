import { translations } from "./translations";
import { DEFAULT_LANGUAGE_CODE } from "./languageConfig";

const resolveTextByPath = (dictionary, path) =>
  path.split(".").reduce((acc, segment) => {
    if (acc && typeof acc === "object") {
      return acc[segment];
    }
    return undefined;
  }, dictionary);

/**
 * Hook-free translator, usable anywhere `useLanguage()`'s `t` isn't available — route
 * `meta()` functions run as plain functions outside any component tree, on both the
 * server and the client, so they can't call hooks. `LanguageContext` also builds its
 * `t` from this, so component code and `meta()` resolve strings identically.
 *
 * @param {string} language
 * @returns {(path: string, fallback?: string) => string}
 */
export const getTranslator =
  (language) =>
  (path, fallback = "") => {
    const localizedDictionary = translations[language] || {};
    const fallbackDictionary = translations[DEFAULT_LANGUAGE_CODE] || {};
    const localizedValue = resolveTextByPath(localizedDictionary, path);

    if (typeof localizedValue === "string") {
      return localizedValue;
    }

    const fallbackValue = resolveTextByPath(fallbackDictionary, path);
    if (typeof fallbackValue === "string") {
      return fallbackValue;
    }

    return fallback || path;
  };

export default getTranslator;
