import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
  type RouteConfigEntry,
} from "@react-router/dev/routes";

/**
 * Route tree, declared once and mounted for every language via `prefix()`. Paths are
 * language-agnostic; `am` (the default) lives at the root, `ru`/`en` get a prefix.
 * Mirrors the data-driven structure `app/App.jsx` used to build by hand out of JSX
 * `<Route>` elements — `routes.ts` is plain TS, so the same "build it once, cross with
 * languages" approach carries over, just through `route()`/`layout()`/`prefix()`.
 *
 * React Router derives each route's id from its file path by default, so the same file
 * mounted more than once (every content page across 3 languages, both shell layouts
 * across 4 mount points) needs an explicit, unique `id` — otherwise the config throws
 * "duplicate route id" for the second occurrence of any reused file.
 */
const SUPPORTED_LANGUAGE_CODES = ["am", "ru", "en"];
const DEFAULT_LANGUAGE_CODE = "am";
const PREFIXED_LANGUAGES = SUPPORTED_LANGUAGE_CODES.filter(
  (code) => code !== DEFAULT_LANGUAGE_CODE,
);

/** Routes rendered inside the "white" shell, one call per language via `contentRoutes(lang)`. */
const contentRoutes = (lang: string): RouteConfigEntry[] => [
  index("pages/home/ui/HomePage.jsx", { id: `home-${lang}` }),
  route("singleproduct", "app/routes/singleProductLegacyRedirect.js", {
    id: `singleproduct-legacy-${lang}`,
  }),
  route("singleproduct/:productId", "pages/singleproduct/ui/SingleProduct.jsx", {
    id: `singleproduct-${lang}`,
  }),
  route("filter", "pages/filterproduct/ui/FilterProduct.jsx", { id: `filter-${lang}` }),
  route("login", "app/routes/loginRedirect.js", { id: `login-${lang}` }),
  route("favorites", "app/routes/favoritesRedirect.js", { id: `favorites-${lang}` }),
  route("session/login", "app/routes/sessionLoginAction.js", { id: `session-login-${lang}` }),
  route("session/logout", "app/routes/sessionLogoutAction.js", { id: `session-logout-${lang}` }),
  route("about", "pages/about/ui/AboutPage.jsx", { id: `about-${lang}` }),
  route("catalog", "pages/catalog/ui/CatalogPage.jsx", { id: `catalog-${lang}` }),
  route("compare", "pages/compare/ui/ComparePage.jsx", { id: `compare-${lang}` }),
  /**
   * The generated "X vs Y" pages. Ranks above the catch-all `*` and below the static
   * `compare`, so `/compare` still reaches the landing page and an unknown pair slug reaches
   * this route's loader — which 404s it deliberately — rather than the generic not-found.
   */
  route("compare/:pairSlug", "pages/compare/ui/ComparePairPage.jsx", {
    id: `compare-pair-${lang}`,
  }),
  route("products", "pages/products/ui/ProductsPage.jsx", { id: `products-${lang}` }),
  route("variety", "pages/variety/ui/VarietyPage.jsx", { id: `variety-${lang}` }),
  route("privacy-policy", "pages/privacy-policy/ui/PrivacyPolicyPage.jsx", {
    id: `privacy-policy-${lang}`,
  }),
  route("terms-of-service", "pages/terms-of-service/ui/TermsOfServicePage.jsx", {
    id: `terms-of-service-${lang}`,
  }),
];

/**
 * `/*` covers every tab (`/account/favorite`, `/account/recent`, ...) with one route —
 * the presenters already derive the active tab from `location.pathname` themselves
 * (see `sidebarIdFromPathname` in `useAccountPresenter`). The more specific
 * `/account/shop-account/*` ranks above the plain `/account/*` for those URLs.
 */
const accountRoutes = (lang: string): RouteConfigEntry[] => [
  route("account/*", "pages/account/ui/AccountPage.jsx", { id: `account-${lang}` }),
  route("account/shop-account/*", "pages/shop-account/ui/ShopAccountPage.jsx", {
    id: `shop-account-${lang}`,
  }),
];

const shellBranch = (lang: string): RouteConfigEntry[] => [
  layout(
    "widgets/site-shell/ui/SiteShellWhite.jsx",
    { id: `shell-white-${lang}` },
    contentRoutes(lang),
  ),
  layout(
    "widgets/site-shell/ui/SiteShellSubtle.jsx",
    { id: `shell-subtle-${lang}` },
    accountRoutes(lang),
  ),
];

const routes: RouteConfigEntry[] = [
  ...shellBranch(DEFAULT_LANGUAGE_CODE),
  ...PREFIXED_LANGUAGES.flatMap((language) => prefix(language, shellBranch(language))),
  /** Resource routes — XML/text responses, no page component, so no shell wrapper. */
  route("sitemap.xml", "app/routes/sitemap.ts", { id: "sitemap" }),
  route("robots.txt", "app/routes/robots.ts", { id: "robots" }),
  layout("widgets/site-shell/ui/SiteShellWhite.jsx", { id: "shell-white-not-found" }, [
    route("*", "pages/not-found/ui/NotFoundPage.jsx", { id: "not-found" }),
  ]),
];

export default routes satisfies RouteConfig;
