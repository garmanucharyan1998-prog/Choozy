import { useMemo } from "react";
import { data, redirect, useParams } from "react-router";
import { ProductOffersVariantFilterProvider, useLanguage } from "contexts";
import { BestOffersWidget } from "widgets/best-offers";
import { RelatedProductsWidget } from "widgets/related-products";
import { ProductDetailWidget } from "widgets/product-detail";
import { ProductOffersMapWidget } from "widgets/product-offers-map";
import { getTranslator } from "shared/i18n";
import { formatAmd } from "shared/lib/formatAmd";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";
import { Breadcrumbs } from "shared/ui/breadcrumbs";
import { NotFoundContent } from "shared/ui/not-found-content";
import { getCanonicalProductDetailPath } from "entities/product-detail";
import {
  getOffersForProduct,
  getProductDetailForRoute,
  PRODUCT_IMAGE_HEIGHT,
  PRODUCT_IMAGE_WIDTH,
} from "entities/product";
import { buildProductJsonLd } from "pages/singleproduct/model/productJsonLd";

/**
 * Unknown product ids must 404 (a real HTTP status now that there's a real server, not
 * just a client-rendered not-found page) rather than serve duplicate placeholder content.
 *
 * A bare id or a stale slug (`/singleproduct/fp-1`, `/singleproduct/old-title~fp-1`) is
 * redirected here, server-side and permanently, so each product answers on exactly one URL.
 * A client effect used to do this with `navigate(replace)` after the page had already
 * rendered — the crawler got a 200 at the non-canonical URL and every product stayed
 * reachable at two addresses, and that effect dropped the query string and hash on the way.
 */
export async function loader({ params, request }) {
  const product = getProductDetailForRoute(params.productId);
  if (!product) {
    return data(null, { status: 404 });
  }

  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  const canonical = localizedPath(getCanonicalProductDetailPath(product), language);
  if (canonical !== url.pathname) {
    throw redirect(`${canonical}${url.search}${url.hash}`, 301);
  }

  return data({ product });
}

export function meta({ data: loaderData, location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);

  if (!loaderData?.product) {
    return buildPageMeta({
      title: t("notFoundPage.seoTitle"),
      description: t("notFoundPage.seoDescription"),
      language,
      path: location.pathname + location.search,
      noIndex: true,
    });
  }

  const { product } = loaderData;
  const title = product.listingTitle || t("productDetail.title");
  return buildPageMeta({
    title: t("seo.product.title").replace("{{title}}", title),
    description: t("seo.product.description")
      .replace("{{title}}", title)
      .replace("{{priceMin}}", formatAmd(product.priceMinAmd))
      .replace("{{priceMax}}", formatAmd(product.priceMaxAmd)),
    language,
    path: getCanonicalProductDetailPath(product),
    imagePath: product.galleryImageUrls?.[0],
    /** Real dimensions of the Unsplash crop every product image is requested at. */
    imageWidth: PRODUCT_IMAGE_WIDTH,
    imageHeight: PRODUCT_IMAGE_HEIGHT,
    imageAlt: title,
    ogType: "product",
  });
}

const SingleProduct = () => {
  const { productId } = useParams();
  const { t, language } = useLanguage();
  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);

  if (!product) {
    return <NotFoundContent />;
  }

  const description = t("seo.product.description")
    .replace("{{title}}", product.listingTitle || t("productDetail.title"))
    .replace("{{priceMin}}", formatAmd(product.priceMinAmd))
    .replace("{{priceMax}}", formatAmd(product.priceMaxAmd));

  const jsonLd = buildProductJsonLd({
    product,
    offers: getOffersForProduct(product),
    language,
    description,
    catalogLabel: t("navPanel.catalogLabel"),
    homeLabel: t("footer.columns.primary.home"),
    categoryLabel: t(`filterPage.categories.${product.categoryId}`, product.categoryId),
    t,
  });

  return (
    <>
      {jsonLd.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
      <ProductOffersVariantFilterProvider>
        <div className="cont-width-default mx-auto flex w-full flex-col gap-10 md:gap-14">
          <Breadcrumbs
            items={[
              { label: t("footer.columns.primary.home"), href: "/" },
              { label: t("navPanel.catalogLabel"), href: "/filter" },
              { label: product.listingTitle || t("productDetail.title") },
            ]}
          />
          <ProductDetailWidget />
          <ProductOffersMapWidget />
          <BestOffersWidget />
          <RelatedProductsWidget />
        </div>
      </ProductOffersVariantFilterProvider>
    </>
  );
};

export default SingleProduct;
