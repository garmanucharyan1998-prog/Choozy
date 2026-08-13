import { Carousel } from "shared/ui/carousel";
import { useLanguage } from "contexts";
import { LocalizedLink } from "shared/ui/link";

/**
 * Reusable section layout for product showcase blocks.
 * Keeps repeated section markup in a single place.
 *
 * `items` now comes synchronously from the page's own `loader()` (see HomePage.jsx),
 * so there's no more loading/error/retry state to render — the previous client-fetch
 * pattern this replaced never actually populated the initial server response anyway.
 */
const ProductShowcaseSection = ({
  sectionId,
  title,
  moreHref,
  items,
  sectionClassName,
  carouselAriaLabel,
  wishlistIds,
  onToggleWishlist,
  compareIds,
  onToggleCompare,
}) => {
  const { t } = useLanguage();

  return (
    <section id={sectionId} className={sectionClassName} aria-labelledby={`${sectionId}-heading`}>
      <div className="cont-width-default">
        <div className="flex items-start gap-2 sm:gap-4 justify-between mb-6 sm:mb-10 pb-3 sm:pb-5 border-b-2 border-border-blue lg:items-center lg:gap-0">
          <h2
            id={`${sectionId}-heading`}
            className="text-sm sm:text-base md:text-xl lg:text-[32px] font-bold text-navy m-0 text-left"
          >
            {title}
          </h2>
          <LocalizedLink
            to={moreHref}
            /**
             * `py-1 -my-1` below `lg`, where the link is bare text 16px tall and nothing else
             * is clickable around it. From `lg` the real padding takes over and supplies the
             * height on its own.
             */
            className="inline-flex items-center cursor-pointer no-underline text-xs sm:text-sm font-semibold text-link-blue px-0 py-1 -my-1 rounded-lg transition-all duration-300 hover:bg-[#f0f4ff] hover:text-navy lg:text-base lg:my-0 lg:px-4 lg:py-2"
            aria-label={`${t("productShowcase.viewMoreLabel")}: ${title}`}
          >
            {t("productShowcase.viewMoreLabel")}
          </LocalizedLink>
        </div>

        <Carousel
          items={items}
          ariaLabel={carouselAriaLabel}
          wishlistIds={wishlistIds}
          onToggleWishlist={onToggleWishlist}
          compareIds={compareIds}
          onToggleCompare={onToggleCompare}
        />
      </div>
    </section>
  );
};

export default ProductShowcaseSection;
