import { useGridCatalogPresenter } from "features/grid-catalog";
import { useLanguage } from "contexts";
import { ProgressiveImage } from "shared/ui/progressive-image";
import "./GridCatalog.css";

const GridCatalog = () => {
  const { t } = useLanguage();
  const { items, navigateToCategory } = useGridCatalogPresenter();

  return (
    <section
      className="flex justify-center px-0 sm:px-3 md:px-4 lg:px-0"
      aria-labelledby="grid-catalog-heading"
    >
      <h2 id="grid-catalog-heading" className="sr-only">
        {t("gridCatalog.heading")}
      </h2>
      <div className="grid-catalog cont-width-default">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`${item.className} cursor-pointer border-0 bg-card-bg rounded-xl sm:rounded-[20px] text-center flex items-end justify-center transition-all duration-[400ms] relative overflow-hidden h-auto aspect-[16/10] md:hover:scale-[1.03] md:hover:bg-hover-blue xl:h-full xl:aspect-auto min-w-0 w-full p-0`}
            onClick={() => navigateToCategory(item.filterCategoryId)}
            aria-label={item.label}
          >
            <ProgressiveImage
              src={item.image}
              alt=""
              aria-hidden="true"
              imgClassName="pointer-events-none absolute inset-0 h-full w-full object-contain object-center"
            />
            <h3 className="relative z-[1] bg-[rgba(230,230,230,0.2)] min-w-[70px] max-w-[calc(100%-12px)] text-black px-2 py-1 text-center rounded-[20px] text-[11px] backdrop-blur-[6px] mb-2 sm:min-w-[90px] sm:max-w-[calc(100%-16px)] sm:px-2.5 sm:py-1.5 sm:text-xs sm:mb-3 md:text-sm md:px-3 md:py-2 md:mb-4 lg:text-base lg:px-3 lg:py-[11px] lg:mb-5">
              {item.label}
            </h3>
          </button>
        ))}
      </div>
    </section>
  );
};

export default GridCatalog;
