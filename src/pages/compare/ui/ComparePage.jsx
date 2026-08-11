import { useLanguage } from "contexts";
import { ProductCompareWidget } from "widgets/product-compare";
import { getTranslator } from "shared/i18n";
import { getLanguageFromPath } from "shared/lib/locale";
import { buildPageMeta } from "shared/lib/seo";
import { Breadcrumbs } from "shared/ui/breadcrumbs";
import { resolveCompareCanonical } from "pages/compare/model/compareSeo";

/**
 * Was a `ComingSoon` placeholder carrying `noindex` — the one such stub with a real feature
 * behind it rather than missing copy.
 *
 * The bare URL is a landing page and is indexed: "compare prices in Armenia" is the query this
 * site exists to answer, and it had no page pointing at it. A URL carrying `?ids=` is a
 * visitor's own working selection — one of thousands of thin variations on the same table — so
 * it canonicalizes back onto the landing page and stays out of the index. `/filter?page=N`
 * already taught this project what an unbounded family of self-canonical URLs costs.
 */
export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  const { path, noIndex } = resolveCompareCanonical(location.search);

  return buildPageMeta({
    title: t("comparePage.seoTitle"),
    description: t("comparePage.seoDescription"),
    language,
    path,
    noIndex,
  });
}

const ComparePage = () => {
  const { t } = useLanguage();

  return (
    <div className="cont-width-default mx-auto flex w-full flex-col gap-6 md:gap-8">
      <Breadcrumbs
        items={[
          { label: t("footer.columns.primary.home"), href: "/" },
          { label: t("navPanel.catalogLabel"), href: "/filter" },
          { label: t("comparePage.heading") },
        ]}
      />
      <header className="flex flex-col gap-2">
        <h1 className="m-0 text-xl font-bold text-navy md:text-2xl lg:text-[32px]">
          {t("comparePage.heading")}
        </h1>
        <p className="m-0 max-w-3xl text-sm leading-relaxed text-text-muted md:text-base">
          {t("comparePage.intro")}
        </p>
      </header>
      <ProductCompareWidget />
    </div>
  );
};

export default ComparePage;
