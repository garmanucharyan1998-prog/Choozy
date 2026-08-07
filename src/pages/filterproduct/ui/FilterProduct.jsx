import { FilterCatalogWidget } from "widgets/filter-catalog";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: t("seo.filter.title"),
    description: t("seo.filter.description"),
    language,
    path: "/filter",
  });
}

const FilterProduct = () => <FilterCatalogWidget />;

export default FilterProduct;
