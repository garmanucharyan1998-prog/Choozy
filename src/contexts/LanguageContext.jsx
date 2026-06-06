import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "shared/i18n";
import {
  DEFAULT_LANGUAGE_CODE,
  readStoredLanguage,
  writeStoredLanguage,
} from "shared/i18n/languageConfig";

const FALLBACK_LANGUAGE = DEFAULT_LANGUAGE_CODE;
const LanguageContext = createContext(null);

const resolveTextByPath = (dictionary, path) =>
  path.split(".").reduce((acc, segment) => {
    if (acc && typeof acc === "object") {
      return acc[segment];
    }
    return undefined;
  }, dictionary);

/**
 * Provides language state and translation helper for UI layers.
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => readStoredLanguage());

  const setLanguage = useCallback((nextLanguage) => {
    setLanguageState(nextLanguage);
    writeStoredLanguage(nextLanguage);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (path, fallback = "") => {
      const localizedDictionary = translations[language] || {};
      const fallbackDictionary = translations[FALLBACK_LANGUAGE] || {};
      const localizedValue = resolveTextByPath(localizedDictionary, path);

      if (typeof localizedValue === "string") {
        return localizedValue;
      }

      const fallbackValue = resolveTextByPath(fallbackDictionary, path);
      if (typeof fallbackValue === "string") {
        return fallbackValue;
      }

      return fallback || path;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
