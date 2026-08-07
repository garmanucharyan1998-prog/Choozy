import { AccountDashboardWidget } from "widgets/account-dashboard";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";

const AccountPage = () => {
  const { t } = useLanguage();

  return (
    <>
      <PageSeo
        title={t("seo.account.title")}
        description={t("seo.account.description")}
        path="/account"
        noIndex
      />
      <AccountDashboardWidget />
    </>
  );
};

export default AccountPage;
