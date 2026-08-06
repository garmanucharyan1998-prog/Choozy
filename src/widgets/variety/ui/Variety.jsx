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
      carouselAriaLabel={t("variety.carouselAriaLabel")}
      moreHref="/variety"
      items={items}
      loading={loading}
      error={error}
      onRetry={onRetry}
      sectionClassName="mb-10 flex justify-center bg-white pb-5 pt-[3.75rem] lg:mb-20 lg:pb-10 lg:pt-[7.5rem]"
    />
  );
};

export default Variety;
