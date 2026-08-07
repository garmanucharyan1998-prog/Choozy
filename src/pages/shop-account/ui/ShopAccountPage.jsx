import { ShopAccountDashboardWidget } from "widgets/shop-account-dashboard";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";

const ShopAccountPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo
        title={t("seo.shopAccount.title")}
        description={t("seo.shopAccount.description")}
        path="/account/shop-account"
        noIndex
      />
      <ShopAccountDashboardWidget />
    </>
  );
};

export default ShopAccountPage;
