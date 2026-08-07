import { useLayoutEffect, useMemo } from "react";
import { useLanguage } from "contexts";
import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
import {
  APP_LOCALE,
  getOgLocaleForAppLanguage,
  localizedPath,
  stripLanguageFromPath,
} from "shared/lib/locale";
import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { applyPageMeta } from "./applyPageMeta";

/**
 * Page title, description, canonical, hreflang, Open Graph, Twitter Card and JSON-LD.
 *
 * Renders nothing: the tags are written to <head> imperatively (see `applyPageMeta`)
 * so that <head> never takes part in hydration. Rendering them through React produced a
 * duplicate set on top of the prerendered ones.
 *
 * `<html lang>` is owned by `LanguageContext`.
 *
 * @param {string} title
 * @param {string} description
 * @param {string} [path] — current path, with or without a language prefix.
 * @param {string} [imagePath]
 * @param {boolean} [noIndex] — 404, account and placeholder pages.
 * @param {object|object[]} [jsonLd] — structured data.
 */
export const PageSeo = ({
  title,
  description,
  path = "/",
  imagePath = "/logo512.png",
  noIndex = false,
  jsonLd,
}) => {
  const { language } = useLanguage();

  const config = useMemo(() => {
    const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
    const pathWithoutLanguage = stripLanguageFromPath(path);
    const canonicalUrl = `${base}${localizedPath(pathWithoutLanguage, language)}`;

    const resolvedImage = imagePath || "/logo512.png";
    const imageUrl = resolvedImage.startsWith("http")
      ? resolvedImage
      : `${base}${resolvedImage.startsWith("/") ? resolvedImage : `/${resolvedImage}`}`;

    const links = [
      { rel: "canonical", href: canonicalUrl },
      ...SUPPORTED_LANGUAGE_CODES.map((code) => ({
        rel: "alternate",
        hreflang: APP_LOCALE[code]?.htmlLang ?? code,
        href: `${base}${localizedPath(pathWithoutLanguage, code)}`,
      })),
      {
        rel: "alternate",
        hreflang: "x-default",
        href: `${base}${localizedPath(pathWithoutLanguage, DEFAULT_LANGUAGE_CODE)}`,
      },
    ];

    const metaProperties = [
      ["og:type", "website"],
      ["og:site_name", "Choosy"],
      ["og:url", canonicalUrl],
      ["og:title", title],
      ["og:description", description],
      ["og:image", imageUrl],
      ["og:locale", getOgLocaleForAppLanguage(language)],
      ...SUPPORTED_LANGUAGE_CODES.filter((code) => code !== language)
        .map((code) => APP_LOCALE[code]?.ogLocale)
        .filter(Boolean)
        .map((locale) => ["og:locale:alternate", locale]),
    ];

    return {
      title,
      metaNames: {
        description,
        robots: noIndex
          ? "noindex, follow"
          : "index, follow, max-image-preview:large, max-snippet:-1",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": imageUrl,
      },
      metaProperties,
      links,
      jsonLd: jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [],
    };
  }, [title, description, path, imagePath, noIndex, jsonLd, language]);

  useLayoutEffect(() => {
    applyPageMeta(config);
  }, [config]);

  return null;
};

export default PageSeo;
