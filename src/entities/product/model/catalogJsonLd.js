import { getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";

/**
 * `ItemList` for the catalog/filter page, built from the products actually visible on
 * the current page (respecting whatever filters/pagination are active) — not the whole
 * catalog regardless of URL, which would misdescribe what a crawler visiting
 * `/filter?category=laptops&page=2` actually sees.
 *
 * `pageSize` should be the catalog's actual page size (e.g. the `perPage` the visitor
 * picked), not inferred from `items.length` — the last page of a result set is usually
 * partial, and inferring from it understates every position after page 1. Defaults to
 * `items.length` only so an existing caller that doesn't pass it yet still gets a value.
 *
 * Each entry names its product's price and image as well as its URL: a bare
 * position/url/name list carries too little for a search engine to do anything with.
 *
 * @param {{
 *   items: { id: string, title: string, href: string, priceValue?: number, image?: string }[],
 *   language: string,
 *   page?: number,
 *   pageSize?: number,
 *   name?: string,
 *   totalItems?: number,
 * }} params
 */
export const buildCatalogItemListJsonLd = ({
  items,
  language,
  page = 1,
  pageSize,
  name,
  totalItems,
}) => {
  const base = getSiteBaseUrl();
  const effectivePageSize = pageSize || items.length || 1;
  const startPosition = (Math.max(page, 1) - 1) * effectivePageSize;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    ...(name ? { name } : {}),
    /** The whole result set, not just this page — that's what the property means. */
    numberOfItems: typeof totalItems === "number" ? totalItems : items.length,
    itemListElement: items.map((item, index) => {
      const url = `${base}${localizedPath(item.href, language)}`;
      return {
        "@type": "ListItem",
        position: startPosition + index + 1,
        url,
        name: item.title,
        item: {
          "@type": "Product",
          name: item.title,
          url,
          ...(item.image ? { image: item.image } : {}),
          ...(typeof item.priceValue === "number"
            ? {
                offers: {
                  "@type": "Offer",
                  price: item.priceValue,
                  priceCurrency: "AMD",
                  availability: "https://schema.org/InStock",
                  url,
                },
              }
            : {}),
        },
      };
    }),
  };
};

/**
 * `BreadcrumbList` for the catalog page: Home → Catalog, plus the category when one is
 * selected. The product page has carried breadcrumbs since structured data was added here;
 * the catalog page — including all eight category landing pages — had none.
 *
 * @param {{ language: string, homeLabel: string, catalogLabel: string, categoryLabel?: string, categoryId?: string | null }} params
 */
export const buildCatalogBreadcrumbJsonLd = ({
  language,
  homeLabel,
  catalogLabel,
  categoryLabel,
  categoryId,
}) => {
  const base = getSiteBaseUrl();
  const absolute = (path) => `${base}${localizedPath(path, language)}`;

  const trail = [
    { name: homeLabel, item: absolute("/") },
    { name: catalogLabel, item: absolute("/filter") },
  ];
  if (categoryId && categoryLabel) {
    trail.push({
      name: categoryLabel,
      item: absolute(`/filter?category=${encodeURIComponent(categoryId)}`),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
};

export default buildCatalogItemListJsonLd;
