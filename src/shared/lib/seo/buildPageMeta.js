import { getSiteBaseUrl } from "shared/config/siteMeta";
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
/** The site logo, and its real dimensions — the fallback share image for pages with no own. */
const DEFAULT_IMAGE = { path: "/logo512.png", width: 512, height: 512 };

export const buildPageMeta = ({
  title,
  description,
  language,
  path = "/",
  imagePath = DEFAULT_IMAGE.path,
  imageWidth,
  imageHeight,
  imageAlt,
  ogType = "website",
  noIndex = false,
}) => {
  const base = getSiteBaseUrl();
  const pathWithoutLanguage = stripLanguageFromPath(path);
  const canonicalUrl = `${base}${localizedPath(pathWithoutLanguage, language)}`;

  const resolvedImage = imagePath || DEFAULT_IMAGE.path;
  const imageUrl = resolvedImage.startsWith("http")
    ? resolvedImage
    : `${base}${resolvedImage.startsWith("/") ? resolvedImage : `/${resolvedImage}`}`;

  /**
   * Dimensions travel with the image they describe. They used to be two static tags in the
   * document shell claiming 512×512 for every page, which was wrong on exactly the pages
   * that get shared — a product page overrides the image with a 1200×900 photo.
   * A page that declares no size simply omits the tags; a wrong size is worse than none.
   */
  const usingDefaultImage = resolvedImage === DEFAULT_IMAGE.path;
  const width = imageWidth ?? (usingDefaultImage ? DEFAULT_IMAGE.width : undefined);
  const height = imageHeight ?? (usingDefaultImage ? DEFAULT_IMAGE.height : undefined);

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
    { property: "og:type", content: ogType },
    { property: "og:site_name", content: "Choosy" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    ...(width ? [{ property: "og:image:width", content: String(width) }] : []),
    ...(height ? [{ property: "og:image:height", content: String(height) }] : []),
    ...(imageAlt ? [{ property: "og:image:alt", content: imageAlt }] : []),
    { property: "og:locale", content: getOgLocaleForAppLanguage(language) },
    ...SUPPORTED_LANGUAGE_CODES.filter((code) => code !== language)
      .map((code) => APP_LOCALE[code]?.ogLocale)
      .filter(Boolean)
      .map((locale) => ({ property: "og:locale:alternate", content: locale })),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
    ...(imageAlt ? [{ name: "twitter:image:alt", content: imageAlt }] : []),
  ];
};

export default buildPageMeta;
