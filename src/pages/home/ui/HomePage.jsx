import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";
import { AboutUsWidget } from "widgets/about-us";
import { FooterWidget } from "widgets/footer";
import { GridCatalogWidget } from "widgets/grid-catalog";
import { HeaderWidget } from "widgets/header";
import { NavPanelWidget } from "widgets/nav-panel";
import { ServicesOverviewWidget } from "widgets/services-overview";
import { TopProductsWidget } from "widgets/top-products";
import { VarietyWidget } from "widgets/variety";
import { useHomePagePresenter } from "pages/home/presenter/useHomePagePresenter";

const HomePage = () => {
  const { t } = useLanguage();
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
    <div className="min-w-[320px] bg-white text-center">
      <PageSeo title={t("homePage.seoTitle")} description={t("homePage.seoDescription")} path="/" />
      <button
        type="button"
        className={`fixed inset-x-0 top-[var(--header-height,72px)] bottom-0 z-[65] m-0 cursor-pointer border-0 bg-black/45 p-0 transition-opacity duration-[400ms] ease-in-out appearance-none md:hidden ${
          isAnyMobilePanelOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeAllMobilePanels}
        aria-label={t("homePage.closeMobileBackdropAriaLabel")}
        aria-hidden={!isAnyMobilePanelOpen}
        tabIndex={isAnyMobilePanelOpen ? 0 : -1}
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

      <main className="bg-white px-2.5 sm:px-[15px] md:px-[30px] lg:px-[50px] 2xl:px-[100px]">
        <h1 className="sr-only">{t("homePage.mainHeading")}</h1>
        <GridCatalogWidget />
        <TopProductsWidget />
        <AboutUsWidget />
        <VarietyWidget />
        <ServicesOverviewWidget />
      </main>

      <FooterWidget />
    </div>
  );
};

export default HomePage;
