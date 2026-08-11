import { getLocalizedRouteInventory } from "app/seo";
import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { getHtmlLangForAppLanguage } from "shared/lib/locale";
import { getSiteBaseUrl } from "shared/config/siteMeta";
import { CONTENT_LAST_MODIFIED } from "shared/config/contentRevision";

/**
 * `sitemap.xml` as a resource route (a loader with no page component) instead of a
 * build-time file written by a prerender script — it's generated from the exact same
 * `routeInventory.js` the rest of the SEO layer uses, on request, so it can never drift
 * from a stale build artifact the way a once-generated static file could.
 */

/**
 * A URL inside an XML text node has to be escaped. Category URLs carry one query parameter
 * today, so nothing needs it yet — but the first URL to gain a second parameter would put a
 * bare `&` in the document and make the whole sitemap unparseable.
 */
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function loader() {
  const base = getSiteBaseUrl();
  const languages = SUPPORTED_LANGUAGE_CODES.map((code) => ({
    code,
    hreflang: getHtmlLangForAppLanguage(code),
  }));
  const inventory = getLocalizedRouteInventory();

  const absoluteUrl = (path: string) => escapeXml(`${base}${path}`);

  const urls = inventory
    .map((route) => {
      const alternates = languages
        .map(
          (lang) =>
            `    <xhtml:link rel="alternate" hreflang="${lang.hreflang}" href="${absoluteUrl(route.byLanguage[lang.code])}"/>`,
        )
        .join("\n");
      /**
       * Named explicitly rather than taken from `languages[0]`: the positional version only
       * worked because `am` happens to be first in `SUPPORTED_LANGUAGE_CODES`, and reordering
       * that array (it is already ordered differently in `routes.ts`) would have silently
       * pointed x-default at the Russian or English URL.
       */
      const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(route.byLanguage[DEFAULT_LANGUAGE_CODE])}"/>`;

      return languages
        .map(
          (lang) => `  <url>
    <loc>${absoluteUrl(route.byLanguage[lang.code])}</loc>
${alternates}
${xDefault}
    <lastmod>${CONTENT_LAST_MODIFIED}</lastmod>
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
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      /** Crawlers re-fetch this often; an hour of caching costs nothing in freshness. */
      "Cache-Control": "public, max-age=3600",
    },
  });
}
