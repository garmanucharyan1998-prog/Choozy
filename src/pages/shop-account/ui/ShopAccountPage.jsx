import { ShopAccountDashboardWidget } from "widgets/shop-account-dashboard";
import { requireAccountAccess } from "entities/session";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

/** Bounces anonymous visitors home and buyers to their own dashboard — see entities/session. */
export function loader({ request }) {
  requireAccountAccess(request);
  return null;
}

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
