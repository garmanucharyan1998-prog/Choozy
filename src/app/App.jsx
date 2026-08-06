import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AccountPage } from "pages/account";
import { ShopAccountPage } from "pages/shop-account";
import { HomePage } from "pages/home";
import { FilterProduct } from "pages/filterproduct";
import { LanguageProvider } from "contexts";
import { SingleProduct } from "pages/singleproduct";
import { getDefaultProductDetailPath } from "entities/product-detail";
import { ScrollToTopButton, ScrollToTopOnNavigate } from "shared/ui/scroll-to-top";

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

const UnknownRoute = () => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4 font-sans text-center text-text-dark">
    <h1 className="m-0 text-lg font-normal">No page at this address.</h1>
    <p className="text-text-muted">
      <Link className="text-link-blue underline" to="/">
        Home
      </Link>
      <span aria-hidden="true"> · </span>
      <Link className="text-link-blue underline" to={getDefaultProductDetailPath()}>
        Single product
      </Link>
      <span aria-hidden="true"> · </span>
      <Link className="text-link-blue underline" to="/filter">
        Filter catalog
      </Link>
    </p>
  </div>
);

const App = () => (
  <LanguageProvider>
    <BrowserRouter>
      <RouteRenderErrorBoundary>
        <ScrollToTopOnNavigate />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/singleproduct" element={<Navigate to={getDefaultProductDetailPath()} replace />} />
          <Route path="/singleproduct/:productId" element={<SingleProduct />} />
          <Route path="/filter" element={<FilterProduct />} />
          <Route path="/login" element={<Navigate to="/account" replace />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/favorite" element={<AccountPage />} />
          <Route path="/account/recent" element={<AccountPage />} />
          <Route path="/account/subscription" element={<AccountPage />} />
          <Route path="/account/notifications" element={<AccountPage />} />
          <Route path="/account/shop-account/products" element={<ShopAccountPage />} />
          <Route path="/account/shop-account/statistics" element={<ShopAccountPage />} />
          <Route path="/account/shop-account/finance" element={<ShopAccountPage />} />
          <Route path="/account/shop-account" element={<ShopAccountPage />} />
          <Route path="*" element={<UnknownRoute />} />
        </Routes>
        <ScrollToTopButton />
      </RouteRenderErrorBoundary>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
