import { DEFAULT_LANGUAGE_CODE } from "shared/i18n/languageConfig";
import { getSiteBaseUrl } from "shared/config/siteMeta";
import { CONTENT_LAST_MODIFIED } from "shared/config/contentRevision";
import { getLocalizedRouteInventory } from "shared/lib/seo";
import { loader } from "./sitemap";

const readSitemap = async () => {
  const response = await loader();
  return { response, xml: await response.text() };
};

describe("sitemap.xml resource route", () => {
  test("serves XML with a cache header", async () => {
    const { response } = await readSitemap();
    expect(response.headers.get("Content-Type")).toContain("application/xml");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
  });

  test("lists every inventory route in every language", async () => {
    const { xml } = await readSitemap();
    const base = getSiteBaseUrl();
    const inventory = getLocalizedRouteInventory();

    inventory.forEach((route) => {
      Object.values(route.byLanguage).forEach((path) => {
        const loc = `<loc>${base}${path}`.replace(/&/g, "&amp;");
        expect(xml).toContain(loc);
      });
    });
  });

  test("every URL carries a lastmod", async () => {
    const { xml } = await readSitemap();
    const locCount = (xml.match(/<loc>/g) || []).length;
    const lastmodCount = (xml.match(new RegExp(`<lastmod>${CONTENT_LAST_MODIFIED}</lastmod>`, "g")) || [])
      .length;
    expect(locCount).toBeGreaterThan(0);
    expect(lastmodCount).toBe(locCount);
  });

  /**
   * x-default used to be taken from `SUPPORTED_LANGUAGE_CODES[0]` positionally, which only
   * happened to be the default language — `routes.ts` already orders that list differently.
   */
  test("x-default points at the default language, not whichever code is first", async () => {
    const { xml } = await readSitemap();
    const base = getSiteBaseUrl();
    const home = getLocalizedRouteInventory()[0];

    expect(xml).toContain(
      `hreflang="x-default" href="${base}${home.byLanguage[DEFAULT_LANGUAGE_CODE]}"`,
    );
  });

  test("ampersands in URLs are escaped, so the document stays parseable", async () => {
    const { xml } = await readSitemap();
    /** No bare `&` outside a real entity anywhere in the document. */
    expect(xml).not.toMatch(/&(?!(amp|lt|gt|quot|apos);)/);
  });

  test("the category landing pages the canonical layer indexes are all advertised", async () => {
    const { xml } = await readSitemap();
    ["smartphones", "laptops", "tablets", "tv", "headphones", "speakers", "wearables", "cameras"].forEach(
      (categoryId) => {
        expect(xml).toContain(`/filter?category=${categoryId}`.replace(/&/g, "&amp;"));
      },
    );
  });
});
