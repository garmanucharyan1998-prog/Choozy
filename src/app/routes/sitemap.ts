import { getLocalizedRouteInventory } from "shared/lib/seo";
import { SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { getHtmlLangForAppLanguage } from "shared/lib/locale";
import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";

/**
 * `sitemap.xml` as a resource route (a loader with no page component) instead of a
 * build-time file written by a prerender script — it's generated from the exact same
 * `routeInventory.js` the rest of the SEO layer uses, on request, so it can never drift
 * from a stale build artifact the way a once-generated static file could.
 */
export async function loader() {
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const languages = SUPPORTED_LANGUAGE_CODES.map((code) => ({
    code,
    hreflang: getHtmlLangForAppLanguage(code),
  }));
  const inventory = getLocalizedRouteInventory();

  const urls = inventory
    .map((route) => {
      const alternates = languages
        .map(
          (lang) =>
            `    <xhtml:link rel="alternate" hreflang="${lang.hreflang}" href="${base}${route.byLanguage[lang.code]}"/>`,
        )
        .join("\n");
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${base}${route.byLanguage[languages[0].code]}"/>`;

      return languages
        .map(
          (lang) => `  <url>
    <loc>${base}${route.byLanguage[lang.code]}</loc>
${alternates}
${xDefault}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
        )
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
