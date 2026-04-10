/**
 * Single source of truth for app locale → `<html lang>` and `og:locale`.
 * Used by LanguageContext and PageSeo; add new locales only here.
 * html `lang` uses a BCP 47 primary subtag (e.g. hy).
 * Open Graph `og:locale` expects language_REGION (e.g. hy_AM) for social parsers.
 */
export const APP_LOCALE = {
  am: { htmlLang: "hy", ogLocale: "hy_AM" },
};

export const getHtmlLangForAppLanguage = (appLang) => APP_LOCALE[appLang]?.htmlLang ?? appLang;

export const getOgLocaleForAppLanguage = (appLang) => {
  const mapped = APP_LOCALE[appLang]?.ogLocale;
  if (mapped) return mapped;
  if (typeof appLang === "string" && appLang.includes("_")) return appLang;
  return `${appLang}_US`;
};
