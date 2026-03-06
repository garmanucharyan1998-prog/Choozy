import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

const Carousel = ({ items }) => {
  const safeItems = Array.isArray(items) ? items : [];
  const slideCount = safeItems.length;
  const maxSlidesPerView = 5;
  const loopEnabled = slideCount >= Math.max(8, maxSlidesPerView + 3);

  return (
    <section
      className="my-10 flex justify-center items-center"
      aria-label="Top products carousel"
    >
      <div className="w-full relative px-1 sm:px-2 md:px-0 [&_.swiper-button-prev]:!hidden [&_.swiper-button-next]:!hidden md:[&_.swiper-button-prev]:!flex md:[&_.swiper-button-next]:!flex">
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={10}
          slidesPerView={Math.min(5, slideCount || 1)}
          loop={loopEnabled}
          breakpoints={{
            0: { slidesPerView: 1.05, spaceBetween: 8 },
            320: { slidesPerView: 1.12, spaceBetween: 10 },
            375: { slidesPerView: 1.2, spaceBetween: 10 },
            480: { slidesPerView: 1.4, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 14 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 18 },
            1280: { slidesPerView: 5, spaceBetween: 20 },
          }}
        >
          {safeItems.map((product, index) => (
            <SwiperSlide key={product.id || index} className="!flex justify-center m-0">
              <figure
                className="group cursor-pointer flex flex-col w-full max-w-[280px] min-h-[360px] m-0 transition-all duration-[400ms] sm:min-h-[390px] md:w-[230px] md:max-w-[230px] md:min-h-[440px] 2xl:min-h-[440px]"
                style={{ width: undefined }}
                aria-labelledby={`product-title-${index}`}
              >
                <img
                  src={product.image || PLACEHOLDER_IMG}
                  alt={product.title}
                  className="h-[190px] bg-[#f1f1f1] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-contain bg-no-repeat bg-center transition-all duration-[400ms] group-hover:bg-hover-blue object-contain sm:h-[220px] md:h-[240px] 2xl:h-[285px]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMG;
                  }}
                />
                <figcaption className="mt-2.5 flex flex-col text-start grow">
                  <h4
                    id={`product-title-${index}`}
                    className="text-navy text-sm font-semibold mt-2.5 mb-0 leading-tight line-clamp-2 sm:text-base md:mt-3.5"
                  >
                    {product.title}
                  </h4>
                  <p
                    className="my-2 text-xs text-text-muted overflow-hidden line-clamp-2 leading-[1.25em] sm:text-sm sm:my-2.5 md:leading-[1.2em]"
                    title={product.description}
                  >
                    {product.description}
                  </p>
                  <p className="text-navy text-sm font-semibold m-0 mt-auto 2xl:text-base">
                    {product.price}
                  </p>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Carousel;
