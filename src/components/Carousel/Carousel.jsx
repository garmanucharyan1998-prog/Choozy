// Carousel.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./Carousel.css";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect fill='%23ddd' width='300' height='300'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3ENo image%3C/text%3E%3C/svg%3E";

const Carousel = ({ items = [] }) => {
  const slideCount = items.length;
  const maxSlidesPerView = 5;
  const loopEnabled = slideCount >= Math.max(8, maxSlidesPerView + 3);

  return (
    <section
      className="carousel-section flex"
      aria-label="Top products carousel"
    >
      <div className="carousel-container">
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={20}
          slidesPerView={Math.min(5, slideCount || 1)}
          loop={loopEnabled}
          breakpoints={{
            0: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
            1280: {
              slidesPerView: 5,
            },
          }}
        >
          {items.map((product, index) => (
            <SwiperSlide key={product.id || index}>
              <figure
                className="product-card"
                aria-labelledby={`product-title-${index}`}
              >
                <img
                  src={product.image || PLACEHOLDER_IMG}
                  alt={product.title}
                  className="product-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMG;
                  }}
                />
                <figcaption className="product-info">
                  <h4 id={`product-title-${index}`} className="product-title">
                    {product.title}
                  </h4>
                  <p
                    className="product-description"
                    title={product.description}
                  >
                    {product.description}
                  </p>
                  <p className="product-price">{product.price}</p>
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
