import { useEffect, useRef } from "react";
import { FaChevronDown, FaStar } from "react-icons/fa";
import { useLanguage } from "contexts";
import { useBestOffersPresenter } from "features/best-offers";

const VARIANT_PILL_BASE =
  "shrink-0 whitespace-nowrap rounded-md border px-2.5 py-2 text-xs font-medium transition-colors md:max-lg:px-2 md:max-lg:py-1.5 md:max-lg:text-[11px] lg:px-3 lg:py-2 lg:text-sm";
const VARIANT_PILL_ACTIVE = "border-2 border-navy text-navy bg-white";
const VARIANT_PILL_IDLE = "border-border-blue text-text-dark bg-white hover:border-link-blue";

const COLOR_SWATCH_BASE =
  "relative inline-flex h-7 w-7 items-center justify-center rounded-full transition-shadow";

/* 2xl / 1440px+ only — logo | badge+url | description | memory+colors (right) | price */
const ALIGNED_ROW_CLASS =
  "hidden border-b border-border-blue 2xl:grid 2xl:min-h-[5.75rem] 2xl:grid-cols-[4.5rem_7.5rem_minmax(12rem,16rem)_1fr_auto] 2xl:items-center 2xl:gap-x-5 2xl:py-5";

const ALIGNED_LOGO_BOX_CLASS =
  "flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-lg border border-border-blue bg-white p-2";

const ALIGNED_META_CLASS = "flex min-h-[4.5rem] min-w-0 flex-col justify-center gap-1";

const ALIGNED_DESC_CELL_CLASS = "flex min-w-0 items-center self-center";

const ALIGNED_DESC_CLASS =
  "m-0 min-w-0 line-clamp-2 overflow-hidden text-ellipsis text-[15px] leading-[1.35] text-text-muted";

/** 1440px only: memory centered in flex space; colors stay on the right. */
const DESKTOP_OPTIONS_CELL_CLASS =
  "flex min-w-0 flex-1 items-center justify-self-stretch gap-5 2xl:gap-6";

const ALIGNED_MEMORY_WRAP_CLASS = "flex min-w-0 flex-1 items-center justify-center";

const ALIGNED_VARIANTS_CLASS = "flex shrink-0 flex-nowrap items-center justify-center gap-1.5";

const COLORS_GRID_1440_CLASS =
  "grid w-fit shrink-0 grid-cols-3 place-items-center gap-x-2 gap-y-1.5";

/** Tablet / mobile / 1024px: single horizontal color row. */
const COLORS_ROW_ONE_LINE_CLASS = "flex shrink-0 flex-nowrap items-center justify-start gap-2";

const ALIGNED_VARIANT_PILL =
  "box-border min-h-[2.375rem] shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition-colors";

const ALIGNED_PRICE_CELL_CLASS =
  "flex min-w-0 items-center justify-end justify-self-end self-center";

const SHOP_META_COLUMN_CLASS = "flex min-w-0 flex-col justify-center gap-1";

/** Min-height matches sibling logo box so URL centers when badge is missing. */
const SHOP_META_H_14_CLASS = `${SHOP_META_COLUMN_CLASS} min-h-14`;
const MOBILE_SHOP_META_CLASS = SHOP_META_H_14_CLASS;

const MOBILE_OPTIONS_STACK_CLASS = "flex w-max max-w-full flex-col items-start gap-3";

const MOBILE_COLORS_ROW_CLASS = COLORS_ROW_ONE_LINE_CLASS;

/* Stacked card below 1440px (mobile + tablet, e.g. 1044px) */
const MOBILE_ROW_CLASS = "flex flex-col gap-4 border-b border-border-blue py-4 2xl:hidden";

const MOBILE_LOGO_BOX_CLASS =
  "flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border-blue bg-white p-1.5";

const MOBILE_PRICE_CLASS = "text-xl font-semibold text-text-dark";

const MOBILE_DESC_CLASS =
  "m-0 line-clamp-3 overflow-hidden text-ellipsis text-sm leading-snug text-text-muted";

const OFFER_SHOP_LINK_CLASS =
  "text-sm font-semibold leading-snug text-link-blue underline-offset-2 hover:underline";

const OFFER_PRICE_TEXT_CLASS =
  "whitespace-nowrap text-sm font-bold text-text-dark md:max-lg:text-base lg:text-lg 2xl:text-xl";

const SEE_MORE_BTN_CLASS =
  "inline-flex items-center gap-2 rounded-full border border-link-blue px-5 py-2 text-sm font-semibold text-link-blue transition-colors hover:bg-hover-blue md:text-base";

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
    canShowLess,
    toggleSortOpen,
    closeSort,
    selectSort,
    selectVariantForOffer,
    selectColorForOffer,
    loadMore,
    showLess,
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

  const renderBadge = (badgeKey) =>
    badgeKey ? (
      <span
        className="inline-flex w-max items-center rounded-md px-2 py-0.5 text-[11px] font-semibold md:text-xs"
        style={BADGE_STYLES[badgeKey]}
      >
        {t(badgeKey)}
      </span>
    ) : null;

  const renderLogoMark = (logoLabel, boxClassName) => (
    <div className={boxClassName}>
      <span className="text-center text-xs font-bold uppercase tracking-tight text-navy sm:text-sm">
        {logoLabel}
      </span>
    </div>
  );

  /**
   * The shop's own score, which is also what the "shop rating" sort option orders by — a sort
   * criterion the visitor cannot see on the rows is indistinguishable from a random shuffle.
   * `en-US` grouping rather than the visitor's locale so the server render and the client's
   * first paint agree (same reason `formatAmd` pins its locale).
   */
  const renderShopRating = (offer) => {
    const score = offer.shopRatingValue.toFixed(1);
    const reviews = offer.shopReviewCount.toLocaleString("en-US");
    return (
      <p
        className="m-0 flex items-center gap-1 whitespace-nowrap text-[11px] leading-none text-text-muted"
        title={`${t("productOffers.bestOffers.shopRatingLabel")} ${score} · ${reviews} ${t(
          "productOffers.bestOffers.shopReviewsLabel",
        )}`}
      >
        <span className="sr-only">{t("productOffers.bestOffers.shopRatingLabel")}</span>
        <FaStar className="h-2.5 w-2.5 text-[rgba(242,201,76,1)]" aria-hidden />
        <span className="font-semibold text-text-dark">{score}</span>
        <span>({reviews})</span>
      </p>
    );
  };

  const renderShopMeta = (offer, metaClassName) => (
    <div className={metaClassName}>
      {offer.badgeKey ? renderBadge(offer.badgeKey) : null}
      {/*
        Commercial outbound links: `nofollow sponsored` keeps them from passing ranking
        signals. No `aria-label` — it used to override the visible shop name, so every
        offer link was announced identically ("go to shop").
      */}
      <a
        href={offer.url}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className={OFFER_SHOP_LINK_CLASS}
      >
        {offer.shopUrlLabel}
      </a>
      {renderShopRating(offer)}
    </div>
  );

  const renderVariantPills = (offer, activeVariantIndex) => (
    <div
      role="group"
      aria-label={t("productOffers.bestOffers.variantsAriaLabel")}
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      {offer.variants.map((variant, variantIndex) => (
        <button
          key={`${offer.id}-${variant.id}`}
          type="button"
          onClick={() => selectVariantForOffer(offer.id, variantIndex)}
          aria-pressed={activeVariantIndex === variantIndex}
          className={`${VARIANT_PILL_BASE} ${
            activeVariantIndex === variantIndex ? VARIANT_PILL_ACTIVE : VARIANT_PILL_IDLE
          }`}
        >
          {variant.label}
        </button>
      ))}
    </div>
  );

  const renderOfferDescription = (descriptionKey, className) => {
    const text = t(descriptionKey).replace(/\s+/g, " ").trim();
    return (
      <p className={className} title={text}>
        {text}
      </p>
    );
  };

  const renderColorRow = (offer, colorIndex, rowClassName = COLORS_ROW_ONE_LINE_CLASS) => (
    <div
      role="group"
      aria-label={t("productOffers.bestOffers.colorsAriaLabel")}
      className={rowClassName}
    >
      {offer.colors.map((color, index) => {
        const isActive = colorIndex === index;
        return (
          <button
            key={`${offer.id}-${color.id}-${index}`}
            type="button"
            onClick={() => selectColorForOffer(offer.id, index)}
            aria-pressed={isActive}
            aria-label={t(`filterPage.filters.colorNames.${color.id}`, color.id)}
            title={t(`filterPage.filters.colorNames.${color.id}`, color.id)}
            className={`${COLOR_SWATCH_BASE} ${
              isActive ? "ring-2 ring-offset-2 ring-[rgba(242,201,76,1)]" : ""
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
  );

  const renderPrice = (offer, className = OFFER_PRICE_TEXT_CLASS) => (
    <span className={className}>
      {offer.priceFormatted} {t("productDetail.currencySuffix")}
    </span>
  );

  const renderAlignedOfferRow = ({ borderClass, offer, activeVariantIndex, colorIndex }) => (
    <div className={`${ALIGNED_ROW_CLASS} ${borderClass}`}>
      {renderLogoMark(offer.logoLabel, ALIGNED_LOGO_BOX_CLASS)}

      {renderShopMeta(offer, ALIGNED_META_CLASS)}

      <div className={ALIGNED_DESC_CELL_CLASS}>
        {renderOfferDescription(offer.descriptionKey, ALIGNED_DESC_CLASS)}
      </div>

      <div className={DESKTOP_OPTIONS_CELL_CLASS}>
        <div className={ALIGNED_MEMORY_WRAP_CLASS}>
          <div className={ALIGNED_VARIANTS_CLASS}>
            {offer.variants.map((variant, variantIndex) => (
              <button
                key={`${offer.id}-aligned-${variant.id}`}
                type="button"
                onClick={() => selectVariantForOffer(offer.id, variantIndex)}
                aria-pressed={activeVariantIndex === variantIndex}
                className={`${ALIGNED_VARIANT_PILL} ${
                  activeVariantIndex === variantIndex ? VARIANT_PILL_ACTIVE : VARIANT_PILL_IDLE
                }`}
              >
                {variant.label}
              </button>
            ))}
          </div>
        </div>
        {renderColorRow(offer, colorIndex, COLORS_GRID_1440_CLASS)}
      </div>

      <div className={ALIGNED_PRICE_CELL_CLASS}>{renderPrice(offer)}</div>
    </div>
  );

  return (
    <section aria-labelledby="best-offers-title">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="best-offers-title" className="m-0 text-xl font-semibold text-text-dark md:text-2xl">
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
            <span className="text-text-muted">{t("productOffers.bestOffers.sortBy")}</span>
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
              className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 list-none rounded-xl border border-border-blue bg-white p-1 shadow-lg"
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

      <hr className="mb-4 border-0 border-t border-border-blue pt-4 md:mb-6 md:pt-6" />

      <ul
        className="m-0 flex list-none flex-col p-0"
        aria-label={t("productOffers.bestOffers.tableAriaLabel")}
      >
        {offers.map((offer, index) => {
          const selection = selections[offer.id] ?? {
            variantIndex: offer.activeVariantIndex ?? offer.defaultVariantIndex ?? 0,
            colorIndex: offer.defaultColorIndex ?? 0,
          };
          const activeVariantIndex = offer.activeVariantIndex ?? selection.variantIndex;
          const colorIndex = selection.colorIndex;
          const isLast = index === offers.length - 1;
          const borderClass = isLast ? "border-b-0" : "";

          return (
            <li key={offer.id}>
              {/* 1440px+ (2xl) */}
              {renderAlignedOfferRow({
                borderClass,
                offer,
                activeVariantIndex,
                colorIndex,
              })}

              {/*
                Two layouts, not four. The former "lg" and "md" rows carried both
                `hidden` and a `*:hidden` utility, so they never displayed at any width
                while still rendering — every offer (and its shop link) appeared in the
                DOM four times. Below 1440px the stacked card below is what shows.
              */}

              {/* Stacked card below 2xl (mobile + tablet, e.g. 1044px) */}
              <div className={`${MOBILE_ROW_CLASS} ${borderClass}`}>
                <div className="flex items-center gap-3">
                  {renderLogoMark(offer.logoLabel, MOBILE_LOGO_BOX_CLASS)}
                  {renderShopMeta(offer, MOBILE_SHOP_META_CLASS)}
                </div>

                <p className={MOBILE_PRICE_CLASS}>
                  {offer.priceFormatted} {t("productDetail.currencySuffix")}
                </p>

                {renderOfferDescription(offer.descriptionKey, MOBILE_DESC_CLASS)}

                <div className={MOBILE_OPTIONS_STACK_CLASS}>
                  {renderVariantPills(offer, activeVariantIndex)}
                  {renderColorRow(offer, colorIndex, MOBILE_COLORS_ROW_CLASS)}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {canLoadMore || canShowLess ? (
        <div className="flex justify-center pt-4 md:justify-end">
          {canShowLess ? (
            <button type="button" onClick={showLess} className={SEE_MORE_BTN_CLASS}>
              {t("productOffers.bestOffers.seeLess")}
            </button>
          ) : null}
          {canLoadMore ? (
            <button type="button" onClick={loadMore} className={SEE_MORE_BTN_CLASS}>
              {t("productOffers.bestOffers.seeMore")}
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default BestOffersWidget;
