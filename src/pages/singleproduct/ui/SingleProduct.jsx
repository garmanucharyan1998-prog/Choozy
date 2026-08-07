import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { ProductOffersVariantFilterProvider, useLanguage } from "contexts";
import { BestOffersWidget } from "widgets/best-offers";
import { FooterWidget } from "widgets/footer";
import { RelatedProductsWidget } from "widgets/related-products";
import { HeaderWidget } from "widgets/header";
import { NavPanelWidget } from "widgets/nav-panel";
import { ProductDetailWidget } from "widgets/product-detail";
import { ProductOffersMapWidget } from "widgets/product-offers-map";
import { NotFoundPage } from "pages/not-found";
import { PageSeo } from "shared/lib/seo";
import { Breadcrumbs } from "shared/ui/breadcrumbs";
import { getCanonicalProductDetailPath, getProductDetailForRoute } from "entities/product-detail";
import { buildProductJsonLd } from "pages/singleproduct/model/productJsonLd";
import { useHomePagePresenter } from "pages/home/presenter/useHomePagePresenter";

const formatAmd = (amount) => (typeof amount === "number" ? amount.toLocaleString("en-US") : "");

const SingleProduct = () => {
  const { productId } = useParams();
  const { t, language } = useLanguage();
  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);

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
    headerShellRef,
  } = useHomePagePresenter();

  const seo = useMemo(() => {
    if (!product) return null;
    const title = product.listingTitle || t("productDetail.title");
    return {
      title: t("seo.product.title").replace("{{title}}", title),
      description: t("seo.product.description")
        .replace("{{title}}", title)
        .replace("{{priceMin}}", formatAmd(product.priceMinAmd))
        .replace("{{priceMax}}", formatAmd(product.priceMaxAmd)),
      path: getCanonicalProductDetailPath(product),
      image: product.galleryImageUrls?.[0],
    };
  }, [product, t]);

  /** Unknown product ids must 404 rather than serve duplicate placeholder content. */
  if (!product || !seo) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex min-h-screen min-w-[320px] flex-col bg-white">
      <PageSeo
        title={seo.title}
        description={seo.description}
        path={seo.path}
        imagePath={seo.image}
        jsonLd={buildProductJsonLd({
          product,
          language,
          description: seo.description,
          catalogLabel: t("navPanel.catalogLabel"),
          homeLabel: t("footer.columns.primary.home"),
        })}
      />

      <div
        className={`fixed inset-x-0 top-[var(--header-height,72px)] bottom-0 z-[65] bg-black/45 transition-opacity duration-[400ms] ease-in-out md:hidden ${
          isAnyMobilePanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAllMobilePanels}
        aria-hidden="true"
      />

      <div className="header-shell-spacer sticky top-0 z-[70] shrink-0">
        <div
          ref={headerShellRef}
          className={`absolute inset-x-0 top-0 bg-white transition-all duration-300 ${
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
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 flex-col bg-white px-2.5 py-6 pb-[calc(var(--mobile-bottom-nav-height,0px)+24px)] text-start sm:px-[15px] md:px-[30px] md:py-10 lg:px-[50px] lg:pb-10 2xl:px-[100px]"
      >
        <ProductOffersVariantFilterProvider>
          <div className="cont-width-default mx-auto flex w-full flex-col gap-10 md:gap-14">
            <Breadcrumbs
              items={[
                { label: t("footer.columns.primary.home"), href: "/" },
                { label: t("navPanel.catalogLabel"), href: "/filter" },
                { label: product.listingTitle || t("productDetail.title") },
              ]}
            />
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
