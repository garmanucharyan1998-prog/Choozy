import { ShopAccountDashboardWidget } from "widgets/shop-account-dashboard";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: t("seo.shopAccount.title"),
    description: t("seo.shopAccount.description"),
    language,
    path: "/account/shop-account",
    noIndex: true,
  });
}

const ShopAccountPage = () => <ShopAccountDashboardWidget />;

export default ShopAccountPage;
