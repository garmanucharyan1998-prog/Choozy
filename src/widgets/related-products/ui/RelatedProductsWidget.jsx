import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBalanceScale, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLanguage } from "contexts";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
import { useRelatedProductsPresenter } from "features/related-products";
import { ProductCardImage } from "shared/ui/product-card-image";
import "swiper/css";

const FONT_STACK = '"Montserrat arm", Montserrat, sans-serif';

const TITLE_TEXT_STYLE = {
  fontFamily: FONT_STACK,
  fontWeight: 700,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: 0,
  color: "rgba(21, 33, 71, 1)",
};

const DESC_TEXT_STYLE = {
  fontFamily: FONT_STACK,
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "24px",
  letterSpacing: 0,
  color: "rgba(105, 105, 105, 1)",
};

const PRICE_TEXT_STYLE = {
  fontFamily: FONT_STACK,
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: 0,
  color: "rgba(21, 33, 71, 1)",
};

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
    <section aria-labelledby="related-products-title" className="mt-10 md:mt-14">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
        <h2
          id="related-products-title"
          className="m-0 text-xl font-bold text-navy md:text-2xl lg:text-[28px]"
        >
          {t("relatedProducts.title")}
        </h2>
        <a
          href="/products"
          className="text-sm font-medium text-link-blue no-underline transition-colors hover:text-navy md:text-sm lg:text-base"
        >
          {t("relatedProducts.viewMoreLabel")}
        </a>
      </div>

      <hr className="my-4 border-0 border-t border-border-blue md:my-6" />

      <div className={CAROUSEL_SHELL} aria-label={t("relatedProducts.carouselAriaLabel")}>
        <button
          type="button"
          className={NAV_BTN}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous related product"
        >
          <FaChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className={CAROUSEL_TRACK}>
          <Swiper
            onSwiper={(instance) => {
              swiperRef.current = instance;
            }}
            loop
            watchOverflow={false}
            slidesPerView={1.15}
            spaceBetween={14}
            breakpoints={{
              480: { slidesPerView: 1.35, spaceBetween: 14 },
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 18 },
            }}
          >
            {items.map((product) => {
              const inWishlist = Boolean(wishlist[product.id]);
              const inCompare = Boolean(compare[product.id]);

              return (
                <SwiperSlide key={product.id} className="!h-auto">
                  <article className="flex h-full flex-col text-start">
                  <ProductCardImage
                    src={product.image}
                    alt={product.title}
                    href={product.href}
                    linkTarget="_blank"
                    linkRel="noopener noreferrer"
                  >
                    <div className="pointer-events-auto absolute right-3 top-3 z-10 flex flex-col gap-2">
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

                  <Link
                    to={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex flex-col gap-1 no-underline outline-none"
                  >
                    <h3 className="m-0 line-clamp-2" style={TITLE_TEXT_STYLE}>
                      {product.title}
                    </h3>
                    <p
                      className="m-0 line-clamp-2"
                      style={DESC_TEXT_STYLE}
                      title={product.description}
                    >
                      {product.description}
                    </p>
                    <p className="m-0 mt-0.5" style={PRICE_TEXT_STYLE}>
                      {product.price}
                    </p>
                  </Link>
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
          aria-label="Next related product"
        >
          <FaChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </section>
  );
};

export default RelatedProductsWidget;
