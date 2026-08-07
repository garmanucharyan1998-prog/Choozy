import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HomePage } from "pages/home";
import { LanguageProvider, useLanguage } from "contexts";
import { NotFoundPage } from "pages/not-found";
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
const ProductsPage = lazy(() => import("pages/products").then((m) => ({ default: m.ProductsPage })));
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
      return (
        <div className="min-h-[50vh] bg-white px-5 py-10 text-start font-sans">
          <p className="text-lg font-semibold text-red-700">Something went wrong while rendering this page.</p>
          <pre className="max-w-[90vw] whitespace-pre-wrap break-words pt-3 text-sm text-[#333]">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
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
 */
const ROUTE_DEFINITIONS = [
  { path: "/", element: <HomePage /> },
  { path: "/singleproduct", element: <DefaultProductRedirect /> },
  { path: "/singleproduct/:productId", element: <SingleProduct /> },
  { path: "/filter", element: <FilterProduct /> },
  { path: "/login", element: <LocalizedNavigate to="/account" /> },
  { path: "/favorites", element: <LocalizedNavigate to="/account/favorite" /> },
  { path: "/account", element: <AccountPage /> },
  { path: "/account/favorite", element: <AccountPage /> },
  { path: "/account/recent", element: <AccountPage /> },
  { path: "/account/subscription", element: <AccountPage /> },
  { path: "/account/notifications", element: <AccountPage /> },
  { path: "/account/shop-account", element: <ShopAccountPage /> },
  { path: "/account/shop-account/products", element: <ShopAccountPage /> },
  { path: "/account/shop-account/statistics", element: <ShopAccountPage /> },
  { path: "/account/shop-account/finance", element: <ShopAccountPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/catalog", element: <CatalogPage /> },
  { path: "/compare", element: <ComparePage /> },
  { path: "/products", element: <ProductsPage /> },
  { path: "/variety", element: <VarietyPage /> },
  { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
  { path: "/terms-of-service", element: <TermsOfServicePage /> },
];

const prefixRoutePath = (language, path) => (path === "/" ? `/${language}` : `/${language}${path}`);

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
        <Routes>
          {ROUTE_DEFINITIONS.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          {PREFIXED_LANGUAGES.flatMap((language) =>
            ROUTE_DEFINITIONS.map((route) => (
              <Route
                key={`${language}${route.path}`}
                path={prefixRoutePath(language, route.path)}
                element={route.element}
              />
            )),
          )}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
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
