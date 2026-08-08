import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
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
 * @param {{ items: { id: string, title: string, href: string }[], language: string, page: number, pageSize?: number }} params
 */
export const buildCatalogItemListJsonLd = ({ items, language, page = 1, pageSize }) => {
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const effectivePageSize = pageSize || items.length || 1;
  const startPosition = (Math.max(page, 1) - 1) * effectivePageSize;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: startPosition + index + 1,
      url: `${base}${localizedPath(item.href, language)}`,
      name: item.title,
    })),
  };
};

export default buildCatalogItemListJsonLd;
