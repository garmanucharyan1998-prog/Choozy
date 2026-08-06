import { useMemo } from "react";
import { useLanguage } from "contexts";
import { useProductOffersPresenter } from "features/product-offers";
import { YerevanMap } from "shared/ui/yerevan-map";

const ProductOffersMapWidget = () => {
  const { t } = useLanguage();
  const { specsRows, mapCenter, mapMarkers } = useProductOffersPresenter();

  const markersWithTitles = useMemo(
    () =>
      mapMarkers.map((marker) => ({
        ...marker,
        title: t(marker.titleKey),
      })),
    [mapMarkers, t],
  );

  return (
    <section aria-labelledby="product-offers-map-title">
      <h2 id="product-offers-map-title" className="sr-only">
        {t("productOffers.sectionAriaLabel")}
      </h2>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 lg:items-stretch">
        <div
          className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border-blue p-4 md:p-6"
          style={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
        >
          <div className="flex flex-col gap-2">
            <h3 className="m-0 text-lg font-semibold text-text-dark md:text-xl">
              {t("productDetail.title")}
            </h3>
            <h4 className="m-0 text-sm font-semibold text-navy md:text-base">
              {t("productOffers.tabs.specs")}
            </h4>
          </div>

          <dl className="m-0 flex flex-col gap-4">
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
        </div>

        <div className="relative z-[9] min-h-[320px] overflow-hidden rounded-2xl border border-border-blue bg-card-bg lg:min-h-0">
          <div className="absolute inset-0">
            <YerevanMap
              center={mapCenter}
              zoom={mapCenter.zoom}
              markers={markersWithTitles}
              ariaLabel={t("productOffers.map.ariaLabel")}
              layoutKey="specs"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductOffersMapWidget;
