import { useMemo, useRef } from "react";
import { useProductDetailPresenter } from "features/product-detail";
import { useLanguage } from "contexts";
import { BREAKPOINTS } from "shared/config/breakpoints";
import { PriceHistoryChart } from "shared/ui/price-history-chart";
import { ProgressiveImage } from "shared/ui/progressive-image";
import { FaBalanceScale, FaHeart, FaRegHeart } from "react-icons/fa";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const THUMB_WRAP =
  "relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-card-bg transition-colors";
const THUMB_ACTIVE = "border-navy ring-2 ring-offset-1 ring-navy";
const THUMB_IDLE = "border-transparent hover:border-border-blue";

const CHART_MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
const SWIPER_MODULES = [Navigation];
const SWIPER_THUMB_BREAKPOINTS = {
  [BREAKPOINTS.sm]: { slidesPerView: 4 },
  [BREAKPOINTS.md]: { slidesPerView: 5 },
  [BREAKPOINTS.lg]: { slidesPerView: 4 },
};

const getTrailingMonthKeys = (count = 5, date = new Date()) => {
  const currentMonthIndex = date.getMonth();
  return Array.from({ length: count }, (_, index) => {
    const offset = count - 1 - index;
    const monthIndex =
      (currentMonthIndex - offset + CHART_MONTH_KEYS.length) % CHART_MONTH_KEYS.length;
    return CHART_MONTH_KEYS[monthIndex];
  });
};

const ProductDetailWidget = () => {
  const thumbSwiperRef = useRef(null);
  const { t } = useLanguage();
  const {
    product,
    mainImageSrc,
    activeImageIndex,
    selectedVariantIndex,
    selectedColorIndex,
    wishlist,
    variants,
    colorEntries,
    priceMinFormatted,
    priceMaxFormatted,
    toggleWishlist,
    selectThumbnail,
    selectVariant,
    selectColor,
    onCompareClick,
  } = useProductDetailPresenter();

  /** Real product name — without it every product page would share one H1. */
  const productTitle = product.listingTitle || t("productDetail.title");

  const handleThumbnailActivate = (index) => {
    selectThumbnail(index);
    thumbSwiperRef.current?.slideTo(index);
  };

  /**
   * Month keys are derived inside the memo — building the array outside made it a new
   * reference on every render, so the memo below never actually cached anything.
   */
  const priceChartData = useMemo(() => {
    const monthKeys = getTrailingMonthKeys(product.priceHistoryAmd.length || 5);
    return monthKeys.map((key, index) => ({
      name: t(`productDetail.chart.months.${key}`),
      amount: product.priceHistoryAmd[index] ?? 0,
      highlight: index === monthKeys.length - 1,
    }));
  }, [product.priceHistoryAmd, t]);

  const specsGridFullClassName =
    "m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 sm:gap-y-5 md:gap-x-8 xl:grid-cols-3 xl:gap-x-10 xl:gap-y-6";

  const renderSpecRows = (rows) =>
    rows.map((row) => (
      <div key={row.labelKey} className="min-w-0 text-sm leading-relaxed lg:text-[15px]">
        <dt className="inline font-normal text-text-muted">{t(row.labelKey)}</dt>
        <dd className="m-0 inline font-semibold text-text-dark"> {row.value}</dd>
      </div>
    ));

  const renderDescriptionSection = ({ gridClassName, className = "", headingId }) => (
    <section className={className} aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="m-0 inline-block border-b border-[#e6e9f2] pb-3 text-left text-sm font-semibold text-navy md:text-base"
      >
        {t("productDetail.tabFull")}
      </h2>
      <div className="pt-5 md:pt-6">
        <p className="sr-only">{t("productDetail.specsSectionAriaLabel")}</p>
        <dl className={gridClassName}>{renderSpecRows(product.specsExtendedRows)}</dl>
      </div>
    </section>
  );

  const thumbSwiper = (
    <div className="relative max-md:[&_.swiper-button-next]:!hidden max-md:[&_.swiper-button-prev]:!hidden md:[&_.swiper-button-prev]:text-navy md:[&_.swiper-button-next]:text-navy [&_.swiper-button-prev::after]:text-sm [&_.swiper-button-next::after]:text-sm">
      <Swiper
        modules={SWIPER_MODULES}
        navigation
        spaceBetween={10}
        slidesPerView={3}
        breakpoints={SWIPER_THUMB_BREAKPOINTS}
        onSwiper={(instance) => {
          thumbSwiperRef.current = instance;
        }}
        onSlideChange={(swiper) => selectThumbnail(swiper.activeIndex)}
        initialSlide={activeImageIndex}
      >
        {product.galleryImageUrls.map((src, index) => (
          <SwiperSlide key={src} className="!m-0">
            <button
              type="button"
              className={`${THUMB_WRAP} ${index === activeImageIndex ? THUMB_ACTIVE : THUMB_IDLE} block w-full p-0`}
              onClick={() => handleThumbnailActivate(index)}
              aria-pressed={index === activeImageIndex}
              aria-label={t("productDetail.galleryThumbAria")}
            >
              <ProgressiveImage
                src={src}
                alt=""
                imgClassName="h-full w-full object-contain object-center"
                loading="lazy"
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );

  return (
    <article className="flex w-full flex-col gap-8 text-start">
      <div className="flex w-full flex-col gap-4 sm:gap-5 lg:flex-row lg:items-stretch lg:gap-x-12">
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:min-h-0 lg:basis-[52%]">
          <figure
            className="relative m-0 flex min-h-[280px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-section-bg sm:min-h-[360px]"
            aria-label={t("productDetail.galleryAriaLabel")}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border-blue bg-white text-navy shadow-sm transition-colors hover:bg-hover-blue"
              onClick={toggleWishlist}
              aria-pressed={wishlist}
              aria-label={t("productDetail.wishlistAriaLabel")}
            >
              {wishlist ? (
                <FaHeart className="h-5 w-5 text-active-blue" />
              ) : (
                <FaRegHeart className="h-5 w-5" />
              )}
            </button>
            <ProgressiveImage
              src={mainImageSrc}
              alt={productTitle}
              imgClassName="block max-h-[min(72vh,560px)] max-w-full object-contain object-center"
              width={1200}
              height={800}
              decoding="async"
              fetchPriority="high"
              loading="eager"
            />
          </figure>

          <div
            className="min-w-0 shrink-0 lg:mt-auto"
            aria-label={t("productDetail.galleryAriaLabel")}
          >
            {thumbSwiper}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-5 lg:min-h-0 lg:basis-[48%] lg:pt-1">
          <section className="flex shrink-0 flex-col gap-5" aria-labelledby="product-detail-title">
            <h1
              id="product-detail-title"
              className="m-0 text-2xl font-semibold text-text-dark md:text-[28px] lg:text-[30px]"
            >
              {productTitle}
            </h1>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label={t("productDetail.variantsAriaLabel")}
            >
              {variants.map((variant, index) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => selectVariant(index)}
                  className={`min-h-[44px] rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors md:text-base ${
                    selectedVariantIndex === index
                      ? "border-navy bg-white text-navy shadow-sm"
                      : "border-border-blue bg-white text-text-dark hover:border-link-blue"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="flex flex-wrap items-center gap-3"
                role="group"
                aria-label={t("productDetail.colorsAriaLabel")}
              >
                {colorEntries.map((color, index) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => selectColor(index)}
                    className={`h-10 w-10 rounded-full border-2 transition-shadow ${
                      selectedColorIndex === index
                        ? "border-navy ring-2 ring-offset-2 ring-navy"
                        : "border-black/10"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={t(`filterPage.filters.colorNames.${color.id}`, color.id)}
                    aria-label={t(`filterPage.filters.colorNames.${color.id}`, color.id)}
                    aria-pressed={selectedColorIndex === index}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={onCompareClick}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border-2 border-border-blue bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-hover-blue sm:self-center"
              >
                <FaBalanceScale className="h-4 w-4" aria-hidden />
                {t("header.compareLabel")}
              </button>
            </div>

            <div className="flex flex-wrap gap-8 border-y border-border-blue py-4">
              <div className="flex flex-col gap-1">
                <p className="m-0 text-xs text-text-muted">{t("productDetail.priceFrom")}</p>
                <p className="m-0 text-xl font-semibold text-link-blue md:text-2xl">
                  {priceMinFormatted} {t("productDetail.currencySuffix")}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="m-0 text-xs text-text-muted">{t("productDetail.priceTo")}</p>
                <p className="m-0 text-xl font-semibold text-link-blue md:text-2xl">
                  {priceMaxFormatted} {t("productDetail.currencySuffix")}
                </p>
              </div>
            </div>
          </section>

          <div className="w-full shrink-0 lg:mt-auto">
            <div className="rounded-xl border border-border-blue bg-white px-2 py-4 shadow-sm sm:px-4">
              <PriceHistoryChart
                data={priceChartData}
                ariaLabel={t("productDetail.chartAriaLabel")}
              />
            </div>
          </div>
        </div>
      </div>

      {/*
        Rendered once. The block used to be output twice with different visibility
        classes, so the whole spec table (and its headings) sat in the DOM in duplicate.
        A single responsive grid covers every width instead.
      */}
      {renderDescriptionSection({
        headingId: "product-detail-specs-heading",
        gridClassName: specsGridFullClassName,
        className: "min-w-0 border-t border-[#e6e9f2] pt-8",
      })}
    </article>
  );
};

export default ProductDetailWidget;
