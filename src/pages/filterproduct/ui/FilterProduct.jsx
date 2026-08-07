import { FilterCatalogWidget } from "widgets/filter-catalog";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";

const FilterProduct = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo
        title={t("seo.filter.title")}
        description={t("seo.filter.description")}
        path="/filter"
      />
      <FilterCatalogWidget />
    </>
  );
};

export default FilterProduct;
