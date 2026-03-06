import React from "react";
import "./TopProducts.css";
import Carousel from "../../Carousel/Carousel";
import { useTopProductsPresenter } from "../../../core/mvp/presenter";

const TopProducts = () => {
  const { items, loading, error, onRetry } = useTopProductsPresenter();

  return (
    <section className="top-products-section">
      <div className="cont-width-default">
        <div className="top-prods-heading-wrapper">
          <h2 className="section-title">Թոփ ապրանքներ</h2>
          <a href="/products">Տեսնել Ավելին</a>
        </div>
        {error && (
          <div className="top-products-error">
            {error}
            <button type="button" onClick={onRetry}>Retry</button>
          </div>
        )}
        {loading && !items.length ? (
          <div className="top-products-loading">Loading...</div>
        ) : (
          <Carousel items={items} />
        )}
      </div>
    </section>
  );
};

export default TopProducts;
