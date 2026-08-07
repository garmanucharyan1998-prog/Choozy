import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { getTranslator } from "shared/i18n/getTranslator";
import { isSupportedLanguage, writeStoredLanguage } from "shared/i18n/languageConfig";
import { getLanguageFromPath, localizedPath, stripLanguageFromPath } from "shared/lib/locale";

/**
 * @typedef {{
 *   language: string,
 *   setLanguage: (nextLanguage: string) => void,
 *   t: (path: string, fallback?: string) => string,
 * }} LanguageContextValue
 */

/**
 * Explicit generic, not just `createContext(null)`: without it, TS infers the context's
 * type as exactly `null`, and `useLanguage`'s `if (!context) throw` guard below narrows
 * the remaining type to `never` — real files that consume `t`/`language`/`setLanguage`
 * from TypeScript (like `root.tsx`) would then fail to compile with "not callable, type
 * never has no call signatures" despite the code being correct at runtime.
 * @type {import("react").Context<LanguageContextValue | null>}
 */
const LanguageContext = createContext(null);

/**
 * Provides language state and translation helper for UI layers.
 *
 * The URL prefix is the single source of truth for the active language — this keeps
 * the SSR'd HTML and client hydration in agreement. `localStorage` only records the
 * user's preference so the language switcher can be restored on a later visit.
 *
 * `<html lang>` is computed directly in `root.tsx`'s `Layout` from the same URL, not
 * patched in here via an effect — with real SSR there's no reason to wait for a client
 * mount to get it right.
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

  const t = useMemo(() => getTranslator(language), [language]);

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
