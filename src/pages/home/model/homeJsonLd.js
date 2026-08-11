import { getSiteBaseUrl } from "shared/config/siteMeta";
import {
  ORGANIZATION_ADDRESS,
  ORGANIZATION_AREA_SERVED,
  ORGANIZATION_SOCIAL_PROFILES,
} from "shared/config/organization";
import { getHtmlLangForAppLanguage, localizedPath } from "shared/lib/locale";

/**
 * Organization + WebSite structured data for the home page.
 * The SearchAction target mirrors the real header search, which navigates to `/filter?q=`.
 *
 * `sameAs`, `address` and `areaServed` matter for a marketplace that operates in exactly one
 * country: they are how a search engine ties this site to its social profiles and to Armenia.
 * The profile links existed only as anchor hrefs inside the footer component.
 *
 * @param {{ language: string, siteName: string, description: string }} params
 */
export const buildHomeJsonLd = ({ language, siteName, description }) => {
  const base = getSiteBaseUrl();
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
      sameAs: ORGANIZATION_SOCIAL_PROFILES.map((profile) => profile.href),
      address: { "@type": "PostalAddress", ...ORGANIZATION_ADDRESS },
      areaServed: { "@type": "Country", identifier: ORGANIZATION_AREA_SERVED },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: siteName,
      url: homeUrl,
      description,
      /** BCP-47, not the app's own code: `am` is not a language tag, `hy` is. */
      inLanguage: getHtmlLangForAppLanguage(language),
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
