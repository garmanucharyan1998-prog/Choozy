import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
import {
  APP_LOCALE,
  getOgLocaleForAppLanguage,
  localizedPath,
  stripLanguageFromPath,
} from "shared/lib/locale";
import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";

/**
 * Builds a React Router `meta()` descriptor array — title, description, canonical,
 * hreflang alternates, robots, Open Graph, Twitter Card. Pure port of what `PageSeo`
 * used to compute and write to `<head>` imperatively on the client; now the same
 * computation runs during SSR, so the first response already has the right tags
 * instead of a client effect patching them in after hydration.
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   language: string,
 *   path?: string,
 *   imagePath?: string,
 *   noIndex?: boolean,
 * }} params
 * @returns {import("react-router").MetaDescriptor[]}
 */
export const buildPageMeta = ({
  title,
  description,
  language,
  path = "/",
  imagePath = "/logo512.png",
  noIndex = false,
}) => {
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const pathWithoutLanguage = stripLanguageFromPath(path);
  const canonicalUrl = `${base}${localizedPath(pathWithoutLanguage, language)}`;

  const resolvedImage = imagePath || "/logo512.png";
  const imageUrl = resolvedImage.startsWith("http")
    ? resolvedImage
    : `${base}${resolvedImage.startsWith("/") ? resolvedImage : `/${resolvedImage}`}`;

  return [
    { title },
    { name: "description", content: description },
    {
      name: "robots",
      content: noIndex
        ? "noindex, follow"
        : "index, follow, max-image-preview:large, max-snippet:-1",
    },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    ...SUPPORTED_LANGUAGE_CODES.map((code) => ({
      tagName: "link",
      rel: "alternate",
      hrefLang: APP_LOCALE[code]?.htmlLang ?? code,
      href: `${base}${localizedPath(pathWithoutLanguage, code)}`,
    })),
    {
      tagName: "link",
      rel: "alternate",
      hrefLang: "x-default",
      href: `${base}${localizedPath(pathWithoutLanguage, DEFAULT_LANGUAGE_CODE)}`,
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Choosy" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:locale", content: getOgLocaleForAppLanguage(language) },
    ...SUPPORTED_LANGUAGE_CODES.filter((code) => code !== language)
      .map((code) => APP_LOCALE[code]?.ogLocale)
      .filter(Boolean)
      .map((locale) => ({ property: "og:locale:alternate", content: locale })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
};

export default buildPageMeta;
