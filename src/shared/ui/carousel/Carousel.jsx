import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBalanceScale, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart } from "react-icons/fa";
import { getProductDetailHref } from "entities/product-detail";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
import { ProductCardImage } from "shared/ui/product-card-image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const ACTION_BTN =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[rgba(21,33,71,1)] shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f8f9fc] active:scale-[0.98] sm:h-10 sm:w-10";

const CAROUSEL_SHELL =
  "grid w-full min-w-0 grid-cols-1 items-center md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-2 lg:gap-x-3";

const CAROUSEL_TRACK = "min-w-0 overflow-hidden py-2";

const NAV_BTN = `${ACTION_BTN} z-10 hidden shrink-0 self-center text-navy md:flex`;

const wishlistMapFromStorage = () => {
  const ids = new Set(readAccountState().wishlistItems.map((x) => x.id));
  return Object.fromEntries([...ids].map((id) => [id, true]));
};

const Carousel = ({ items }) => {
  const safeItems = Array.isArray(items) ? items : [];
  const slideCount = safeItems.length;
  const loopEnabled = slideCount > 5;
  const swiperRef = useRef(null);
  const [wishlist, setWishlist] = useState(wishlistMapFromStorage);
  const [compare, setCompare] = useState(() => ({}));

  useEffect(() => {
    const sync = () => setWishlist(wishlistMapFromStorage());
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  const toggleWishlist = useCallback((product, href) => {
    toggleWishlistProduct({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      href,
    });
    setWishlist(wishlistMapFromStorage());
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompare((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className={CAROUSEL_SHELL} aria-label="Top products carousel">
      <button
        type="button"
        className={NAV_BTN}
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous product"
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
          breakpoints={{
            375: { slidesPerView: 1.25, spaceBetween: 12 },
            480: { slidesPerView: 1.45, spaceBetween: 14 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 18 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
        >
          {safeItems.map((product, index) => {
            const detailPath = product.id != null ? getProductDetailHref(product.id, product.title) : null;
            const inWishlist = Boolean(wishlist[product.id]);
            const inCompare = Boolean(compare[product.id]);

            return (
              <SwiperSlide key={product.id || index} className="!h-auto">
                <article className="group flex h-full flex-col text-start">
                  <ProductCardImage
                    variant="carousel"
                    className="shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                    src={product.image}
                    alt={product.title}
                    href={detailPath || undefined}
                  >
                    <div className="pointer-events-auto absolute right-2.5 top-2.5 z-10 flex flex-col gap-2 sm:right-3 sm:top-3">
                      <button
                        type="button"
                        onClick={() => toggleCompare(product.id)}
                        aria-pressed={inCompare}
                        aria-label="Compare product"
                        className={ACTION_BTN}
                      >
                        <FaBalanceScale className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product, detailPath || "")}
                        aria-pressed={inWishlist}
                        aria-label="Add product to wishlist"
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
                    to={detailPath || "#"}
                    className="mt-2.5 flex grow flex-col text-inherit no-underline outline-none sm:mt-3"
                    aria-labelledby={`product-title-${index}`}
                  >
                    <h4
                      id={`product-title-${index}`}
                      className="m-0 line-clamp-2 text-xs font-semibold leading-tight text-navy sm:text-sm md:text-base"
                    >
                      {product.title}
                    </h4>
                    <p
                      className="my-1.5 line-clamp-2 overflow-hidden text-[11px] leading-[1.25em] text-text-muted sm:text-xs md:text-sm md:leading-[1.2em]"
                      title={product.description}
                    >
                      {product.description}
                    </p>
                    <p className="m-0 mt-auto text-sm font-semibold text-navy 2xl:text-base">
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
        aria-label="Next product"
      >
        <FaChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

export default Carousel;
