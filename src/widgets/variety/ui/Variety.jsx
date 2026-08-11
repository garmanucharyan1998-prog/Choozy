import { useLanguage } from "contexts";
import { useProductWishlist } from "features/product-wishlist";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const Variety = ({ items }) => {
  const { t } = useLanguage();
  /** Domain state lives here, not in the shared carousel this renders. */
  const { wishlistIds, toggleWishlist } = useProductWishlist();

  return (
    <ProductShowcaseSection
      sectionId="variety-products"
      title={t("variety.title")}
      carouselAriaLabel={t("variety.carouselAriaLabel")}
      moreHref="/filter"
      items={items}
      wishlistIds={wishlistIds}
      onToggleWishlist={toggleWishlist}
      sectionClassName="mb-10 flex justify-center bg-white pb-5 pt-[3.75rem] lg:mb-20 lg:pb-10 lg:pt-[7.5rem]"
    />
  );
};

export default Variety;
