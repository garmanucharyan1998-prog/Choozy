import {
  getIndexableRoutes,
  getLocalizedRouteInventory,
  getNonIndexableRoutes,
  getPrerenderRouteInventory,
} from "./routeInventory";
import { PRODUCT_CATALOG } from "entities/product";
import { SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";

describe("getIndexableRoutes", () => {
  test("includes home, catalog, and one entry per catalog product", () => {
    const paths = getIndexableRoutes().map((r) => r.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/filter");
    // home + filter + one per category + one per catalog product
    expect(getIndexableRoutes().length).toBeGreaterThanOrEqual(2 + PRODUCT_CATALOG.length);
  });

  test("every catalog product has its own indexable URL (sitemap must not drop products)", () => {
    const routes = getIndexableRoutes();
    PRODUCT_CATALOG.forEach((product) => {
      const hasRoute = routes.some(
        (r) => r.path.includes(encodeURIComponent(product.id)) || r.path.includes(product.id),
      );
      expect(hasRoute).toBe(true);
    });
  });
});

describe("getNonIndexableRoutes", () => {
  test("does not overlap with the indexable set (a URL must not be both)", () => {
    const indexable = new Set(getIndexableRoutes().map((r) => r.path));
    getNonIndexableRoutes().forEach((route) => {
      expect(indexable.has(route.path)).toBe(false);
    });
  });
});

describe("getLocalizedRouteInventory", () => {
  test("every indexable route has a URL for every supported language", () => {
    getLocalizedRouteInventory().forEach((route) => {
      SUPPORTED_LANGUAGE_CODES.forEach((code) => {
        expect(typeof route.byLanguage[code]).toBe("string");
      });
    });
  });

  test("the default language alternate carries no prefix, others do", () => {
    const filterRoute = getLocalizedRouteInventory().find((r) => r.path === "/filter");
    expect(filterRoute.byLanguage.am).toBe("/filter");
    expect(filterRoute.byLanguage.ru).toBe("/ru/filter");
    expect(filterRoute.byLanguage.en).toBe("/en/filter");
  });
});

describe("getPrerenderRouteInventory", () => {
  test("is the union of indexable and non-indexable routes — every URL gets an HTML file", () => {
    const prerenderPaths = getPrerenderRouteInventory().map((r) => r.path);
    const indexablePaths = getIndexableRoutes().map((r) => r.path);
    const nonIndexablePaths = getNonIndexableRoutes().map((r) => r.path);

    [...indexablePaths, ...nonIndexablePaths].forEach((path) => {
      expect(prerenderPaths).toContain(path);
    });
    expect(prerenderPaths.length).toBe(indexablePaths.length + nonIndexablePaths.length);
  });
});
