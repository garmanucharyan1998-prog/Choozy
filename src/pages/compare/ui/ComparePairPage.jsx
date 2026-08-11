import { data, redirect, useParams } from "react-router";
import { useLanguage } from "contexts";
import { ProductCompareWidget } from "widgets/product-compare";
import {
  getCanonicalSlugForReversed,
  getComparePairBySlug,
  getComparePairPath,
  getCompareProducts,
} from "entities/product-compare";
import { getTranslator } from "shared/i18n";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";
import { buildPageMeta } from "shared/lib/seo";
import { Breadcrumbs } from "shared/ui/breadcrumbs";
import { NotFoundContent } from "shared/ui/not-found-content";
import { buildComparePairJsonLd } from "pages/compare/model/compareJsonLd";

/**
 * `/compare/<a>-vs-<b>` — the indexable half of the compare feature.
 *
 * Unlike `/compare?ids=…`, which is one visitor's working selection and stays out of the
 * index, each of these is a fixed page for a pair people actually cross-shop, generated from
 * the catalog by `entities/product-compare/model/comparePairs`.
 *
 * The loader follows `SingleProduct`'s contract exactly, and for the same reasons: an unknown
 * slug must be a real 404 rather than a 200 serving fallback content, and the reversed slug —
 * a URL people will type and link — must 301 onto the canonical order instead of becoming a
 * second address for the same table.
 */
export async function loader({ params, request }) {
  const pair = getComparePairBySlug(params.pairSlug);
  if (pair) return data({ ids: pair.ids });

  const canonicalSlug = getCanonicalSlugForReversed(params.pairSlug);
  if (canonicalSlug) {
    const url = new URL(request.url);
    const language = getLanguageFromPath(url.pathname);
    const target = localizedPath(getComparePairPath(canonicalSlug), language);
    throw redirect(`${target}${url.search}${url.hash}`, 301);
  }

  return data(null, { status: 404 });
}

/** Both products' titles, in the language-neutral form the catalog stores them in. */
const pairTitles = (ids) => getCompareProducts(ids).map((product) => product.title);

export function meta({ data: loaderData, location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);

  if (!loaderData?.ids) {
    return buildPageMeta({
      title: t("notFoundPage.seoTitle"),
      description: t("notFoundPage.seoDescription"),
      language,
      path: location.pathname,
      noIndex: true,
    });
  }

  const [first, second] = pairTitles(loaderData.ids);
  const fill = (key) =>
    t(key).replace("{{first}}", first ?? "").replace("{{second}}", second ?? "");

  return buildPageMeta({
    title: fill("comparePage.pair.seoTitle"),
    description: fill("comparePage.pair.seoDescription"),
    language,
    path: location.pathname,
  });
}

const ComparePairPage = () => {
  const { pairSlug } = useParams();
  const { t, language } = useLanguage();
  const pair = getComparePairBySlug(pairSlug);

  if (!pair) return <NotFoundContent />;

  const products = getCompareProducts(pair.ids);
  const [first, second] = products.map((product) => product.title);
  const fill = (key) =>
    t(key).replace("{{first}}", first ?? "").replace("{{second}}", second ?? "");

  const heading = fill("comparePage.pair.heading");
  const path = getComparePairPath(pair.slug);

  const jsonLd = buildComparePairJsonLd({
    products,
    language,
    name: heading,
    description: fill("comparePage.pair.seoDescription"),
    path,
    homeLabel: t("footer.columns.primary.home"),
    compareLabel: t("comparePage.heading"),
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
      <div className="cont-width-default mx-auto flex w-full flex-col gap-6 md:gap-8">
        <Breadcrumbs
          items={[
            { label: t("footer.columns.primary.home"), href: "/" },
            { label: t("comparePage.heading"), href: "/compare" },
            { label: heading },
          ]}
        />
        <header className="flex flex-col gap-2">
          <h1 className="m-0 text-xl font-bold text-navy md:text-2xl lg:text-[32px]">{heading}</h1>
          <p className="m-0 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
            {fill("comparePage.pair.intro")}
          </p>
        </header>
        <ProductCompareWidget fixedIds={pair.ids} />
      </div>
    </>
  );
};

export default ComparePairPage;
