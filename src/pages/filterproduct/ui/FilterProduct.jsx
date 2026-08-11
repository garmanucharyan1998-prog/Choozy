import { FilterCatalogWidget } from "widgets/filter-catalog";
import { isValidFilterCategoryId } from "entities/filter-catalog";
import { getCatalogPageCount } from "entities/product";
import { getTranslator } from "shared/i18n";
import { buildPageMeta, resolveCatalogCanonical } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

/**
 * Each of the eight categories is its own landing page, with its own title, description and
 * self-referencing canonical. All 24 of them (8 × 3 languages) used to share the generic
 * catalog title and canonicalize to bare `/filter` — while `sitemap.xml` advertised every
 * one of them, so Google fetched them, read the canonical and dropped them.
 *
 * Which URL is canonical, and whether it's indexable at all, is decided by
 * `resolveCatalogCanonical` — see its own doc comment for the rules.
 */
export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  const { path, categoryId, page, noIndex } = resolveCatalogCanonical(
    location.search,
    isValidFilterCategoryId,
    getCatalogPageCount,
  );

  const base = categoryId
    ? {
        title: t(`seo.filterCategories.${categoryId}.title`),
        description: t(`seo.filterCategories.${categoryId}.description`),
      }
    : { title: t("seo.filter.title"), description: t("seo.filter.description") };

  /** Page 2+ says so in the title, so paginated pages don't look like duplicates in results. */
  const pageSuffix =
    page > 1 ? ` — ${t("seo.filter.pageSuffix").replace("{{page}}", String(page))}` : "";

  return buildPageMeta({
    title: `${base.title}${pageSuffix}`,
    description: base.description,
    language,
    path,
    noIndex,
  });
}

const FilterProduct = () => <FilterCatalogWidget />;

export default FilterProduct;
