import { AccountDashboardWidget } from "widgets/account-dashboard";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: t("seo.account.title"),
    description: t("seo.account.description"),
    language,
    path: "/account",
    noIndex: true,
  });
}

const AccountPage = () => <AccountDashboardWidget />;

export default AccountPage;
