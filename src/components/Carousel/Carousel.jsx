// Carousel.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./Carousel.css";

const Carousel = ({ items }) => {
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
          slidesPerView={5}
          loop={true}
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
            <SwiperSlide key={index}>
              <figure
                className="product-card"
                aria-labelledby={`product-title-${index}`}
              >
                <img
                  src={product.image}
                  alt={product.title}
                  className="product-img"
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
