import { useMemo } from "react";
import { useLoaderData } from "react-router";
import { AboutUsWidget } from "widgets/about-us";
import { GridCatalogWidget } from "widgets/grid-catalog";
import { ServicesOverviewWidget } from "widgets/services-overview";
import { TopProductsWidget } from "widgets/top-products";
import { VarietyWidget } from "widgets/variety";
import { useLanguage } from "contexts";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";
import { PageIntro } from "shared/ui/page-intro";
import {
  buildProductDescription,
  getTopCatalogProducts,
  getVarietyCatalogProducts,
} from "entities/product";
import { buildHomeJsonLd } from "pages/home/model/homeJsonLd";

export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: t("seo.home.title"),
    description: t("seo.home.description"),
    language,
    path: "/",
  });
}

/**
 * Top/variety products load here instead of the widgets fetching them client-side
 * after mount (the previous `useAsyncItemsPresenter` pattern): that pattern rendered
 * an empty `useState([])` on the server and only populated after the client's effect
 * ran, so the two carousels — the highest-traffic content on the site — were
 * completely absent from the raw SSR response (confirmed by curling the built server
 * output: zero product titles, zero `<h3>` product headings, zero product links).
 */
export function loader() {
  return {
    topProducts: getTopCatalogProducts(),
    varietyProducts: getVarietyCatalogProducts(),
  };
}

const HomePage = () => {
  const { topProducts, varietyProducts } = useLoaderData();
  const { t, language } = useLanguage();

  /**
   * Descriptions are resolved here, not inside the carousel: `shared/ui` may not reach into
   * `entities`, and a page may. The carousel just renders the text it is handed.
   */
  const withDescriptions = useMemo(
    () => (items) => items.map((item) => ({ ...item, description: buildProductDescription(item, t) })),
    [t],
  );
  const jsonLd = buildHomeJsonLd({
    language,
    siteName: t("seo.siteName"),
    description: t("seo.home.description"),
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
      <GridCatalogWidget />
      {/**
       * A visible H1 and a paragraph naming what the site actually does. Both used to be
       * `sr-only`, which is valid HTML and fine for assistive tech but leaves the page's
       * main heading as text search engines discount — on the one page most likely to rank
       * for the site's own name and for "price comparison Armenia".
       *
       * It sits below the category grid rather than above it, which costs nothing that matters
       * to search: the H1 is still a real, unique, keyword-bearing heading in the main content
       * of the server-rendered HTML, and putting the grid first actually helps LCP, since the
       * grid holds the image already marked `fetchPriority="high"`. The one trade is that the
       * grid's `sr-only` section heading now precedes the H1 in the outline — an allowed
       * descent (h2 → h1), not a skipped level.
       *
       * No category links here. They were tried and removed: the category bar already links all
       * eight categories with the same labels, so a second row of them was a visual duplicate
       * that bought no internal-linking value either.
       */}
      <PageIntro
        /** Follows the category grid, so it has to open a gap the grid does not provide. */
        className="mt-6 md:mt-8"
        eyebrow={t("homeIntro.eyebrow")}
        heading={t("homeIntro.heading")}
        body={t("homeIntro.body")}
        footnote={t("homeIntro.trust")}
      />
      <TopProductsWidget items={withDescriptions(topProducts)} />
      <AboutUsWidget />
      <VarietyWidget items={withDescriptions(varietyProducts)} />
      <ServicesOverviewWidget />
    </>
  );
};

export default HomePage;
