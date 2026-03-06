import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

const Carousel = ({ items = [] }) => {
  const slideCount = items.length;
  const maxSlidesPerView = 5;
  const loopEnabled = slideCount >= Math.max(8, maxSlidesPerView + 3);

  return (
    <section
      className="my-10 flex justify-center items-center"
      aria-label="Top products carousel"
    >
      <div className="flex items-center relative overflow-hidden">
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={Math.min(5, slideCount || 1)}
          loop={loopEnabled}
          breakpoints={{
            0: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
        >
          {items.map((product, index) => (
            <SwiperSlide key={product.id || index} className="!flex justify-center m-0">
              <figure
                className="group cursor-pointer overflow-hidden flex flex-col w-[230px] h-[440px] m-0 transition-all duration-[400ms] 2xl:w-[230px] 2xl:h-[440px]"
                style={{ width: undefined }}
                aria-labelledby={`product-title-${index}`}
              >
                <img
                  src={product.image || PLACEHOLDER_IMG}
                  alt={product.title}
                  className="h-[240px] bg-[#f1f1f1] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] bg-contain bg-no-repeat bg-center transition-all duration-[400ms] group-hover:bg-hover-blue object-contain 2xl:h-[285px]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMG;
                  }}
                />
                <figcaption className="mt-2.5 h-[140px] flex flex-col justify-center text-start grow 2xl:h-[155px]">
                  <h4
                    id={`product-title-${index}`}
                    className="text-navy h-8 text-base font-semibold mt-3.5 mb-0 2xl:h-12"
                  >
                    {product.title}
                  </h4>
                  <p
                    className="my-2.5 h-8 text-sm text-text-muted overflow-hidden line-clamp-2 leading-[1.2em] max-h-[2.4em] 2xl:h-12"
                    title={product.description}
                  >
                    {product.description}
                  </p>
                  <p className="text-navy text-sm font-semibold m-0 2xl:text-base">
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
