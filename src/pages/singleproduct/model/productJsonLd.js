import { DEFAULT_SITE_BASE_URL, getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";
import { getCanonicalProductDetailPath } from "entities/product-detail";

/**
 * Product + AggregateOffer + BreadcrumbList for the detail page.
 * Prices come straight from the resolved product, so the markup can never drift
 * from what the page renders.
 *
 * @param {{
 *   product: object,
 *   language: string,
 *   description: string,
 *   catalogLabel: string,
 *   homeLabel: string,
 * }} params
 */
export const buildProductJsonLd = ({
  product,
  language,
  description,
  catalogLabel,
  homeLabel,
}) => {
  const base = getSiteBaseUrl() || DEFAULT_SITE_BASE_URL;
  const productPath = getCanonicalProductDetailPath(product);
  const productUrl = `${base}${localizedPath(productPath, language)}`;
  const title = product.listingTitle || "Product";

  const images = Array.isArray(product.galleryImageUrls)
    ? [...new Set(product.galleryImageUrls)].slice(0, 6)
    : [];

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description,
      image: images,
      sku: product.id,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "AMD",
        lowPrice: product.priceMinAmd,
        highPrice: product.priceMaxAmd,
        availability: "https://schema.org/InStock",
        url: productUrl,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: homeLabel,
          item: `${base}${localizedPath("/", language)}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: catalogLabel,
          item: `${base}${localizedPath("/filter", language)}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: productUrl,
        },
      ],
    },
  ];
};

export default buildProductJsonLd;
