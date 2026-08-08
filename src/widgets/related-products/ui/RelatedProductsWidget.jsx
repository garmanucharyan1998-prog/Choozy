import { useCallback, useEffect, useRef, useState } from "react";
import { FaBalanceScale, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLanguage } from "contexts";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
import { useRelatedProductsPresenter } from "features/related-products";
import { BREAKPOINTS } from "shared/config/breakpoints";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";
import "swiper/css";

/**
 * Only Tailwind's own screens (shared/config/breakpoints.js). The old 640 step didn't
 * correspond to any breakpoint used anywhere else in the app and skipped `md` entirely
 * (jumping straight from 640 to 1024) — moved to `md` (768) instead of dropped, since
 * this carousel otherwise has no tablet-width step at all.
 */
const RELATED_PRODUCTS_BREAKPOINTS = {
  [BREAKPOINTS.sm]: { slidesPerView: 1.35, spaceBetween: 14 },
  [BREAKPOINTS.md]: { slidesPerView: 2, spaceBetween: 16 },
  [BREAKPOINTS.lg]: { slidesPerView: 4, spaceBetween: 18 },
};

/** Responsive type scale — fixed inline px would not shrink on narrow screens. */
const TITLE_TEXT_CLASS = "m-0 line-clamp-2 text-sm font-bold leading-snug text-navy sm:text-base";
const DESC_TEXT_CLASS = "m-0 line-clamp-2 text-xs leading-snug text-text-muted sm:text-sm";
const PRICE_TEXT_CLASS = "m-0 pt-0.5 text-sm font-semibold text-navy sm:text-base";

const ACTION_BTN =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[rgba(21,33,71,1)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8f9fc] active:scale-[0.98]";

/** Side gutters for arrows; center track for cards (no overlap). */
const CAROUSEL_SHELL =
  "grid w-full min-w-0 grid-cols-1 items-center md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-2 lg:gap-x-3";

const CAROUSEL_TRACK = "min-w-0 overflow-hidden py-2";

const NAV_BTN = `${ACTION_BTN} z-10 hidden shrink-0 self-center text-navy md:flex`;

const wishlistMapFromStorage = () => {
  const ids = new Set(readAccountState().wishlistItems.map((x) => x.id));
  return Object.fromEntries([...ids].map((id) => [id, true]));
};

const RelatedProductsWidget = () => {
  const { t } = useLanguage();
  const { items } = useRelatedProductsPresenter();
  const swiperRef = useRef(null);
  const [wishlist, setWishlist] = useState(wishlistMapFromStorage);
  const [compare, setCompare] = useState(() => ({}));

  useEffect(() => {
    const sync = () => setWishlist(wishlistMapFromStorage());
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  const toggleWishlist = useCallback((product) => {
    toggleWishlistProduct({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      href: product.href,
    });
    setWishlist(wishlistMapFromStorage());
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompare((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <section aria-labelledby="related-products-title">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
        <h2
          id="related-products-title"
          className="m-0 text-xl font-bold text-navy md:text-2xl lg:text-[28px]"
        >
          {t("relatedProducts.title")}
        </h2>
        <LocalizedLink
          to="/products"
          className="text-sm font-medium text-link-blue no-underline transition-colors hover:text-navy md:text-sm lg:text-base"
        >
          {t("relatedProducts.viewMoreLabel")}
        </LocalizedLink>
      </div>

      <hr className="mb-4 border-0 border-t border-border-blue pt-4 md:mb-6 md:pt-6" />

      <div
        className={CAROUSEL_SHELL}
        role="group"
        aria-label={t("relatedProducts.carouselAriaLabel")}
      >
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
            /* Looping needs comfortably more slides than the widest slidesPerView (4). */
            loop={items.length > 8}
            watchOverflow
            slidesPerView={1.15}
            spaceBetween={14}
            breakpoints={RELATED_PRODUCTS_BREAKPOINTS}
          >
            {items.map((product) => {
              const inWishlist = Boolean(wishlist[product.id]);
              const inCompare = Boolean(compare[product.id]);

              return (
                <SwiperSlide key={product.id} className="!h-auto">
                  <article className="relative flex h-full flex-col text-start">
                    <ProductCardImage src={product.image} alt={product.title}>
                      <div className="pointer-events-auto absolute right-3 top-3 z-20 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCompare(product.id);
                          }}
                          aria-pressed={inCompare}
                          aria-label={t("relatedProducts.compareAriaLabel")}
                          className={ACTION_BTN}
                        >
                          <FaBalanceScale className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                          aria-pressed={inWishlist}
                          aria-label={t("relatedProducts.wishlistAriaLabel")}
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

                    {/* One stretched link per card — keeps the product title as the anchor text. */}
                    <LocalizedLink
                      to={product.href}
                      className="flex flex-col gap-1 pt-3 no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                    >
                      <h3 className={TITLE_TEXT_CLASS}>{product.title}</h3>
                      <p className={DESC_TEXT_CLASS} title={product.description}>
                        {product.description}
                      </p>
                      <p className={PRICE_TEXT_CLASS}>{product.price}</p>
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

export default RelatedProductsWidget;
