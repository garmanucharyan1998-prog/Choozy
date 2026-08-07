import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "pages/home";
import { LanguageProvider, useLanguage } from "contexts";
import { NotFoundPage } from "pages/not-found";
import { SiteShell } from "widgets/site-shell";
import { getDefaultProductDetailPath } from "entities/product-detail";
import { ScrollToTopButton, ScrollToTopOnNavigate } from "shared/ui/scroll-to-top";
import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { localizedPath } from "shared/lib/locale";

/**
 * Route-level code splitting. The home page stays in the main bundle (it is the most
 * common entry point); everything else loads on demand, which keeps Leaflet, Recharts
 * and the account dashboards out of the initial download.
 */
const SingleProduct = lazy(() =>
  import("pages/singleproduct").then((m) => ({ default: m.SingleProduct })),
);
const FilterProduct = lazy(() =>
  import("pages/filterproduct").then((m) => ({ default: m.FilterProduct })),
);
const AccountPage = lazy(() => import("pages/account").then((m) => ({ default: m.AccountPage })));
const ShopAccountPage = lazy(() =>
  import("pages/shop-account").then((m) => ({ default: m.ShopAccountPage })),
);
const AboutPage = lazy(() => import("pages/about").then((m) => ({ default: m.AboutPage })));
const CatalogPage = lazy(() => import("pages/catalog").then((m) => ({ default: m.CatalogPage })));
const ComparePage = lazy(() => import("pages/compare").then((m) => ({ default: m.ComparePage })));
const ProductsPage = lazy(() =>
  import("pages/products").then((m) => ({ default: m.ProductsPage })),
);
const VarietyPage = lazy(() => import("pages/variety").then((m) => ({ default: m.VarietyPage })));
const PrivacyPolicyPage = lazy(() =>
  import("pages/privacy-policy").then((m) => ({ default: m.PrivacyPolicyPage })),
);
const TermsOfServicePage = lazy(() =>
  import("pages/terms-of-service").then((m) => ({ default: m.TermsOfServicePage })),
);

/** Languages that carry a URL prefix (the default one lives at the root). */
const PREFIXED_LANGUAGES = SUPPORTED_LANGUAGE_CODES.filter(
  (code) => code !== DEFAULT_LANGUAGE_CODE,
);

/**
 * Fallback markup for `RouteRenderErrorBoundary`, split out as a function component
 * because the boundary itself must be a class (only classes support
 * `getDerivedStateFromError`) and classes can't call the `useLanguage` hook.
 */
const RouteRenderErrorFallback = ({ error }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-[50vh] bg-white px-5 py-10 text-start font-sans">
      <p className="text-lg font-semibold text-red-700">{t("errorBoundary.heading")}</p>
      <p className="pt-1 text-sm text-text-muted">{t("errorBoundary.message")}</p>
      <pre className="max-w-[90vw] whitespace-pre-wrap break-words pt-3 text-sm text-[#333]">
        {String(error?.message || error)}
      </pre>
    </div>
  );
};

/**
 * Surfaces React render errors instead of a blank screen.
 */
class RouteRenderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <RouteRenderErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

/**
 * Lets keyboard users jump past the header, category bar and search before reaching
 * page content. Visible only while focused.
 */
const SkipToContentLink = () => {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
    >
      {t("a11y.skipToContent")}
    </a>
  );
};

/** `Navigate` that keeps the active language prefix. */
const LocalizedNavigate = ({ to, replace = true }) => {
  const { language } = useLanguage();
  return <Navigate to={localizedPath(to, language)} replace={replace} />;
};

/** Redirects legacy `/singleproduct` to the canonical default product URL. */
const DefaultProductRedirect = () => <LocalizedNavigate to={getDefaultProductDetailPath()} />;

/**
 * Route table, declared once and mounted for every language.
 * Paths are language-agnostic; the prefix is added when mounting.
 *
 * `shell` picks which `SiteShell` variant (see below) a route renders inside — every
 * route needs one, so the header/nav/footer chrome is never accidentally skipped
 * (that used to happen for the "coming soon" placeholders and the 404 page, which
 * had no chrome at all and no way back to the site short of the browser's back button).
 */
const ROUTE_DEFINITIONS = [
  { path: "/", element: <HomePage />, shell: "white" },
  { path: "/singleproduct", element: <DefaultProductRedirect />, shell: "white" },
  { path: "/singleproduct/:productId", element: <SingleProduct />, shell: "white" },
  { path: "/filter", element: <FilterProduct />, shell: "white" },
  { path: "/login", element: <LocalizedNavigate to="/account" />, shell: "white" },
  { path: "/favorites", element: <LocalizedNavigate to="/account/favorite" />, shell: "white" },
  /**
   * `/*` covers every tab (`/account/favorite`, `/account/recent`, ...) with one route
   * instead of five siblings — the presenter already derives the active tab from
   * `location.pathname` itself (see `sidebarIdFromPathname` in `useAccountPresenter`),
   * so route matching doesn't need to enumerate every sub-path. React Router ranks the
   * more specific `/account/shop-account/*` above this one, so it still wins for those URLs.
   */
  { path: "/account/*", element: <AccountPage />, shell: "subtle" },
  { path: "/account/shop-account/*", element: <ShopAccountPage />, shell: "subtle" },
  { path: "/about", element: <AboutPage />, shell: "white" },
  { path: "/catalog", element: <CatalogPage />, shell: "white" },
  { path: "/compare", element: <ComparePage />, shell: "white" },
  { path: "/products", element: <ProductsPage />, shell: "white" },
  { path: "/variety", element: <VarietyPage />, shell: "white" },
  { path: "/privacy-policy", element: <PrivacyPolicyPage />, shell: "white" },
  { path: "/terms-of-service", element: <TermsOfServicePage />, shell: "white" },
];

const SHELL_VARIANTS = ["white", "subtle"];

const prefixRoutePath = (language, path) => (path === "/" ? `/${language}` : `/${language}${path}`);

/** All language variants of a path: `["/", "/ru", "/en"]` for `"/"`. */
const LANGUAGE_VARIANTS = [null, ...PREFIXED_LANGUAGES];

/**
 * Builds the full nested route tree once, at module scope, instead of re-mapping
 * `ROUTE_DEFINITIONS` into `<Route>` elements on every render of `AppRoutes`.
 *
 * For each language variant, routes are grouped by `shell` under one `SiteShell`
 * layout route per variant, so the header/nav/footer instance is shared by every
 * page that needs the same chrome instead of one being mounted per page.
 */
const buildRouteTree = () => {
  const shellGroups = LANGUAGE_VARIANTS.flatMap((language) =>
    SHELL_VARIANTS.map((shell) => {
      const routesForGroup = ROUTE_DEFINITIONS.filter((route) => route.shell === shell);
      return (
        <Route
          key={`shell-${language ?? "default"}-${shell}`}
          element={<SiteShell mainBackground={shell} />}
        >
          {routesForGroup.map((route) => (
            <Route
              key={`${language ?? "default"}${route.path}`}
              path={language ? prefixRoutePath(language, route.path) : route.path}
              element={route.element}
            />
          ))}
        </Route>
      );
    }),
  );

  return [
    ...shellGroups,
    <Route key="not-found-shell" element={<SiteShell mainBackground="white" />}>
      <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ];
};

const ROUTE_TREE = buildRouteTree();

/**
 * `LanguageProvider` derives the language from the URL, so it must sit inside the router.
 */
const AppRoutes = () => (
  <LanguageProvider>
    <RouteRenderErrorBoundary>
      <SkipToContentLink />
      <ScrollToTopOnNavigate />
      {/* `null` fallback: prerendered pages hydrate instantly, and a spinner would only flash. */}
      <Suspense fallback={null}>
        <Routes>{ROUTE_TREE}</Routes>
      </Suspense>
      <ScrollToTopButton />
    </RouteRenderErrorBoundary>
  </LanguageProvider>
);

/**
 * Collapses a trailing slash (`/ru/filter/`) onto the canonical form so a page is never
 * reachable at two URLs.
 */
const CanonicalPathRedirect = ({ children }) => {
  const { pathname, search, hash } = useLocation();
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return <Navigate to={`${pathname.replace(/\/+$/, "")}${search}${hash}`} replace />;
  }
  return children;
};

const App = () => (
  <BrowserRouter>
    <CanonicalPathRedirect>
      <AppRoutes />
    </CanonicalPathRedirect>
  </BrowserRouter>
);

export default App;
