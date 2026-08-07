import { AboutUsWidget } from "widgets/about-us";
import { GridCatalogWidget } from "widgets/grid-catalog";
import { ServicesOverviewWidget } from "widgets/services-overview";
import { TopProductsWidget } from "widgets/top-products";
import { VarietyWidget } from "widgets/variety";
import { useLanguage } from "contexts";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";
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

const HomePage = () => {
  const { t, language } = useLanguage();
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
      <TopProductsWidget />
      <AboutUsWidget />
      <VarietyWidget />
      <ServicesOverviewWidget />
    </>
  );
};

export default HomePage;
