import { Helmet } from "react-helmet-async";
import { useLanguage } from "contexts";
import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
import { getHtmlLangForAppLanguage, getOgLocaleForAppLanguage } from "shared/lib/locale";

/**
 * Sets document title, description, canonical, Open Graph, and Twitter Card tags.
 * Relies on HelmetProvider at the app root.
 * @param {boolean} [noIndex] — when true, adds robots noindex (e.g. 404 pages).
 */
export const PageSeo = ({ title, description, path = "/", imagePath = "/logo512.png", noIndex = false }) => {
  const { language } = useLanguage();
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const pathSegment = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${base}${pathSegment}`;
  const imageUrl = imagePath.startsWith("http")
    ? imagePath
    : `${base}${imagePath.startsWith("/") ? imagePath : `/${imagePath}`}`;
  const htmlLang = getHtmlLangForAppLanguage(language);
  const ogLocale = getOgLocaleForAppLanguage(language);

  return (
    <Helmet prioritizeSeoTags>
      <html lang={htmlLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex ? <meta name="robots" content="noindex, follow" /> : null}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={ogLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default PageSeo;
