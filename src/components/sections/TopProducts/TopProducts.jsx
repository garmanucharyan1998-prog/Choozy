import React from "react";
import Carousel from "../../Carousel/Carousel";
import { useTopProductsPresenter } from "../../../core/mvp/presenter";

const TopProducts = () => {
  const { items, loading, error, onRetry } = useTopProductsPresenter();

  return (
    <section id="top-products" className="flex justify-center my-5 py-5 bg-white lg:my-20 lg:py-10">
      <div className="cont-width-default">
        <div className="flex items-start gap-4 justify-between mb-10 pb-5 border-b-2 border-border-blue lg:items-center lg:gap-0">
          <h2 className="text-base md:text-xl lg:text-[32px] font-bold text-navy m-0 text-left">
            {"Թոփ ապրանքներ"}
          </h2>
          <a
            href="/products"
            className="cursor-pointer no-underline text-sm font-semibold text-link-blue p-0 rounded-lg transition-all duration-300 hover:bg-[#f0f4ff] hover:text-navy lg:text-base lg:px-4 lg:py-2"
          >
            {"Տեսնել Ավելին"}
          </a>
        </div>
        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
            <button type="button" onClick={onRetry} className="ml-2 underline">Retry</button>
          </div>
        )}
        {loading && !items.length ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <Carousel items={items} />
        )}
      </div>
    </section>
  );
};

export default TopProducts;
