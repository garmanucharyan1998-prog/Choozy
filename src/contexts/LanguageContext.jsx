import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { translations } from "shared/i18n";
import {
  DEFAULT_LANGUAGE_CODE,
  isSupportedLanguage,
  writeStoredLanguage,
} from "shared/i18n/languageConfig";
import {
  getHtmlLangForAppLanguage,
  getLanguageFromPath,
  localizedPath,
  stripLanguageFromPath,
} from "shared/lib/locale";

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
 *
 * The URL prefix is the single source of truth for the active language — this keeps
 * prerendered HTML and client hydration in agreement. `localStorage` only records the
 * user's preference so the language switcher can be restored on a later visit.
 */
export const LanguageProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const language = getLanguageFromPath(location.pathname);

  const setLanguage = useCallback(
    (nextLanguage) => {
      if (!isSupportedLanguage(nextLanguage) || nextLanguage === language) {
        return;
      }
      writeStoredLanguage(nextLanguage);
      const bare = `${stripLanguageFromPath(location.pathname)}${location.search}${location.hash}`;
      navigate(localizedPath(bare, nextLanguage));
    },
    [language, location.pathname, location.search, location.hash, navigate],
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = getHtmlLangForAppLanguage(language);
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
