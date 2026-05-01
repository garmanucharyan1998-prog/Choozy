import { useMemo, useRef } from "react";
import { useProductDetailPresenter } from "features/product-detail";
import { useLanguage } from "contexts";
import { PriceHistoryChart } from "shared/ui/price-history-chart";
import { FaBalanceScale, FaHeart, FaRegHeart } from "react-icons/fa";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

const THUMB_WRAP =
  "relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-card-bg transition-colors";
const THUMB_ACTIVE = "border-navy ring-2 ring-offset-1 ring-navy";
const THUMB_IDLE = "border-transparent hover:border-border-blue";

const CHART_MONTH_KEYS = ["jan", "feb", "mar", "apr", "may"];
const SWIPER_MODULES = [Navigation];
const SWIPER_THUMB_BREAKPOINTS = {
  480: { slidesPerView: 4 },
  768: { slidesPerView: 5 },
  1024: { slidesPerView: 6 },
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
    activeTab,
    wishlist,
    variantIds,
    colorEntries,
    priceMinFormatted,
    priceMaxFormatted,
    toggleWishlist,
    selectThumbnail,
    selectVariant,
    selectColor,
    selectTab,
    onCompareClick,
  } = useProductDetailPresenter();

  const handleThumbnailActivate = (index) => {
    selectThumbnail(index);
    thumbSwiperRef.current?.slideTo(index);
  };

  const priceChartData = useMemo(
    () =>
      CHART_MONTH_KEYS.map((key, index) => ({
        name: t(`productDetail.chart.months.${key}`),
        amount: product.priceHistoryAmd[index] ?? 0,
        highlight: index === product.priceHistoryHighlightIndex,
      })),
    [product.priceHistoryAmd, product.priceHistoryHighlightIndex, t],
  );

  return (
    <article className="w-full text-start">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12 lg:items-start">
        <section aria-label={t("productDetail.galleryAriaLabel")} className="min-w-0">
          <figure className="relative m-0 overflow-hidden rounded-2xl bg-section-bg">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-border-blue bg-white text-navy shadow-sm transition-colors hover:bg-hover-blue"
              onClick={toggleWishlist}
              aria-pressed={wishlist}
              aria-label={t("productDetail.wishlistAriaLabel")}
            >
              {wishlist ? <FaHeart className="h-5 w-5 text-active-blue" /> : <FaRegHeart className="h-5 w-5" />}
            </button>
            <img
              src={mainImageSrc}
              alt={t("productDetail.mainImageAlt")}
              className="h-auto w-full max-h-[min(72vh,560px)] object-contain object-center"
              width={1200}
              height={800}
              decoding="async"
              fetchPriority="high"
            />
          </figure>

          <div className="relative mt-4 [&_.swiper-button-prev]:text-navy [&_.swiper-button-next]:text-navy [&_.swiper-button-prev::after]:text-sm [&_.swiper-button-next::after]:text-sm">
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
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-5 lg:pt-1" aria-labelledby="product-detail-title">
          <h1 id="product-detail-title" className="m-0 text-2xl font-semibold text-text-dark md:text-[28px] lg:text-[30px]">
            {t("productDetail.title")}
          </h1>

          <div className="flex flex-wrap gap-2" role="group" aria-label={t("productDetail.variantsAriaLabel")}>
            {variantIds.map((variantId, index) => (
              <button
                key={variantId}
                type="button"
                onClick={() => selectVariant(index)}
                className={`min-h-[44px] rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors md:text-base ${
                  selectedVariantIndex === index
                    ? "border-navy bg-white text-navy shadow-sm"
                    : "border-border-blue bg-white text-text-dark hover:border-link-blue"
                }`}
              >
                {t(`productDetail.variants.${variantId}`)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3" role="group" aria-label={t("productDetail.colorsAriaLabel")}>
              {colorEntries.map((color, index) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => selectColor(index)}
                  className={`h-10 w-10 rounded-full border-2 transition-shadow ${
                    selectedColorIndex === index ? "border-navy ring-2 ring-offset-2 ring-navy" : "border-black/10"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={t(`productDetail.colors.${color.id}`)}
                  aria-label={t(`productDetail.colors.${color.id}`)}
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
            <div>
              <p className="m-0 text-xs text-text-muted">{t("productDetail.priceFrom")}</p>
              <p className="m-0 mt-1 text-xl font-semibold text-link-blue md:text-2xl">
                {priceMinFormatted} {t("productDetail.currencySuffix")}
              </p>
            </div>
            <div>
              <p className="m-0 text-xs text-text-muted">{t("productDetail.priceTo")}</p>
              <p className="m-0 mt-1 text-xl font-semibold text-link-blue md:text-2xl">
                {priceMaxFormatted} {t("productDetail.currencySuffix")}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border-blue bg-white px-2 py-4 shadow-sm sm:px-4">
            <PriceHistoryChart data={priceChartData} ariaLabel={t("productDetail.chartAriaLabel")} />
          </div>

          <div className="border-b border-border-blue">
            <div className="flex gap-8" role="tablist" aria-label={t("productDetail.tabsAriaLabel")}>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "short"}
                aria-controls="product-detail-tabpanel"
                id="tab-short"
                className={`relative pb-3 text-sm font-semibold md:text-base ${
                  activeTab === "short" ? "text-navy" : "text-text-muted"
                }`}
                onClick={() => selectTab("short")}
              >
                {t("productDetail.tabShort")}
                {activeTab === "short" ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-link-blue" />
                ) : null}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "full"}
                aria-controls="product-detail-tabpanel"
                id="tab-full"
                className={`relative pb-3 text-sm font-semibold md:text-base ${
                  activeTab === "full" ? "text-navy" : "text-text-muted"
                }`}
                onClick={() => selectTab("full")}
              >
                {t("productDetail.tabFull")}
                {activeTab === "full" ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-link-blue" />
                ) : null}
              </button>
            </div>
          </div>

          <div
            id="product-detail-tabpanel"
            role="tabpanel"
            aria-labelledby={activeTab === "short" ? "tab-short" : "tab-full"}
            className="pt-4"
          >
            <h2 className="sr-only">{t("productDetail.specsSectionAriaLabel")}</h2>
            <dl className="m-0 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {(activeTab === "short" ? product.specsBriefRows : product.specsExtendedRows).map((row) => (
                <div key={row.labelKey} className="min-w-0">
                  <dt className="text-sm font-normal text-text-muted">{t(row.labelKey)}</dt>
                  <dd className="m-0 mt-1 text-base font-semibold leading-snug text-text-dark">{t(row.valueKey)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>
    </article>
  );
};

export default ProductDetailWidget;
