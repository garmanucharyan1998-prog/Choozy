import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ProductOffersVariantFilterProvider, useLanguage } from "contexts";
import { BestOffersWidget } from "widgets/best-offers";
import { RelatedProductsWidget } from "widgets/related-products";
import { ProductDetailWidget } from "widgets/product-detail";
import { ProductOffersMapWidget } from "widgets/product-offers-map";
import { PageSeo } from "shared/lib/seo";
import { Breadcrumbs } from "shared/ui/breadcrumbs";
import { NotFoundContent } from "shared/ui/not-found-content";
import { getCanonicalProductDetailPath, getProductDetailForRoute } from "entities/product-detail";
import { buildProductJsonLd } from "pages/singleproduct/model/productJsonLd";

const formatAmd = (amount) => (typeof amount === "number" ? amount.toLocaleString("en-US") : "");

const SingleProduct = () => {
  const { productId } = useParams();
  const { t, language } = useLanguage();
  const { pathname, search } = useLocation();
  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);

  const seo = useMemo(() => {
    if (!product) return null;
    const title = product.listingTitle || t("productDetail.title");
    return {
      title: t("seo.product.title").replace("{{title}}", title),
      description: t("seo.product.description")
        .replace("{{title}}", title)
        .replace("{{priceMin}}", formatAmd(product.priceMinAmd))
        .replace("{{priceMax}}", formatAmd(product.priceMaxAmd)),
      path: getCanonicalProductDetailPath(product),
      image: product.galleryImageUrls?.[0],
    };
  }, [product, t]);

  /** Unknown product ids must 404 rather than serve duplicate placeholder content. */
  if (!product || !seo) {
    return (
      <>
        <PageSeo
          title={t("notFoundPage.seoTitle")}
          description={t("notFoundPage.seoDescription")}
          path={`${pathname}${search}`}
          noIndex
        />
        <NotFoundContent />
      </>
    );
  }

  return (
    <>
      <PageSeo
        title={seo.title}
        description={seo.description}
        path={seo.path}
        imagePath={seo.image}
        jsonLd={buildProductJsonLd({
          product,
          language,
          description: seo.description,
          catalogLabel: t("navPanel.catalogLabel"),
          homeLabel: t("footer.columns.primary.home"),
        })}
      />
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
