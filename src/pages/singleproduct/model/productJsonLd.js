import { getSiteBaseUrl } from "shared/config/siteMeta";
import { localizedPath } from "shared/lib/locale";
import { getCanonicalProductDetailPath } from "entities/product-detail";
import { getBrandLabel } from "entities/product";

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
      /** The manufacturer's own model code — matches the "Model number:" spec row. */
      ...(typeof product.mpn === "string" && product.mpn ? { mpn: product.mpn } : {}),
      brand: { "@type": "Brand", name: getBrandLabel(product.brandId) },
      category: categoryLabel,
      /**
       * Guarded on both fields being present and `reviewCount` actually positive: an
       * `AggregateRating` with a rating but zero reviews is a claim search engines
       * specifically flag as unsubstantiated.
       */
      ...(typeof product.ratingValue === "number" &&
      typeof product.reviewCount === "number" &&
      product.reviewCount > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.ratingValue,
              reviewCount: product.reviewCount,
            },
          }
        : {}),
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
          /**
           * A seller with a street presence is a `LocalBusiness`, not a bare `Organization`.
           * Every offer already carries the shop's coordinates — the map widget below plots
           * them — so the markup can say where the shop actually is.
           */
          seller: {
            "@type": "LocalBusiness",
            "@id": `${base}/#shop-${offer.id?.split("-").pop() ?? ""}`,
            name: t(offer.shopNameKey),
            url: offer.url,
            address: { "@type": "PostalAddress", addressCountry: "AM", addressLocality: "Yerevan" },
            ...(offer.location
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: offer.location.lat,
                    longitude: offer.location.lng,
                  },
                }
              : {}),
          },
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
