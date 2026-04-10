import { Carousel } from "shared/ui/carousel";
import { useLanguage } from "contexts";

/**
 * Reusable section layout for product showcase blocks.
 * Keeps repeated section markup in a single place.
 */
const ProductShowcaseSection = ({
  sectionId,
  title,
  moreHref,
  items,
  loading,
  error,
  onRetry,
  sectionClassName,
}) => {
  const { t } = useLanguage();

  return (
    <section id={sectionId} className={sectionClassName}>
      <div className="cont-width-default">
        <div className="flex items-start gap-2 sm:gap-4 justify-between mb-6 sm:mb-10 pb-3 sm:pb-5 border-b-2 border-border-blue lg:items-center lg:gap-0">
          <h2 className="text-sm sm:text-base md:text-xl lg:text-[32px] font-bold text-navy m-0 text-left">
            {title}
          </h2>
          <a
            href={moreHref}
            className="cursor-pointer no-underline text-xs sm:text-sm font-semibold text-link-blue p-0 rounded-lg transition-all duration-300 hover:bg-[#f0f4ff] hover:text-navy lg:text-base lg:px-4 lg:py-2"
          >
            {t("productShowcase.viewMoreLabel")}
          </a>
        </div>

        {error && (
          <div className="text-red-500 text-center py-4">
            {error}
            <button type="button" onClick={onRetry} className="ml-2 underline">
              {t("productShowcase.retryLabel")}
            </button>
          </div>
        )}

        {loading && !items.length ? (
          <div className="text-center py-8 text-gray-500">{t("productShowcase.loadingLabel")}</div>
        ) : (
          <Carousel items={items} />
        )}
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
