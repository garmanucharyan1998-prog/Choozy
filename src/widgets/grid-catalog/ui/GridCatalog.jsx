import { useGridCatalogPresenter } from "features/grid-catalog";
import "./GridCatalog.css";

const GridCatalog = () => {
  const { items } = useGridCatalogPresenter();

  return (
    <section className="flex justify-center px-0 sm:px-3 md:px-4 lg:px-0">
      <div className="grid-catalog cont-width-default">
        {items.map((item) => (
          <div
            className={`${item.className} cursor-pointer bg-card-bg bg-contain bg-no-repeat bg-center rounded-xl sm:rounded-[20px] text-center flex items-end justify-center transition-all duration-[400ms] relative h-auto aspect-[16/10] md:hover:scale-[1.03] md:hover:bg-hover-blue xl:h-full xl:aspect-auto xl:bg-auto min-w-0`}
            key={item.id}
            style={{ backgroundImage: `url(${item.image})` }}
          >
            <h4 className="bg-[rgba(230,230,230,0.2)] min-w-[70px] max-w-[calc(100%-12px)] text-black px-2 py-1 text-center rounded-[20px] text-[11px] backdrop-blur-[6px] mb-2 sm:min-w-[90px] sm:max-w-[calc(100%-16px)] sm:px-2.5 sm:py-1.5 sm:text-xs sm:mb-3 md:text-sm md:px-3 md:py-2 md:mb-4 lg:text-base lg:px-3 lg:py-[11px] lg:mb-5">
              {item.label}
            </h4>
          </div>
        ))}
      </div>
    </section>
  );
};

export default GridCatalog;
