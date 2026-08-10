import { getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";
import { getCanonicalProductDetailPath } from "entities/product-detail";

const BRAND_LABEL = {
  apple: "Apple",
  samsung: "Samsung",
  sony: "Sony",
  dell: "Dell",
  lenovo: "Lenovo",
  hp: "HP",
};

/**
 * Product + AggregateOffer + BreadcrumbList for the detail page.
 * Prices come straight from the resolved product, and `AggregateOffer` is built from
 * the *same* offers the Best Offers table renders below it — previously the offers
 * table read a completely unrelated global list (K1), so this markup could describe a
 * price range the page didn't actually show anywhere.
 *
 * @param {{
 *   product: object,
 *   offers: { priceAmd: number, shopNameKey: string, url: string }[],
 *   language: string,
 *   description: string,
 *   catalogLabel: string,
 *   homeLabel: string,
 *   categoryLabel: string,
 *   t: (key: string) => string,
 * }} params
 */
export const buildProductJsonLd = ({
  product,
  offers,
  language,
  description,
  catalogLabel,
  homeLabel,
  categoryLabel,
  t,
}) => {
  const base = getSiteBaseUrl();
  const productPath = getCanonicalProductDetailPath(product);
  const productUrl = `${base}${localizedPath(productPath, language)}`;
  const title = product.listingTitle || "Product";

  const images = Array.isArray(product.galleryImageUrls)
    ? [...new Set(product.galleryImageUrls)].slice(0, 6)
    : [];

  const offerList = Array.isArray(offers) ? offers : [];
  const offerPrices = offerList.map((o) => o.priceAmd).filter((n) => Number.isFinite(n));
  const lowPrice = offerPrices.length ? Math.min(...offerPrices) : product.priceMinAmd;
  const highPrice = offerPrices.length ? Math.max(...offerPrices) : product.priceMaxAmd;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: title,
      description,
      image: images,
      sku: product.id,
      brand: { "@type": "Brand", name: BRAND_LABEL[product.brandId] || product.brandId },
      category: categoryLabel,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "AMD",
        lowPrice,
        highPrice,
        offerCount: offerList.length,
        availability: "https://schema.org/InStock",
        url: productUrl,
        offers: offerList.map((offer) => ({
          "@type": "Offer",
          price: offer.priceAmd,
          priceCurrency: "AMD",
          availability: "https://schema.org/InStock",
          url: offer.url,
          seller: { "@type": "Organization", name: t(offer.shopNameKey) },
        })),
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
