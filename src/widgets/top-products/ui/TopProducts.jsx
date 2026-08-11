import { useLanguage } from "contexts";
import { useProductWishlist } from "features/product-wishlist";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const TopProducts = ({ items }) => {
  const { t } = useLanguage();
  /** Domain state lives here, not in the shared carousel this renders. */
  const { wishlistIds, toggleWishlist } = useProductWishlist();

  return (
    <ProductShowcaseSection
      sectionId="top-products"
      title={t("topProducts.title")}
      carouselAriaLabel={t("topProducts.carouselAriaLabel")}
      moreHref="/filter"
      items={items}
      wishlistIds={wishlistIds}
      onToggleWishlist={toggleWishlist}
      sectionClassName="mb-5 flex justify-center bg-white pb-5 pt-10 lg:mb-20 lg:pb-10 lg:pt-[7.5rem]"
    />
  );
};

export default TopProducts;
