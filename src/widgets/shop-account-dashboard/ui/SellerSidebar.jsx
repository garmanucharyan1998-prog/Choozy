import { FaBoxOpen, FaChartLine, FaSignOutAlt, FaStore, FaWallet } from "react-icons/fa";
import { SHOP_SIDEBAR_IDS } from "entities/shop";
import { FOCUS_RING, SURFACE_RAISED } from "./sellerUi";

/**
 * Where the seller is, whose shop it is, and how to leave.
 *
 * Three jobs, in that order, and the order is the point. The old sidebar was four unlabelled
 * text tabs with a logout button underneath styled exactly like them — the same white card, the
 * same weight, a thumb's width away from an ordinary navigation choice (§70). Identity now sits
 * above the navigation (a workspace should say whose it is), and signing out sits below a
 * divider in muted type, reachable but not mistakable for a tab.
 *
 * Two layouts, not one shrunk: a rail from `lg` up, where the seller reads down a column and
 * the active row carries an accent bar; a snap-scrolling strip of icon-and-label chips below
 * it, with identity and logout sharing the row above. Both render the same `<nav>` with the
 * same `aria-current="page"`, so "where am I" is answered identically to a screen reader.
 */
const NAV_ITEMS = [
  { id: SHOP_SIDEBAR_IDS.DETAILS, labelKey: "shopAccount.sidebar.details", Icon: FaStore },
  { id: SHOP_SIDEBAR_IDS.PRODUCTS, labelKey: "shopAccount.sidebar.products", Icon: FaBoxOpen },
  {
    id: SHOP_SIDEBAR_IDS.STATISTICS,
    labelKey: "shopAccount.sidebar.statistics",
    Icon: FaChartLine,
  },
  { id: SHOP_SIDEBAR_IDS.FINANCE, labelKey: "shopAccount.sidebar.finance", Icon: FaWallet },
];

/** Hides the strip's scrollbar without hiding the fact that it scrolls (the chips are clipped). */
const STRIP_SCROLL =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x";

const ShopIdentity = ({ shopState, compact = false }) => {
  const initial = (shopState.profile.shopName || "?").trim().charAt(0).toUpperCase();
  return (
    <div className={`flex min-w-0 items-center gap-3 ${compact ? "" : "px-1 pb-3 pt-1"}`}>
      <div
        className={`shrink-0 overflow-hidden rounded-full border border-[#e1e6ef] bg-[#eef1f6] ${
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
      >
        {shopState.avatarDataUrl ? (
          <img src={shopState.avatarDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-bold text-navy/50">
            {initial}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold leading-tight text-navy">
          {shopState.profile.shopName}
        </p>
        <p className="m-0 truncate text-xs leading-tight text-text-muted">
          {shopState.profile.email}
        </p>
      </div>
    </div>
  );
};

export const SellerSidebar = ({ t, shopState, activeSidebarId, onSelect, onRequestLogout }) => {
  const navLabel = t("shopAccount.sidebarNavAria");

  const renderRailItem = (item) => {
    const active = activeSidebarId === item.id;
    const { Icon } = item;
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          aria-current={active ? "page" : undefined}
          className={`relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-start text-sm font-semibold transition ${FOCUS_RING} ${
            active
              ? "bg-[#eef3ff] text-navy"
              : "bg-transparent text-text-muted hover:bg-[#f4f6fb] hover:text-navy"
          }`}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-y-1.5 start-0 w-[3px] rounded-full ${
              active ? "bg-navy" : "bg-transparent"
            }`}
          />
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{t(item.labelKey)}</span>
        </button>
      </li>
    );
  };

  const renderStripItem = (item) => {
    const active = activeSidebarId === item.id;
    const { Icon } = item;
    return (
      <li key={item.id} className="shrink-0 snap-start">
        <button
          type="button"
          onClick={() => onSelect(item.id)}
          aria-current={active ? "page" : undefined}
          className={`flex items-center gap-2 whitespace-nowrap rounded-[10px] border px-3 py-2.5 text-sm font-semibold transition ${FOCUS_RING} ${
            active
              ? "border-navy bg-[#eef3ff] text-navy"
              : "border-[#e1e6ef] bg-white text-text-muted hover:text-navy"
          }`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t(item.labelKey)}
        </button>
      </li>
    );
  };

  const logoutButtonClass = `flex items-center justify-center gap-2 rounded-[10px] text-sm font-semibold text-text-muted transition hover:bg-[#fef2f2] hover:text-[#991b1b] ${FOCUS_RING}`;

  return (
    <>
      {/* Rail — lg and up. */}
      <div className={`hidden lg:block ${SURFACE_RAISED} p-2.5`}>
        <ShopIdentity shopState={shopState} />
        <div className="mb-2 border-t border-[#eef1f6]" />
        <nav aria-label={navLabel}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">{NAV_ITEMS.map(renderRailItem)}</ul>
        </nav>
        {/*
          Outside the nav on purpose: logging out is a form submission, not a `selectSidebar(id)`
          tab switch, and keeping it out of the <ul> keeps the tabs' aria-current="page"
          semantics honest.
        */}
        <div className="mt-2 border-t border-[#eef1f6] pt-2">
          <button
            type="button"
            onClick={onRequestLogout}
            className={`${logoutButtonClass} w-full px-3 py-2.5`}
          >
            <FaSignOutAlt className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t("auth.logout")}
          </button>
        </div>
      </div>

      {/* Strip — below lg. */}
      <div className={`lg:hidden ${SURFACE_RAISED} p-2.5`}>
        <div className="flex items-center gap-2">
          <ShopIdentity shopState={shopState} compact />
          <button
            type="button"
            onClick={onRequestLogout}
            className={`${logoutButtonClass} h-9 w-9 shrink-0 border border-[#e1e6ef]`}
            aria-label={t("auth.logout")}
          >
            <FaSignOutAlt className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label={navLabel} className="mt-2.5 border-t border-[#eef1f6] pt-2.5">
          <ul className={`m-0 flex list-none flex-row gap-2 overflow-x-auto p-0 ${STRIP_SCROLL}`}>
            {NAV_ITEMS.map(renderStripItem)}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default SellerSidebar;
