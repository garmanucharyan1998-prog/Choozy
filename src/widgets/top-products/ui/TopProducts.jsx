import { useLanguage } from "contexts";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const TopProducts = ({ items }) => {
  const { t } = useLanguage();

  return (
    <ProductShowcaseSection
      sectionId="top-products"
      title={t("topProducts.title")}
      carouselAriaLabel={t("topProducts.carouselAriaLabel")}
      moreHref="/filter"
      items={items}
      sectionClassName="mb-5 flex justify-center bg-white pb-5 pt-10 lg:mb-20 lg:pb-10 lg:pt-[7.5rem]"
    />
  );
};

export default TopProducts;
