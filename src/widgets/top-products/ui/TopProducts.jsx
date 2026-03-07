import { useTopProductsPresenter } from "features/top-products";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const TopProducts = () => {
  const { items, loading, error, onRetry } = useTopProductsPresenter();

  return (
    <ProductShowcaseSection
      sectionId="top-products"
      title="Թոփ ապրանքներ"
      moreHref="/products"
      items={items}
      loading={loading}
      error={error}
      onRetry={onRetry}
      sectionClassName="flex justify-center my-5 py-5 bg-white lg:my-20 lg:py-10"
    />
  );
};

export default TopProducts;
