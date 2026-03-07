import { useVarietyPresenter } from "features/variety";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const Variety = () => {
  const { items, loading, error, onRetry } = useVarietyPresenter();

  return (
    <ProductShowcaseSection
      sectionId="variety-products"
      title="Տեսականի"
      moreHref="/variety"
      items={items}
      loading={loading}
      error={error}
      onRetry={onRetry}
      sectionClassName="flex justify-center my-10 py-5 bg-white lg:my-20 lg:py-10"
    />
  );
};

export default Variety;
