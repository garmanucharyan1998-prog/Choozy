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
      <h1 className="sr-only">{t("home.pageTitle")}</h1>
      <GridCatalogWidget />
      <TopProductsWidget items={withDescriptions(topProducts)} />
      <AboutUsWidget />
      <VarietyWidget items={withDescriptions(varietyProducts)} />
      <ServicesOverviewWidget />
    </>
  );
};

export default HomePage;
