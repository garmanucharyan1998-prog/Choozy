import { ShopAccountDashboardWidget } from "widgets/shop-account-dashboard";
import { requireAccountAccess } from "entities/session";
import {
  shopAccountPathForSidebar,
  shopSidebarIdFromPath,
  SHOP_SIDEBAR_IDS,
  SHOP_SIDEBAR_LABEL_KEYS,
} from "entities/shop";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

/** Bounces anonymous visitors home and buyers to their own dashboard — see entities/session. */
export function loader({ request }) {
  requireAccountAccess(request);
  return null;
}

/**
 * One page component serves four routes (`/account/shop-account` and its products, statistics
 * and finance tabs), and each of them used to answer with the same `<title>` and the same
 * canonical: the browser tab read "Shop account" wherever the seller was, and four consecutive
 * history entries were indistinguishable from one another.
 *
 * The section is derived from the pathname with `shopSidebarIdFromPath` — the same function the
 * dashboard uses to decide which tab is active — so the tab title, the history entry and the
 * page's own `<h1>` are three readings of one answer. The root keeps the area's own SEO title
 * because it is the entry point; the three tabs are named by their sidebar labels, composed
 * with `seo.siteName` the way every other titled page on this site composes its own.
 */
export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  const sidebarId = shopSidebarIdFromPath(location.pathname);

  return buildPageMeta({
    title:
      sidebarId === SHOP_SIDEBAR_IDS.DETAILS
        ? t("seo.shopAccount.title")
        : `${t(SHOP_SIDEBAR_LABEL_KEYS[sidebarId])} — ${t("seo.siteName")}`,
    description: t("seo.shopAccount.description"),
    language,
    path: shopAccountPathForSidebar(sidebarId),
    noIndex: true,
  });
}

const ShopAccountPage = () => <ShopAccountDashboardWidget />;

export default ShopAccountPage;
