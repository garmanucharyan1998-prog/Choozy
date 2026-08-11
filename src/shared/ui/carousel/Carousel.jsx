import { useCallback, useEffect, useRef, useState } from "react";
import { FaBalanceScale, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { getProductDetailHref } from "entities/product-detail";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
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

const wishlistMapFromStorage = () => {
  const ids = new Set(readAccountState().wishlistItems.map((x) => x.id));
  return Object.fromEntries([...ids].map((id) => [id, true]));
};

const Carousel = ({ items, ariaLabel }) => {
  const { t } = useLanguage();
  const currencySuffix = t("productDetail.currencySuffix");
  const safeItems = Array.isArray(items) ? items : [];
  const slideCount = safeItems.length;
  /** Swiper needs more slides than the widest `slidesPerView` (5) to loop without gaps. */
  const loopEnabled = slideCount > 10;
  const swiperRef = useRef(null);
  /**
   * Starts empty (matching the server, which has no `localStorage`) instead of reading
   * real wishlist state in the initializer — that would diverge from the SSR HTML on the
   * very first client render (React #418), and this carousel renders on the homepage.
   * `sync()` inside the mount effect below fills in the real data right after hydration.
   */
  const [wishlist, setWishlist] = useState(() => ({}));
  const [compare, setCompare] = useState(() => ({}));

  useEffect(() => {
    const sync = () => setWishlist(wishlistMapFromStorage());
    sync();
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  const toggleWishlist = useCallback((product, href) => {
    toggleWishlistProduct({
      id: product.id,
      title: product.title,
      description: product.description,
      priceValue: product.priceValue,
      image: product.image,
      href,
      category: product.categoryId,
    });
    setWishlist(wishlistMapFromStorage());
  }, []);

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
              const detailPath =
                product.id != null ? getProductDetailHref(product.id, product.title) : null;
              const inWishlist = Boolean(wishlist[product.id]);
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
                          onClick={() => toggleWishlist(product, detailPath || "")}
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
