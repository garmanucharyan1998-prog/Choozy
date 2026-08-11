import { useCallback, useRef, useState } from "react";
import { FaBalanceScale, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { useLanguage } from "contexts";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { BREAKPOINTS } from "shared/config/breakpoints";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

/**
 * Only Tailwind's own screens (shared/config/breakpoints.js) — no orphan steps like the
 * old 375/640, which didn't correspond to any breakpoint used anywhere else in the app.
 */
const CAROUSEL_BREAKPOINTS = {
  [BREAKPOINTS.sm]: { slidesPerView: 1.45, spaceBetween: 14 },
  [BREAKPOINTS.md]: { slidesPerView: 3, spaceBetween: 16 },
  [BREAKPOINTS.lg]: { slidesPerView: 4, spaceBetween: 18 },
  [BREAKPOINTS.xl]: { slidesPerView: 5, spaceBetween: 20 },
};

const ACTION_BTN =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[rgba(21,33,71,1)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8f9fc] active:scale-[0.98] sm:h-10 sm:w-10";

const CAROUSEL_SHELL =
  "grid w-full min-w-0 grid-cols-1 items-center md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-2 lg:gap-x-3";

const CAROUSEL_TRACK = "min-w-0 overflow-hidden py-2";

/** Slides visible without scrolling at the widest breakpoint. */
const EAGER_SLIDE_COUNT = 5;

const NAV_BTN = `${ACTION_BTN} z-10 hidden shrink-0 self-center text-navy md:flex`;

/**
 * Presentational: every item arrives ready to render (`href`, `description`, `priceValue`)
 * and wishlist state arrives as props. It used to read and write `entities/user` and build
 * product URLs from `entities/product-detail` itself, which put a `shared/ui` component in
 * charge of domain state — the layer violation this project lints for. See
 * `features/product-wishlist`.
 *
 * @param {{
 *   items: object[],
 *   ariaLabel: string,
 *   wishlistIds?: Set<string>,
 *   onToggleWishlist?: (product: object) => void,
 * }} props
 */
const Carousel = ({ items, ariaLabel, wishlistIds, onToggleWishlist }) => {
  const { t } = useLanguage();
  const currencySuffix = t("productDetail.currencySuffix");
  const safeItems = Array.isArray(items) ? items : [];
  const slideCount = safeItems.length;
  /** Swiper needs more slides than the widest `slidesPerView` (5) to loop without gaps. */
  const loopEnabled = slideCount > 10;
  const swiperRef = useRef(null);
  const savedIds = wishlistIds ?? new Set();
  const [compare, setCompare] = useState(() => ({}));

  const toggleCompare = useCallback((id) => {
    setCompare((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <section className="my-5 flex items-center justify-center sm:my-10" aria-label={ariaLabel}>
      <div className={CAROUSEL_SHELL}>
        <button
          type="button"
          className={NAV_BTN}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label={t("carousel.previousAriaLabel")}
        >
          <FaChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className={CAROUSEL_TRACK}>
          <Swiper
            onSwiper={(instance) => {
              swiperRef.current = instance;
            }}
            watchOverflow
            slidesPerView={1.1}
            spaceBetween={12}
            loop={loopEnabled}
            breakpoints={CAROUSEL_BREAKPOINTS}
          >
            {safeItems.map((product, index) => {
              const detailPath = product.href ?? null;
              const inWishlist = savedIds.has(product.id);
              const inCompare = Boolean(compare[product.id]);

              return (
                <SwiperSlide key={product.id || index} className="!h-auto">
                  <article className="group relative flex h-full flex-col text-start">
                    {/**
                     * The first few slides are on screen at the widest breakpoint, so they
                     * load eagerly; everything past them stays deferred.
                     */}
                    <ProductCardImage
                      variant="carousel"
                      className="shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                      src={product.image}
                      alt={product.title}
                      eager={index < EAGER_SLIDE_COUNT}
                    >
                      <div className="pointer-events-auto absolute right-2.5 top-2.5 z-20 flex flex-col gap-2 sm:right-3 sm:top-3">
                        <button
                          type="button"
                          onClick={() => toggleCompare(product.id)}
                          aria-pressed={inCompare}
                          aria-label={t("carousel.compareAriaLabel")}
                          className={ACTION_BTN}
                        >
                          <FaBalanceScale className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleWishlist?.(product)}
                          aria-pressed={inWishlist}
                          aria-label={
                            inWishlist
                              ? t("carousel.wishlistRemoveAriaLabel")
                              : t("carousel.wishlistAddAriaLabel")
                          }
                          className={ACTION_BTN}
                        >
                          {inWishlist ? (
                            <FaHeart className="h-4 w-4 text-active-blue" aria-hidden />
                          ) : (
                            <FaRegHeart className="h-4 w-4" aria-hidden />
                          )}
                        </button>
                      </div>
                    </ProductCardImage>

                    {/* Single stretched link: the anchor text stays the product title,
                      while `after:inset-0` keeps the whole card clickable. */}
                    <LocalizedLink
                      to={detailPath}
                      className="flex grow flex-col gap-1.5 pt-2.5 text-inherit no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:pt-3"
                    >
                      <h3 className="m-0 line-clamp-2 text-xs font-semibold leading-tight text-navy sm:text-sm md:text-base">
                        {product.title}
                      </h3>
                      <p
                        className="m-0 line-clamp-2 overflow-hidden text-[11px] leading-[1.25em] text-text-muted sm:text-xs md:text-sm md:leading-[1.2em]"
                        title={product.description}
                      >
                        {product.description}
                      </p>
                      <p className="m-0 mt-auto text-sm font-semibold text-navy 2xl:text-base">
                        {formatPriceAmd(product.priceValue, currencySuffix) || product.price}
                      </p>
                    </LocalizedLink>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <button
          type="button"
          className={NAV_BTN}
          onClick={() => swiperRef.current?.slideNext()}
          aria-label={t("carousel.nextAriaLabel")}
        >
          <FaChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
};

export default Carousel;
