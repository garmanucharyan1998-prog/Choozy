import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";

/**
 * `ItemList` for the catalog/filter page, built from the products actually visible on
 * the current page (respecting whatever filters/pagination are active) — not the whole
 * catalog regardless of URL, which would misdescribe what a crawler visiting
 * `/filter?category=laptops&page=2` actually sees.
 *
 * @param {{ items: { id: string, title: string, href: string }[], language: string, page: number }} params
 */
export const buildCatalogItemListJsonLd = ({ items, language, page = 1 }) => {
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const pageSize = items.length || 1;
  const startPosition = (Math.max(page, 1) - 1) * pageSize;

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
