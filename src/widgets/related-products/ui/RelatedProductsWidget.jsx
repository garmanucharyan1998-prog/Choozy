import { useCallback, useState } from "react";
import { FaBalanceScale, FaHeart, FaRegHeart } from "react-icons/fa";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLanguage } from "contexts";
import { useRelatedProductsPresenter } from "features/related-products";
import "swiper/css";
import "swiper/css/navigation";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3C/svg%3E";

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

// Arrows sit over the gray image strip (py-6 + img h), not the full card.
const SWIPER_NAV_WRAP =
  "relative py-2 " +
  "[&_.swiper-button-prev]:left-3 [&_.swiper-button-next]:right-3 sm:[&_.swiper-button-prev]:left-4 sm:[&_.swiper-button-next]:right-4 " +
  "[&_.swiper-button-prev]:z-[12] [&_.swiper-button-next]:z-[12] " +
  "[&_.swiper-button-prev]:mt-0 [&_.swiper-button-next]:mt-0 " +
  "[&_.swiper-button-prev]:top-[114px] sm:[&_.swiper-button-prev]:top-[124px] md:[&_.swiper-button-prev]:top-[134px] " +
  "[&_.swiper-button-next]:top-[114px] sm:[&_.swiper-button-next]:top-[124px] md:[&_.swiper-button-next]:top-[134px] " +
  "[&_.swiper-button-prev]:-translate-y-1/2 [&_.swiper-button-next]:-translate-y-1/2 " +
  "[&_.swiper-button-prev]:text-gray-300 [&_.swiper-button-next]:text-gray-300 " +
  "[&_.swiper-button-prev]:hover:text-navy [&_.swiper-button-next]:hover:text-navy " +
  "[&_.swiper-button-prev::after]:text-base [&_.swiper-button-next::after]:text-base " +
  "[&_.swiper-button-prev]:h-10 [&_.swiper-button-next]:h-10 " +
  "[&_.swiper-button-prev]:w-10 [&_.swiper-button-next]:w-10";

const RelatedProductsWidget = () => {
  const { t } = useLanguage();
  const { items } = useRelatedProductsPresenter();
  const [wishlist, setWishlist] = useState(() => ({}));
  const [compare, setCompare] = useState(() => ({}));

  const toggleWishlist = useCallback((id) => {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
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

      <div className={SWIPER_NAV_WRAP} aria-label={t("relatedProducts.carouselAriaLabel")}>
        <Swiper
          modules={[Navigation]}
          navigation
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
                  <div
                    className="relative min-h-[228px] overflow-hidden rounded-[20px] sm:min-h-[248px] md:min-h-[268px]"
                    style={{ backgroundColor: "rgba(245, 245, 245, 1)" }}
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
                          toggleWishlist(product.id);
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
                    <a href={product.href} className="block outline-none">
                      <img
                        src={product.image || PLACEHOLDER_IMG}
                        alt={product.title}
                        className="mx-auto block h-[180px] w-full max-w-[220px] object-contain px-4 py-6 sm:h-[200px] sm:max-w-none md:h-[220px]"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = PLACEHOLDER_IMG;
                        }}
                      />
                    </a>
                  </div>

                  <a
                    href={product.href}
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
                  </a>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default RelatedProductsWidget;
