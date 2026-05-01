import { useMemo } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useLanguage } from "contexts";
import { useProductOffersPresenter } from "features/product-offers";
import { YerevanMap } from "shared/ui/yerevan-map";

const TAB_BUTTON_BASE =
  "rounded-full px-5 py-2 text-sm font-semibold transition-colors md:text-base";
const TAB_ACTIVE = "border border-transparent text-navy";
const TAB_IDLE = "border border-transparent bg-transparent text-text-muted hover:text-navy";
const TAB_ACTIVE_STYLE = { backgroundColor: "rgba(221, 227, 248, 1)" };

const ProductOffersMapWidget = () => {
  const { t } = useLanguage();
  const { activeTab, selectTab, offers, specsRows, mapCenter, mapMarkers } =
    useProductOffersPresenter();

  const markersWithTitles = useMemo(
    () =>
      mapMarkers.map((marker) => ({
        ...marker,
        title: t(marker.titleKey),
      })),
    [mapMarkers, t],
  );

  return (
    <section
      aria-labelledby="product-offers-map-title"
      className="mt-10 md:mt-14"
    >
      <h2 id="product-offers-map-title" className="sr-only">
        {t("productOffers.sectionAriaLabel")}
      </h2>

      <div
        role="tablist"
        aria-label={t("productOffers.tabsAriaLabel")}
        className="flex items-center gap-2"
      >
        <button
          type="button"
          role="tab"
          id="offers-tab-sites"
          aria-selected={activeTab === "sites"}
          aria-controls="offers-panel"
          className={`${TAB_BUTTON_BASE} ${activeTab === "sites" ? TAB_ACTIVE : TAB_IDLE}`}
          style={activeTab === "sites" ? TAB_ACTIVE_STYLE : undefined}
          onClick={() => selectTab("sites")}
        >
          {t("productOffers.tabs.sites")}
        </button>
        <button
          type="button"
          role="tab"
          id="offers-tab-specs"
          aria-selected={activeTab === "specs"}
          aria-controls="offers-panel"
          className={`${TAB_BUTTON_BASE} ${activeTab === "specs" ? TAB_ACTIVE : TAB_IDLE}`}
          style={activeTab === "specs" ? TAB_ACTIVE_STYLE : undefined}
          onClick={() => selectTab("specs")}
        >
          {t("productOffers.tabs.specs")}
        </button>
      </div>

      <hr className="my-4 border-0 border-t border-border-blue md:my-6" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:items-stretch">
        <div
          id="offers-panel"
          role="tabpanel"
          aria-labelledby={activeTab === "sites" ? "offers-tab-sites" : "offers-tab-specs"}
          className="min-w-0 rounded-2xl border border-border-blue p-4 md:p-6"
          style={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
        >
          <h3 className="m-0 text-lg font-semibold text-text-dark md:text-xl">
            {t("productDetail.title")}
          </h3>

          {activeTab === "sites" ? (
            <ul className="m-0 mt-5 list-none space-y-3 p-0">
              {offers.map((offer) => (
                <li
                  key={offer.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-semibold text-text-dark md:text-base">
                      {t(offer.shopNameKey)}
                    </p>
                    <p className="m-0 mt-1 text-xs text-text-muted md:text-sm">
                      {t(offer.variantKey)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-navy md:text-base">
                      {offer.priceFormatted} {t("productDetail.currencySuffix")}
                    </span>
                    <a
                      href={offer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-blue bg-white text-navy transition-colors hover:bg-hover-blue"
                      aria-label={t("productOffers.goToShopAria")}
                    >
                      <FaExternalLinkAlt className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <dl className="m-0 mt-5 flex flex-col gap-4">
              {specsRows.map((row) => (
                <div
                  key={row.labelKey}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt className="text-sm font-normal text-text-muted md:text-base">
                    {t(row.labelKey)}
                  </dt>
                  <dd className="m-0 text-sm font-semibold leading-snug text-text-dark md:text-base">
                    {t(row.valueKey)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="relative z-[9] min-h-[320px] overflow-hidden rounded-2xl border border-border-blue bg-card-bg lg:min-h-0">
          <div className="absolute inset-0">
            <YerevanMap
              center={mapCenter}
              zoom={mapCenter.zoom}
              markers={markersWithTitles}
              ariaLabel={t("productOffers.map.ariaLabel")}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductOffersMapWidget;
