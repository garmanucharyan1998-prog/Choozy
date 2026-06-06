import { ProductOffersVariantFilterProvider } from "contexts";
import { BestOffersWidget } from "widgets/best-offers";
import { FooterWidget } from "widgets/footer";
import { RelatedProductsWidget } from "widgets/related-products";
import { HeaderWidget } from "widgets/header";
import { NavPanelWidget } from "widgets/nav-panel";
import { ProductDetailWidget } from "widgets/product-detail";
import { ProductOffersMapWidget } from "widgets/product-offers-map";
import { useHomePagePresenter } from "pages/home/presenter/useHomePagePresenter";

const SingleProduct = () => {
  const {
    isCompactHeader,
    isMobileMenuOpen,
    isMobileCatalogOpen,
    isAnyMobilePanelOpen,
    toggleMobileMenu,
    closeMobileMenu,
    toggleMobileCatalog,
    closeMobileCatalog,
    closeAllMobilePanels,
  } = useHomePagePresenter();

  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-white">
      <div
        className={`fixed inset-x-0 top-[var(--header-height,72px)] bottom-0 z-[65] bg-black/45 transition-opacity duration-[400ms] ease-in-out md:hidden ${
          isAnyMobilePanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMobilePanels}
        aria-hidden="true"
      />

      <div
        className={`sticky top-0 z-[70] relative bg-white transition-all duration-300 ${
          isCompactHeader ? "shadow-[0_6px_18px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <HeaderWidget
          isCompact={isCompactHeader}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={toggleMobileMenu}
          onCloseMobileMenu={closeMobileMenu}
        />
        <div
          className={`absolute inset-x-0 top-[var(--header-height,72px)] bottom-0 z-[5] bg-black/35 transition-opacity duration-[400ms] ease-in-out pointer-events-none md:hidden ${
            isAnyMobilePanelOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />
        <NavPanelWidget
          isCompact={isCompactHeader}
          isMobileCatalogOpen={isMobileCatalogOpen}
          onToggleMobileCatalog={toggleMobileCatalog}
          onCloseMobileCatalog={closeMobileCatalog}
        />
      </div>

      <main className="flex flex-1 flex-col bg-white px-2.5 py-6 text-start sm:px-[15px] md:px-[30px] md:py-10 lg:px-[50px] 2xl:px-[100px]">
        <ProductOffersVariantFilterProvider>
          <div className="cont-width-default mx-auto w-full">
            <ProductDetailWidget />
            <ProductOffersMapWidget />
            <BestOffersWidget />
            <RelatedProductsWidget />
          </div>
        </ProductOffersVariantFilterProvider>
      </main>

      <div className="mt-auto shrink-0">
        <FooterWidget />
      </div>
    </div>
  );
};

export default SingleProduct;
