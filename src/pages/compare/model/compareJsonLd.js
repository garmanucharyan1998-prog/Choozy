import { getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";

/**
 * Structured data for an "X vs Y" page.
 *
 * An `ItemList` of the two products, plus the breadcrumb trail — the same two shapes the
 * catalog emits, for the same reason: a bare page with no structured data is a page a search
 * engine has to guess about, and these are the pages meant to win a "X vs Y" query.
 *
 * No `aggregateRating` and no `review`, deliberately. This site holds no rating data of any
 * kind, and marking up a comparison as if it were a review is the sort of claim that gets
 * structured data ignored site-wide.
 *
 * @param {{
 *   products: { id: string, title: string, href: string, image?: string, priceValue?: number }[],
 *   language: string,
 *   name: string,
 *   description: string,
 *   path: string,
 *   homeLabel: string,
 *   compareLabel: string,
 * }} params
 */
export const buildComparePairJsonLd = ({
  products,
  language,
  name,
  description,
  path,
  homeLabel,
  compareLabel,
}) => {
  const base = getSiteBaseUrl();
  const absolute = (target) => `${base}${localizedPath(target, language)}`;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: absolute(path),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const url = absolute(product.href);
      return {
        "@type": "ListItem",
        position: index + 1,
        url,
        name: product.title,
        item: {
          "@type": "Product",
          name: product.title,
          url,
          ...(product.image ? { image: product.image } : {}),
          ...(typeof product.priceValue === "number"
            ? {
                offers: {
                  "@type": "Offer",
                  price: product.priceValue,
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

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: homeLabel, item: absolute("/") },
      { name: compareLabel, item: absolute("/compare") },
      { name, item: absolute(path) },
    ].map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };

  return [itemList, breadcrumbs];
};

export default buildComparePairJsonLd;
