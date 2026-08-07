import { AboutUsWidget } from "widgets/about-us";
import { GridCatalogWidget } from "widgets/grid-catalog";
import { ServicesOverviewWidget } from "widgets/services-overview";
import { TopProductsWidget } from "widgets/top-products";
import { VarietyWidget } from "widgets/variety";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";
import { buildHomeJsonLd } from "pages/home/model/homeJsonLd";

const HomePage = () => {
  const { t, language } = useLanguage();

  return (
    <>
      <PageSeo
        title={t("seo.home.title")}
        description={t("seo.home.description")}
        path="/"
        jsonLd={buildHomeJsonLd({
          language,
          siteName: t("seo.siteName"),
          description: t("seo.home.description"),
        })}
      />
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
