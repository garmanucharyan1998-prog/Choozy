import { useVarietyPresenter } from "features/variety";
import { useLanguage } from "contexts";
import { ProductShowcaseSection } from "shared/ui/product-showcase";

const Variety = () => {
  const { t } = useLanguage();
  const { items, loading, error, onRetry } = useVarietyPresenter();

  return (
    <ProductShowcaseSection
      sectionId="variety-products"
      title={t("variety.title")}
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
