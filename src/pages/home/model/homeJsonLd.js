import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";

/**
 * Organization + WebSite structured data for the home page.
 * The SearchAction target mirrors the real header search, which navigates to `/filter?q=`.
 *
 * @param {{ language: string, siteName: string, description: string }} params
 */
export const buildHomeJsonLd = ({ language, siteName, description }) => {
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const homeUrl = `${base}${localizedPath("/", language)}`;
  const searchTarget = `${base}${localizedPath("/filter", language)}?q={search_term_string}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: siteName,
      url: base,
      logo: `${base}/logo512.png`,
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: siteName,
      url: homeUrl,
      description,
      publisher: { "@id": `${base}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: searchTarget,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
};

export default buildHomeJsonLd;
