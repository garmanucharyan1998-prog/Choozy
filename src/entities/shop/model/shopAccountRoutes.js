import { stripLanguageFromPath } from "shared/lib/locale";
import { SHOP_SIDEBAR_IDS } from "./shopAccountModel";

/**
 * Which URL each section of the seller workspace lives at, and the reverse.
 *
 * The dashboard's four sections are four real routes, so two very different callers need this
 * mapping: the presenter, to turn the current pathname into the active tab and to navigate when
 * one is clicked, and the page's `meta()`, to give each route its own `<title>` and canonical.
 * `meta()` runs as a plain function outside the component tree, so it cannot reach into a
 * presenter — hence the mapping lives here, in the one layer both of them may import, instead of
 * being written out twice and drifting.
 *
 * It drifting is not hypothetical: every one of the four routes used to answer with the same
 * title, so the browser tab said "Shop account" whether the seller was on statistics or on
 * finance, and four consecutive history entries were indistinguishable from each other.
 */
export const SHOP_ACCOUNT_ROOT_PATH = "/account/shop-account";

export const SHOP_ACCOUNT_PATH_BY_SIDEBAR = {
  [SHOP_SIDEBAR_IDS.DETAILS]: SHOP_ACCOUNT_ROOT_PATH,
  [SHOP_SIDEBAR_IDS.PRODUCTS]: `${SHOP_ACCOUNT_ROOT_PATH}/products`,
  [SHOP_SIDEBAR_IDS.STATISTICS]: `${SHOP_ACCOUNT_ROOT_PATH}/statistics`,
  [SHOP_SIDEBAR_IDS.FINANCE]: `${SHOP_ACCOUNT_ROOT_PATH}/finance`,
};

const SIDEBAR_ID_BY_PATH = Object.fromEntries(
  Object.entries(SHOP_ACCOUNT_PATH_BY_SIDEBAR).map(([id, path]) => [path, id]),
);

/**
 * The heading each section shows, and — for the three below the root — its `<title>`. One
 * source, so the tab, the history entry and the `<h1>` cannot say three different things.
 */
export const SHOP_SIDEBAR_LABEL_KEYS = {
  [SHOP_SIDEBAR_IDS.DETAILS]: "shopAccount.sidebar.details",
  [SHOP_SIDEBAR_IDS.PRODUCTS]: "shopAccount.sidebar.products",
  [SHOP_SIDEBAR_IDS.STATISTICS]: "shopAccount.sidebar.statistics",
  [SHOP_SIDEBAR_IDS.FINANCE]: "shopAccount.sidebar.finance",
};

/**
 * Accepts a pathname with or without a language prefix, with or without a trailing slash, in
 * any case — `meta()` sees whatever the visitor typed, and the router matches routes
 * case-insensitively.
 *
 * @param {string} pathname
 * @returns {string} a `SHOP_SIDEBAR_IDS` member; the details tab for anything unrecognised.
 */
export const shopSidebarIdFromPath = (pathname) => {
  const base = stripLanguageFromPath(pathname || "")
    .replace(/\/+$/, "")
    .toLowerCase();
  return SIDEBAR_ID_BY_PATH[base] ?? SHOP_SIDEBAR_IDS.DETAILS;
};

/** @param {string} sidebarId */
export const shopAccountPathForSidebar = (sidebarId) =>
  SHOP_ACCOUNT_PATH_BY_SIDEBAR[sidebarId] ?? SHOP_ACCOUNT_ROOT_PATH;
