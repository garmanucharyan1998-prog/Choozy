import { useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useLanguage } from "contexts";
import { useBestOffersPresenter } from "features/best-offers";

const VARIANT_PILL_BASE =
  "rounded-md border px-3 py-2 text-xs font-medium transition-colors md:text-sm";
const VARIANT_PILL_ACTIVE = "border-navy text-navy bg-white";
const VARIANT_PILL_IDLE = "border-border-blue text-text-dark bg-white hover:border-link-blue";

const COLOR_SWATCH_BASE =
  "relative inline-flex h-7 w-7 items-center justify-center rounded-full transition-shadow";

const BADGE_STYLES = {
  "productOffers.badges.discount": {
    backgroundColor: "rgba(255, 165, 58, 1)",
    color: "#ffffff",
  },
  "productOffers.badges.new": {
    backgroundColor: "rgba(99, 201, 120, 1)",
    color: "#ffffff",
  },
};

const BestOffersWidget = () => {
  const { t } = useLanguage();
  const {
    offers,
    selections,
    sortOptions,
    activeSortOption,
    isSortOpen,
    canLoadMore,
    toggleSortOpen,
    closeSort,
    selectSort,
    selectVariantForOffer,
    selectColorForOffer,
    loadMore,
  } = useBestOffersPresenter();

  const sortRef = useRef(null);

  useEffect(() => {
    if (!isSortOpen) return undefined;
    const handlePointerDown = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        closeSort();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isSortOpen, closeSort]);

  return (
    <section
      aria-labelledby="best-offers-title"
      className="mt-10 md:mt-14"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2
          id="best-offers-title"
          className="m-0 text-xl font-semibold text-text-dark md:text-2xl"
        >
          {t("productOffers.bestOffers.title")}
        </h2>

        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={toggleSortOpen}
            aria-haspopup="listbox"
            aria-expanded={isSortOpen}
            aria-label={t("productOffers.bestOffers.openSortAriaLabel")}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-dark transition-colors hover:text-link-blue md:text-base"
          >
            <span className="text-text-muted">
              {t("productOffers.bestOffers.sortBy")}
            </span>
            <span className="text-text-dark">{t(activeSortOption.labelKey)}</span>
            <FaChevronDown
              className={`h-3 w-3 transition-transform ${isSortOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {isSortOpen ? (
            <ul
              role="listbox"
              aria-label={t("productOffers.bestOffers.sortMenuAriaLabel")}
              className="absolute right-0 top-full z-20 mt-2 w-56 list-none rounded-xl border border-border-blue bg-white p-1 shadow-lg"
            >
              {sortOptions.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.id === activeSortOption.id}
                    onClick={() => selectSort(option.id)}
                    className={`block w-full rounded-lg px-3 py-2 text-start text-sm transition-colors ${
                      option.id === activeSortOption.id
                        ? "bg-hover-blue text-navy"
                        : "text-text-dark hover:bg-hover-blue"
                    }`}
                  >
                    {t(option.labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <hr className="my-4 border-0 border-t border-border-blue md:my-6" />

      <ul
        className="m-0 flex list-none flex-col p-0"
        aria-label={t("productOffers.bestOffers.tableAriaLabel")}
      >
        {offers.map((offer, index) => {
          const selection = selections[offer.id] ?? {
            variantIndex: offer.defaultVariantIndex ?? 0,
            colorIndex: offer.defaultColorIndex ?? 0,
          };
          const isLast = index === offers.length - 1;

          return (
            <li
              key={offer.id}
              className={`flex flex-wrap items-center gap-4 py-4 md:flex-nowrap md:gap-6 ${
                isLast ? "" : "border-b border-border-blue"
              }`}
            >
              <div className="flex w-20 shrink-0 items-center justify-center md:w-24">
                <span className="text-sm font-extrabold uppercase tracking-tight text-navy md:text-base">
                  {offer.logoLabel}
                </span>
              </div>

              <div className="flex min-w-0 flex-col gap-1 md:w-40 md:shrink-0">
                {offer.badgeKey ? (
                  <span
                    className="inline-flex w-max items-center rounded-md px-2 py-0.5 text-[11px] font-semibold md:text-xs"
                    style={BADGE_STYLES[offer.badgeKey]}
                  >
                    {t(offer.badgeKey)}
                  </span>
                ) : null}
                <a
                  href={offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-link-blue underline-offset-2 hover:underline md:text-base"
                  aria-label={t("productOffers.goToShopAria")}
                >
                  {offer.shopUrlLabel}
                </a>
              </div>

              <p className="m-0 min-w-0 flex-1 truncate text-sm text-text-muted md:text-base">
                {t(offer.descriptionKey)}
              </p>

              <div
                role="group"
                aria-label={t("productOffers.bestOffers.variantsAriaLabel")}
                className="flex shrink-0 flex-wrap items-center gap-2"
              >
                {offer.variantKeys.map((variantKey, variantIndex) => (
                  <button
                    key={variantKey + variantIndex}
                    type="button"
                    onClick={() => selectVariantForOffer(offer.id, variantIndex)}
                    aria-pressed={selection.variantIndex === variantIndex}
                    className={`${VARIANT_PILL_BASE} ${
                      selection.variantIndex === variantIndex
                        ? VARIANT_PILL_ACTIVE
                        : VARIANT_PILL_IDLE
                    }`}
                  >
                    {t(variantKey)}
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label={t("productOffers.bestOffers.colorsAriaLabel")}
                className="flex shrink-0 items-center gap-2"
              >
                {offer.colors.map((color, colorIndex) => {
                  const isActive = selection.colorIndex === colorIndex;
                  return (
                    <button
                      key={color.id + colorIndex}
                      type="button"
                      onClick={() => selectColorForOffer(offer.id, colorIndex)}
                      aria-pressed={isActive}
                      aria-label={color.id}
                      title={color.id}
                      className={`${COLOR_SWATCH_BASE} ${
                        isActive
                          ? "ring-2 ring-offset-2 ring-[rgba(242,201,76,1)]"
                          : ""
                      }`}
                    >
                      <span
                        className="block h-5 w-5 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto shrink-0 text-base font-semibold text-text-dark md:text-lg">
                {offer.priceFormatted} {t("productDetail.currencySuffix")}
              </div>
            </li>
          );
        })}
      </ul>

      {canLoadMore ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center gap-2 rounded-full border border-link-blue px-5 py-2 text-sm font-semibold text-link-blue transition-colors hover:bg-hover-blue md:text-base"
          >
            {t("productOffers.bestOffers.seeMore")}
          </button>
        </div>
      ) : null}
    </section>
  );
};

export default BestOffersWidget;
