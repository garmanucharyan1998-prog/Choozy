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

/**
 * Routes that must still be prerendered even though they carry `noindex`.
 *
 * Without their own HTML file the static host falls back to `index.html` — the
 * prerendered *home page* — so `/privacy-policy` would serve home-page markup to
 * crawlers and break hydration on the client.
 */
export const getNonIndexableRoutes = () => [
  { path: "/about" },
  { path: "/catalog" },
  { path: "/compare" },
  { path: "/products" },
  { path: "/variety" },
  { path: "/privacy-policy" },
  { path: "/terms-of-service" },
  { path: "/account" },
  { path: "/account/favorite" },
  { path: "/account/recent" },
  { path: "/account/subscription" },
  { path: "/account/notifications" },
  { path: "/account/shop-account" },
  { path: "/account/shop-account/products" },
  { path: "/account/shop-account/statistics" },
  { path: "/account/shop-account/finance" },
];

const withLanguages = (route) => ({
  ...route,
  /** `{ am: "/filter", ru: "/ru/filter", ... }` — used for hreflang alternates. */
  byLanguage: Object.fromEntries(
    SUPPORTED_LANGUAGE_CODES.map((code) => [code, localizedPath(route.path, code)]),
  ),
});

/** Indexable routes across all languages — this is what sitemap.xml is built from. */
export const getLocalizedRouteInventory = () => getIndexableRoutes().map(withLanguages);

/** Everything that needs an HTML file, indexable or not. */
export const getPrerenderRouteInventory = () => [
  ...getIndexableRoutes().map(withLanguages),
  ...getNonIndexableRoutes().map(withLanguages),
];

export default getLocalizedRouteInventory;
