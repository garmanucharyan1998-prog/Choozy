import { FILTER_CATEGORY_IDS } from "entities/filter-catalog/model/filterCatalogCategories";
import { getProductDetailHref } from "entities/product-detail";
import { PRODUCT_CATALOG } from "entities/product";
import { SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { localizedPath } from "shared/lib/locale";

/**
 * Single source of truth for "which URLs exist and should be indexed".
 * Consumed by the sitemap.xml resource route (app/routes/sitemap.ts), so the sitemap
 * can never drift from what the app actually renders.
 *
 * Deliberately excluded:
 *  - account / shop-account (noindex, localStorage-driven)
 *  - ComingSoon placeholders (noindex until real content lands)
 *  - the 404 route
 */

/** Language-agnostic paths, with the priority/changefreq hints used in sitemap.xml. */
export const getIndexableRoutes = () => {
  const routes = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/filter", changefreq: "daily", priority: "0.9" },
    /**
     * The prose pages. They were `ComingSoon` placeholders carrying `noindex` and were
     * excluded from here for that reason; now that they have real content, a commerce site
     * wants them found — privacy and terms in particular are trust signals.
     */
    { path: "/about", changefreq: "monthly", priority: "0.5" },
    { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms-of-service", changefreq: "yearly", priority: "0.3" },
  ];

  FILTER_CATEGORY_IDS.forEach((categoryId) => {
    routes.push({
      path: `/filter?category=${encodeURIComponent(categoryId)}`,
      changefreq: "daily",
      priority: "0.8",
    });
  });

  PRODUCT_CATALOG.forEach((product) => {
    routes.push({
      path: getProductDetailHref(product.id, product.title),
      changefreq: "weekly",
      priority: "0.7",
    });
  });

  return routes;
};

const withLanguages = (route) => ({
  ...route,
  /** `{ am: "/filter", ru: "/ru/filter", ... }` — used for hreflang alternates. */
  byLanguage: Object.fromEntries(
    SUPPORTED_LANGUAGE_CODES.map((code) => [code, localizedPath(route.path, code)]),
  ),
});

/** Indexable routes across all languages — this is what sitemap.xml is built from. */
export const getLocalizedRouteInventory = () => getIndexableRoutes().map(withLanguages);

export default getLocalizedRouteInventory;
