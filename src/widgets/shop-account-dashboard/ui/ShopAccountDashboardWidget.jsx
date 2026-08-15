import { FaPlus } from "react-icons/fa";
import { SHOP_SIDEBAR_IDS } from "entities/shop";
import { useShopAccountPresenter } from "features/shop-account";
import { LogoutConfirmDialog, useLogoutConfirm } from "features/session";
import { ConfirmDialog } from "shared/ui/confirm-dialog";
import ShopFinanceWidget from "widgets/shop-finance";
import ShopStatisticsWidget from "widgets/shop-statistics";
import { SellerSidebar } from "./SellerSidebar";
import { SellerStatusBanner } from "./SellerStatusBanner";
import { ShopDetailsSection } from "./ShopDetailsSection";
import { ShopProductsSection } from "./products/ShopProductsSection";
import { BUTTON_PRIMARY } from "./sellerUi";

/**
 * The page heading is the section the seller is on, because each section is its own URL
 * (`/account/shop-account/products`, `/statistics`, `/finance`). The heading it replaces said
 * "Shop page" on all four of them — true, and of no use to anyone (§9).
 */
const SECTION_TITLE_KEYS = {
  [SHOP_SIDEBAR_IDS.DETAILS]: "shopAccount.sidebar.details",
  [SHOP_SIDEBAR_IDS.PRODUCTS]: "shopAccount.sidebar.products",
  [SHOP_SIDEBAR_IDS.STATISTICS]: "shopAccount.sidebar.statistics",
  [SHOP_SIDEBAR_IDS.FINANCE]: "shopAccount.sidebar.finance",
};

/**
 * The seller workspace shell: identity and navigation on one side, the active section on the
 * other, and the dialogs that belong to the page as a whole.
 *
 * This file used to be 1,277 lines and owned everything — navigation, the profile form, the
 * notification feed, the product table, the add-product form, inline price editing, the status
 * toast and the logout dialog (§54). It is now composition and nothing else; each section is its
 * own component, and the data and mutations all come from one presenter.
 *
 * Capped at 1,560px rather than the site's 1,800: past that the product table's title column
 * grows without helping anyone read it. Wide screens get more rows on screen, not longer lines
 * (§48).
 */
const ShopAccountDashboardWidget = () => {
  const presenter = useShopAccountPresenter();
  const { t, activeSidebarId, sidebarIds, pendingDeleteProducts } = presenter;
  const { isConfirming: isConfirmingLogout, requestLogout, cancelLogout } = useLogoutConfirm();

  const renderSection = () => {
    switch (activeSidebarId) {
      case sidebarIds.PRODUCTS:
        return (
          <ShopProductsSection
            t={t}
            products={presenter.shopProducts}
            showProductForm={presenter.showProductForm}
            editingProductId={presenter.editingProductId}
            productDraft={presenter.productDraft}
            formErrorKey={presenter.formErrorKey}
            catalogProductsForDraft={presenter.catalogProductsForDraft}
            selectedCatalogProduct={presenter.selectedCatalogProduct}
            openProductForm={presenter.openProductForm}
            openProductEdit={presenter.openProductEdit}
            cancelProductForm={presenter.cancelProductForm}
            submitProductForm={presenter.submitProductForm}
            updateProductPrice={presenter.updateProductPrice}
            selectProductCategory={presenter.selectProductCategory}
            selectCatalogProduct={presenter.selectCatalogProduct}
            setProductAvailability={presenter.setProductAvailability}
            toggleProductMemory={presenter.toggleProductMemory}
            toggleProductColor={presenter.toggleProductColor}
            refreshShopProduct={presenter.refreshShopProduct}
            refreshShopProducts={presenter.refreshShopProducts}
            justRefreshedIds={presenter.justRefreshedIds}
            updateShopProductPrice={presenter.updateShopProductPrice}
            requestDeleteProducts={presenter.requestDeleteProducts}
          />
        );
      case sidebarIds.STATISTICS:
        return <ShopStatisticsWidget />;
      case sidebarIds.FINANCE:
        return <ShopFinanceWidget />;
      case sidebarIds.DETAILS:
      default:
        return (
          <ShopDetailsSection
            t={t}
            shopState={presenter.shopState}
            shopInnerTab={presenter.shopInnerTab}
            innerTabs={presenter.innerTabs}
            onSelectInnerTab={presenter.selectShopInnerTab}
            notificationsPageTab={presenter.notificationsPageTab}
            notificationsTabs={presenter.notificationsTabs}
            onSelectNotificationsTab={presenter.setNotificationsPageTab}
            isShopEditMode={presenter.isShopEditMode}
            onEnterEdit={presenter.enterShopEdit}
            onExitEdit={presenter.exitShopEdit}
            profileDraft={presenter.profileDraft}
            profileErrorKey={presenter.profileErrorKey}
            onUpdateProfileDraft={presenter.updateProfileDraft}
            onUpdateDescription={presenter.updateDescriptionDraft}
            onUpdatePhoneLocal={presenter.updatePhoneLocal}
            onSaveProfile={presenter.saveShopProfile}
            onAvatarFile={presenter.setAvatarFromFile}
            isAvatarUploading={presenter.isAvatarUploading}
            onClearAvatar={presenter.clearAvatar}
            onToggleNotification={presenter.toggleShopNotification}
            formattedPhone={presenter.formattedPhone}
            displayWebsiteHref={presenter.displayWebsiteHref}
          />
        );
    }
  };

  const deleteCount = pendingDeleteProducts.length;

  return (
    <section className="w-full min-w-0 py-4 md:py-6" aria-labelledby="shop-account-page-heading">
      <div className="mx-auto w-full min-w-0 max-w-[1560px]">
        <div className="flex min-w-0 flex-col gap-4 md:gap-5 lg:flex-row lg:items-start lg:gap-6">
          {/*
            212px at `lg`, not 248: a 1024px laptop has 924px of page here, and every pixel the
            rail does not take is a pixel the product title column gets.
          */}
          <aside className="w-full min-w-0 shrink-0 lg:w-[212px] xl:w-[240px]">
            <SellerSidebar
              t={t}
              shopState={presenter.shopState}
              activeSidebarId={activeSidebarId}
              onSelect={presenter.selectSidebar}
              onRequestLogout={requestLogout}
            />
          </aside>

          <div className="min-w-0 flex-1">
            {/*
              One page header for every section: the section's own name, and — where the section
              has one — its primary action beside it. "Add product" is a button in a header, not
              the full-width navy bar that used to be the largest thing on a page about listings
              that already exist (§10).
            */}
            <header className="mb-4 flex flex-col gap-3 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
              <h1
                id="shop-account-page-heading"
                className="m-0 min-w-0 text-xl font-bold text-navy md:text-2xl"
              >
                {t(SECTION_TITLE_KEYS[activeSidebarId] ?? SECTION_TITLE_KEYS[sidebarIds.DETAILS])}
              </h1>
              {activeSidebarId === sidebarIds.PRODUCTS ? (
                <button
                  type="button"
                  onClick={presenter.openProductForm}
                  className={`${BUTTON_PRIMARY} w-full shrink-0 min-[560px]:w-auto`}
                >
                  <FaPlus className="h-3 w-3" aria-hidden="true" />
                  {t("shopAccount.products.addProduct")}
                </button>
              ) : null}
            </header>

            <SellerStatusBanner
              status={presenter.status}
              onDismiss={presenter.dismissStatus}
              t={t}
            />
            {renderSection()}
          </div>
        </div>
      </div>

      <LogoutConfirmDialog isOpen={isConfirmingLogout} onCancel={cancelLogout} />

      {/*
        Deleting a listing is the one action here that cannot be undone by repeating it, so it
        always goes through this — naming the listing when there is one, and the count when the
        seller asked for several (§23).
      */}
      <ConfirmDialog
        isOpen={deleteCount > 0}
        title={
          deleteCount === 1
            ? t("shopAccount.products.deleteConfirm.title")
            : t("shopAccount.products.deleteConfirm.titleMany").replace(
                "{{count}}",
                String(deleteCount),
              )
        }
        body={
          deleteCount === 1 ? (
            <>
              <strong className="font-semibold text-navy">{pendingDeleteProducts[0]?.title}</strong>
              <span className="block pt-1">{t("shopAccount.products.deleteConfirm.body")}</span>
            </>
          ) : (
            t("shopAccount.products.deleteConfirm.bodyMany")
          )
        }
        confirmLabel={t("shopAccount.products.deleteConfirm.confirm")}
        cancelLabel={t("shopAccount.actions.cancel")}
        onConfirm={presenter.confirmDeleteProducts}
        onCancel={presenter.cancelDeleteProducts}
      />
    </section>
  );
};

export default ShopAccountDashboardWidget;
