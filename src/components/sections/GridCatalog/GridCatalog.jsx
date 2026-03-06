import React from "react";
import { useGridCatalogPresenter } from "../../../core/mvp/presenter";
import "./GridCatalog.css";

const GridCatalog = () => {
  const { items } = useGridCatalogPresenter();

  return (
    <section className="flex justify-center">
      <div className="grid-catalog cont-width-default">
        {items.map((item, index) => (
          <div
            className={`${item.className} cursor-pointer bg-card-bg bg-contain bg-no-repeat bg-center rounded-[20px] text-center flex items-end justify-center transition-all duration-[400ms] relative h-auto aspect-[16/10] hover:scale-[1.03] hover:bg-hover-blue xl:h-full xl:aspect-auto xl:bg-auto`}
            key={index}
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <h4 className="bg-[rgba(230,230,230,0.2)] min-w-[100px] text-black px-3 py-[11px] text-center rounded-[20px] text-base backdrop-blur-[6px] mb-5 md:text-xs md:p-1.5 md:m-0 md:bg-[#f6f6f680] lg:text-base lg:px-3 lg:py-[11px] lg:m-0 lg:mb-5 lg:bg-[rgba(230,230,230,0.2)]">
              {item.label}
            </h4>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GridCatalog;
