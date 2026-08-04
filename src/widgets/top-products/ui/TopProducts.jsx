import { useLanguage } from "contexts";
import { useTopProductsPresenter } from "features/top-products";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const TopProducts = () => {
  const { t } = useLanguage();
  const { items, loading, error, onRetry } = useTopProductsPresenter();

  return (
    <ProductShowcaseSection
      sectionId="top-products"
      title={t("topProducts.title")}
      moreHref="/products"
      items={items}
      loading={loading}
      error={error}
      onRetry={onRetry}
      sectionClassName="mb-5 flex justify-center bg-white pb-5 pt-10 lg:mb-20 lg:pb-10 lg:pt-[7.5rem]"
    />
  );
};

export default TopProducts;
