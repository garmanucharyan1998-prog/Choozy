import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { getSiteBaseUrl } from "shared/config/siteMeta";

/** Every language that carries a URL prefix — the default one lives at the root. */
const prefixedLanguages = SUPPORTED_LANGUAGE_CODES.filter((code) => code !== DEFAULT_LANGUAGE_CODE);

/**
 * `robots.txt` as a resource route rather than a file in `public/`, for two reasons:
 * the sitemap URL is built from `getSiteBaseUrl()` instead of being a second hardcoded copy
 * of the domain that can drift from the one in every canonical tag, and the per-language
 * disallow lines are generated from `PREFIXED_LANGUAGES` instead of being hand-enumerated —
 * the static file listed `/ru/…` and `/en/…` by hand and would silently miss a new locale.
 */
const disallowedAreas = ["/account", "/session"];

export async function loader() {
  const base = getSiteBaseUrl();

  const disallowLines = disallowedAreas
    .flatMap((area) => [area, ...prefixedLanguages.map((language) => `/${language}${area}`)])
    .map((path) => `Disallow: ${path}`)
    .join("\n");

  const body = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Personal areas and the POST-only session routes: no public content to index.
${disallowLines}

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
