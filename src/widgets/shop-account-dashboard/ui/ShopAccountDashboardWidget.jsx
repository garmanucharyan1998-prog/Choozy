import { createElement, useEffect, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaChevronDown,
  FaPen,
  FaPlus,
  FaRegTrashAlt,
  FaSignOutAlt,
  FaSyncAlt,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import {
  resolveShopColorLabel,
  resolveShopMemoryLabel,
  SHOP_COLOR_OPTIONS,
  SHOP_MEMORY_OPTIONS,
  SHOP_PRODUCT_CATEGORY_IDS,
  SHOP_NOTIFICATIONS_PAGE_TABS,
  SHOP_SIDEBAR_IDS,
} from "entities/shop";
import { useShopAccountPresenter } from "features/shop-account";
import { useLogout } from "features/session";
import { formatAmd } from "shared/lib/formatAmd";
import { parseAmdInput } from "shared/lib/parseAmdInput";
import {
  formatAmdPriceConversionParts,
  parseProductAmdAmount,
} from "shared/lib/formatAmdPriceConversions";
import { MainCard, NotificationFeedCard, ToggleRow } from "shared/ui/dashboard-cards";
import ShopFinanceWidget from "widgets/shop-finance";
import ShopStatisticsWidget from "widgets/shop-statistics";

const sidebarItems = [
  { id: SHOP_SIDEBAR_IDS.DETAILS, labelKey: "shopAccount.sidebar.details" },
  { id: SHOP_SIDEBAR_IDS.PRODUCTS, labelKey: "shopAccount.sidebar.products" },
  { id: SHOP_SIDEBAR_IDS.STATISTICS, labelKey: "shopAccount.sidebar.statistics" },
  { id: SHOP_SIDEBAR_IDS.FINANCE, labelKey: "shopAccount.sidebar.finance" },
];

const notificationKeys = ["priceDrops", "wishlistUpdates", "accountNews"];

/** Render order, newest first — see the same note in `AccountDashboardWidget`. */
const NOTIFICATIONS_FEED_ITEM_KEYS = [
  "favoriteAdded",
  "competitorPrice",
  "shopVisits",
  "stockLow",
  "viewsSpike",
  "listingApproved",
  "comparisonAppearance",
  "listingExpiring",
  "weeklyReport",
  "payoutSent",
  "photoRejected",
  "subscriptionRenewed",
];

const SHOP_NAV_SCROLL_CLASS =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory";

const ShopFormSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  triggerClassName = "",
  required = false,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? "";

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handlePointerDownOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => document.removeEventListener("pointerdown", handlePointerDownOutside);
  }, [open]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  const handleSelect = (nextValue) => {
    setOpen(false);
    onChange(nextValue);
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0 max-w-full">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={!selectedOption && placeholder ? placeholder : undefined}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        lang={typeof document !== "undefined" ? document.documentElement.lang : undefined}
        className={`${triggerClassName} flex w-full max-w-full items-center justify-between gap-2 text-start ${
          !selectedOption ? "text-text-muted" : "text-text-dark"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start">
          {displayLabel}
        </span>
        <FaChevronDown
          className={`h-3 w-3 shrink-0 text-[#64748b] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 m-0 max-h-[min(14rem,50vh)] w-full max-w-full list-none overflow-y-auto overscroll-contain rounded-[10px] border border-[#b8c8e8] bg-white py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-pressed={isSelected}
                  lang={typeof document !== "undefined" ? document.documentElement.lang : undefined}
                  className={`w-full border-0 px-3 py-2.5 text-start text-sm transition ${
                    isSelected
                      ? "bg-[#eef3ff] font-medium text-navy hover:bg-[#eef3ff]"
                      : "bg-transparent text-text-dark hover:bg-[#f4f6fb]"
                  }`}
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    event.stopPropagation();
                    handleSelect(option.value);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {required ? (
        <input
          tabIndex={-1}
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          value={value}
          required
          onChange={() => {}}
        />
      ) : null}
    </div>
  );
};

const PRODUCT_ROW_ACTION_BTN_CLASS =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#64748b] transition-all duration-200 hover:bg-white hover:text-link-blue hover:shadow-[0_1px_3px_rgba(15,23,42,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-active-blue";

const PRODUCT_ROW_ACTIONS_GROUP_CLASS =
  "inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#e8ecf3] bg-[#f7f9fc] p-0.5";

const ProductTableRowActions = ({
  onEdit,
  onRefresh,
  onDelete,
  editAriaLabel,
  refreshAriaLabel,
  deleteAriaLabel,
}) => (
  <div className={PRODUCT_ROW_ACTIONS_GROUP_CLASS} role="group">
    <button
      type="button"
      onClick={onEdit}
      className={PRODUCT_ROW_ACTION_BTN_CLASS}
      aria-label={editAriaLabel}
    >
      <FaPen size={11} aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onRefresh}
      className={PRODUCT_ROW_ACTION_BTN_CLASS}
      aria-label={refreshAriaLabel}
    >
      <FaSyncAlt size={11} aria-hidden="true" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      className={`${PRODUCT_ROW_ACTION_BTN_CLASS} hover:text-[#b91c1c] hover:bg-[#fef2f2]`}
      aria-label={deleteAriaLabel}
    >
      <FaRegTrashAlt size={12} aria-hidden="true" />
    </button>
  </div>
);

const ShopProductPriceButton = ({
  product,
  priceText,
  inputClassName,
  editAriaLabel,
  onStartEdit,
  alignEnd = true,
}) => {
  const [showConversionPopup, setShowConversionPopup] = useState(false);
  const conversion = formatAmdPriceConversionParts(parseProductAmdAmount(product));

  return (
    <div
      className={`relative inline-flex whitespace-nowrap ${
        alignEnd ? "w-full max-w-[8.5rem] justify-end" : "w-auto max-w-none justify-start"
      }`}
      onMouseEnter={() => setShowConversionPopup(true)}
      onMouseLeave={() => setShowConversionPopup(false)}
      onFocus={() => setShowConversionPopup(true)}
      onBlur={() => setShowConversionPopup(false)}
    >
      {showConversionPopup && conversion ? (
        <div
          id={`price-tip-${product.id}`}
          role="tooltip"
          className={`pointer-events-none absolute bottom-[calc(100%+6px)] z-30 whitespace-nowrap rounded-lg border border-[#e8ecf3] bg-white px-3 py-2 shadow-[0_4px_18px_rgba(15,23,42,0.12)] ${
            alignEnd ? "right-0" : "left-0"
          }`}
        >
          <p className="m-0 text-xs font-normal leading-none text-[#9ca3af]">
            <span>{conversion.usdLabel}</span>
            <span className="mx-1.5 text-[#cbd5e1]">·</span>
            <span>{conversion.rubLabel}</span>
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onStartEdit}
        className={`${inputClassName} rounded-md border border-transparent bg-transparent px-1 py-0.5 text-base font-bold tabular-nums text-navy transition hover:border-[#b8c8e8] hover:bg-white ${
          alignEnd ? "text-end" : "text-start"
        }`}
        aria-label={editAriaLabel}
        aria-describedby={showConversionPopup && conversion ? `price-tip-${product.id}` : undefined}
      >
        {priceText}
      </button>
    </div>
  );
};

const ShopAccountDashboardWidget = () => {
  const fileInputRef = useRef(null);
  const {
    t,
    shopState,
    activeSidebarId,
    shopInnerTab,
    notificationsPageTab,
    setNotificationsPageTab,
    isShopEditMode,
    profileDraft,
    statusKey,
    dismissStatus,
    sidebarIds,
    innerTabs,
    notificationsTabs,
    selectSidebar,
    selectShopInnerTab,
    enterShopEdit,
    exitShopEdit,
    cancelShopEdit,
    updateProfileDraft,
    updateDescriptionDraft,
    updatePhoneLocal,
    saveShopProfile,
    setAvatarFromFile,
    clearAvatar,
    toggleShopNotification,
    formattedPhone,
    displayWebsiteHref,
    showProductForm,
    editingProductId,
    productDraft,
    catalogProductsForDraft,
    selectedCatalogProduct,
    sortedShopProducts,
    openProductForm,
    openProductEdit,
    cancelProductForm,
    submitProductForm,
    updateProductPrice,
    selectProductCategory,
    selectCatalogProduct,
    refreshShopProduct,
    updateShopProductPrice,
    removeShopProduct,
    setProductAvailability,
    toggleProductMemory,
    toggleProductColor,
  } = useShopAccountPresenter();
  const handleLogout = useLogout();

  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");

  const startInlinePriceEdit = (product) => {
    const parsed = parseAmdInput(product.price) ?? product.priceAmd;
    const raw = typeof parsed === "number" && Number.isFinite(parsed) ? String(parsed) : "";
    setEditingPriceId(product.id);
    setEditingPriceValue(raw);
  };

  const commitInlinePriceEdit = (productId) => {
    updateShopProductPrice(productId, editingPriceValue);
    setEditingPriceId(null);
    setEditingPriceValue("");
  };

  const renderStatusToastOverlay = () =>
    statusKey ? (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-11 -translate-y-[calc(100%+0.75rem)]">
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto flex h-full w-full items-center justify-between gap-3 rounded-[10px] border border-[#cfe8d5] bg-[#f1fbf3] px-5 py-2 text-sm font-medium leading-tight text-[#236736] shadow-sm md:px-8"
        >
          <span className="min-w-0 flex-1 truncate text-start">{t(statusKey)}</span>
          <button
            type="button"
            onClick={dismissStatus}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#236736] transition hover:bg-[#dcefe0]"
            aria-label={t("shopAccount.messages.dismissStatus")}
          >
            <FaTimes className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    ) : null;

  const renderShopAvatar = (editable = false) => (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <div className="h-full w-full overflow-hidden rounded-full border border-[#e1e6ef] bg-[#eceff3]">
        {shopState.avatarDataUrl ? (
          <img src={shopState.avatarDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-navy/40">
            ?
          </div>
        )}
      </div>
      {editable ? (
        <>
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-[#e1e6ef] bg-white text-navy shadow-sm transition hover:bg-accent-blue"
            aria-label={t("shopAccount.avatar.uploadAria")}
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload size={12} aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setAvatarFromFile(file);
              event.target.value = "";
            }}
          />
        </>
      ) : null}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="flex flex-col gap-3">
      {notificationKeys.map((key) => (
        <ToggleRow
          key={key}
          title={t(`shopAccount.notifications.items.${key}.title`)}
          description={t(`shopAccount.notifications.items.${key}.description`)}
          enabled={shopState.notificationPrefs[key]}
          onToggle={() => toggleShopNotification(key)}
        />
      ))}
    </div>
  );

  const renderShopNotificationsFeed = () => (
    <div
      className="flex flex-col gap-3 sm:gap-4"
      role="feed"
      aria-label={t("shopAccount.notificationsPage.title")}
    >
      {NOTIFICATIONS_FEED_ITEM_KEYS.map((itemKey) => (
        <NotificationFeedCard
          key={itemKey}
          title={t(`shopAccount.notificationsPage.feed.items.${itemKey}.title`)}
          timeLabel={t(`shopAccount.notificationsPage.feed.items.${itemKey}.timeLabel`)}
          body={t(`shopAccount.notificationsPage.feed.items.${itemKey}.body`)}
          headingLevel={4}
        />
      ))}
    </div>
  );

  const renderShopNotificationsInner = () => (
    <>
      <h3 className="sr-only">{t("shopAccount.notificationsPage.title")}</h3>
      <div className="border-b border-[#e1e6ef] px-3 pt-2 sm:px-5 md:px-8">
        <div
          className="grid w-full grid-cols-2 sm:flex sm:w-auto sm:gap-8"
          role="group"
          aria-label={t("shopAccount.notificationsPage.tabsAria")}
        >
          <button
            type="button"
            aria-pressed={notificationsPageTab === notificationsTabs.FEED}
            className={`touch-manipulation border-b-2 px-1 py-3.5 text-center text-sm font-bold transition sm:px-0 sm:py-0 sm:pb-3 sm:text-start ${
              notificationsPageTab === notificationsTabs.FEED
                ? "border-navy text-navy"
                : "border-transparent text-text-muted"
            }`}
            onClick={() => setNotificationsPageTab(SHOP_NOTIFICATIONS_PAGE_TABS.FEED)}
          >
            {t("shopAccount.notificationsPage.tabs.feed")}
          </button>
          <button
            type="button"
            aria-pressed={notificationsPageTab === notificationsTabs.SETTINGS}
            className={`touch-manipulation border-b-2 px-1 py-3.5 text-center text-sm font-bold transition sm:px-0 sm:py-0 sm:pb-3 sm:text-start ${
              notificationsPageTab === notificationsTabs.SETTINGS
                ? "border-navy text-navy"
                : "border-transparent text-text-muted"
            }`}
            onClick={() => setNotificationsPageTab(SHOP_NOTIFICATIONS_PAGE_TABS.SETTINGS)}
          >
            {t("shopAccount.notificationsPage.tabs.settings")}
          </button>
        </div>
      </div>
      <div className="px-3 py-4 sm:p-5 md:p-8">
        {notificationsPageTab === notificationsTabs.FEED ? (
          renderShopNotificationsFeed()
        ) : (
          <>
            <p className="mb-4 text-sm leading-relaxed text-text-muted sm:mb-6">
              {t("shopAccount.notificationsPage.settingsIntro")}
            </p>
            {renderNotificationSettings()}
          </>
        )}
      </div>
    </>
  );

  const inputClass =
    "box-border h-11 w-full min-w-0 max-w-full rounded-[10px] border border-[#b8c8e8] bg-white px-3 text-sm text-text-dark outline-none focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40";

  const renderShopReadMode = () => (
    <div className="p-5 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {renderShopAvatar()}
          <p className="font-sans text-[16px] font-medium leading-[24px] text-[#171717]">
            {shopState.profile.shopName}
          </p>
        </div>
        <button
          type="button"
          onClick={enterShopEdit}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-pill bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-active-blue"
        >
          <FaPen size={12} aria-hidden="true" />
          {t("shopAccount.actions.edit")}
        </button>
      </div>
      <p className="pt-5 text-sm leading-relaxed text-navy md:text-[15px]">
        {shopState.profile.description || t("shopAccount.defaultShopDescription")}
      </p>
      <div className="mb-5 border-t border-[#e1e6ef] pt-5" />
      <dl className="flex flex-col gap-[22.5px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">
            {t("shopAccount.fields.emailShort")}
          </dt>
          <dd className="text-sm font-bold text-navy">{shopState.profile.email || "—"}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">
            {t("shopAccount.fields.phoneShort")}
          </dt>
          <dd className="text-sm font-bold text-navy">{formattedPhone}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">
            {t("shopAccount.fields.websiteShort")}
          </dt>
          <dd className="min-w-0 text-sm font-bold">
            {shopState.profile.website ? (
              <a
                href={displayWebsiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link-blue underline decoration-link-blue/30 underline-offset-2"
              >
                {shopState.profile.website}
              </a>
            ) : (
              <span className="text-navy">—</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );

  const renderShopEditMode = () => (
    <form className="p-5 md:p-8" onSubmit={saveShopProfile}>
      <div className="mb-6 flex items-center gap-4">
        {renderShopAvatar(true)}
        {shopState.avatarDataUrl ? (
          <button
            type="button"
            className="text-xs font-semibold text-link-blue underline"
            onClick={clearAvatar}
          >
            {t("shopAccount.avatar.remove")}
          </button>
        ) : null}
      </div>
      <label className="mb-4 flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
        <span>{t("shopAccount.fields.shopNameRequired")}</span>
        <input
          name="shopName"
          value={profileDraft.shopName}
          onChange={updateProfileDraft}
          className={inputClass}
          required
        />
      </label>
      <label className="mb-4 flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
        <span>{t("shopAccount.fields.description")}</span>
        <textarea
          value={profileDraft.description}
          onChange={(e) => updateDescriptionDraft(e.target.value)}
          placeholder={t("shopAccount.defaultShopDescription")}
          rows={4}
          className={`${inputClass} min-h-[100px] resize-y py-2.5`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("shopAccount.fields.emailRequired")}</span>
          <input
            name="email"
            type="email"
            value={profileDraft.email}
            onChange={updateProfileDraft}
            className={inputClass}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("shopAccount.fields.phoneRequired")}</span>
          <div className="flex h-11 items-stretch overflow-hidden rounded-[10px] border border-[#b8c8e8] bg-white">
            <span className="flex shrink-0 items-center border-r border-[#e1e6ef] bg-[#f7f8fc] px-3 text-xs font-bold text-navy">
              +374
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={profileDraft.phoneLocal}
              onChange={(event) => updatePhoneLocal(event.target.value)}
              className="min-w-0 flex-1 border-0 px-3 text-sm text-text-dark outline-none"
              placeholder="93001002"
              aria-label={t("shopAccount.fields.phoneLocalAria")}
            />
          </div>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 pt-4 text-start text-sm font-semibold text-navy sm:col-span-2">
        <span>{t("shopAccount.fields.website")}</span>
        <input
          name="website"
          type="text"
          value={profileDraft.website}
          onChange={updateProfileDraft}
          className={inputClass}
        />
      </label>
      <div className="flex flex-wrap gap-3 pt-6">
        <button
          type="button"
          onClick={cancelShopEdit}
          className="rounded-pill border-0 bg-transparent px-2 py-2 text-sm font-bold text-text-muted underline-offset-4 hover:underline"
        >
          {t("shopAccount.actions.cancel")}
        </button>
        <button
          type="submit"
          className="rounded-pill bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-active-blue"
        >
          {t("shopAccount.actions.save")}
        </button>
      </div>
    </form>
  );

  const renderShopDetailsSection = () => (
    <MainCard className="w-full overflow-hidden p-0">
      <h2 className="sr-only">{t("shopAccount.sidebar.details")}</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e6ef] px-5 pt-5 md:px-8 md:pt-6">
        <div className="flex gap-6" role="group" aria-label={t("shopAccount.shopTabsAria")}>
          <button
            type="button"
            aria-pressed={shopInnerTab === innerTabs.DATA}
            className={`border-b-2 pb-3 text-sm font-bold transition ${
              shopInnerTab === innerTabs.DATA
                ? "border-navy text-navy"
                : "border-transparent text-text-muted"
            }`}
            onClick={() => selectShopInnerTab(innerTabs.DATA)}
          >
            {t("shopAccount.innerTabs.data")}
          </button>
          <button
            type="button"
            aria-pressed={shopInnerTab === innerTabs.NOTIFICATIONS}
            className={`border-b-2 pb-3 text-sm font-bold transition ${
              shopInnerTab === innerTabs.NOTIFICATIONS
                ? "border-navy text-navy"
                : "border-transparent text-text-muted"
            }`}
            onClick={() => selectShopInnerTab(innerTabs.NOTIFICATIONS)}
          >
            {t("shopAccount.innerTabs.notifications")}
          </button>
        </div>
        {isShopEditMode && shopInnerTab === innerTabs.DATA ? (
          <button
            type="button"
            onClick={exitShopEdit}
            className="inline-flex items-center gap-2 text-sm font-bold text-navy"
          >
            <FaArrowLeft size={12} aria-hidden="true" />
            {t("shopAccount.actions.back")}
          </button>
        ) : null}
      </div>
      {shopInnerTab === innerTabs.NOTIFICATIONS
        ? renderShopNotificationsInner()
        : isShopEditMode
          ? renderShopEditMode()
          : renderShopReadMode()}
    </MainCard>
  );

  const renderShopProductsSection = () => {
    /** The visitor’s own currency word, not a hardcoded "AMD" the dictionary never localized. */
    const amd = t("productDetail.currencySuffix");
    const priceLabel = (product) => {
      const raw = typeof product.price === "string" ? product.price.trim() : "";
      if (raw) return `${raw} ${amd}`;
      if (typeof product.priceAmd === "number" && Number.isFinite(product.priceAmd)) {
        return `${formatAmd(product.priceAmd)} ${amd}`;
      }
      return "—";
    };

    const variantChipClass =
      "inline-block rounded-md border border-border-blue bg-white px-2.5 py-1.5 text-xs font-medium text-text-dark";
    const variantChipClassCompact =
      "inline-block rounded-md border border-[#e2e8f3] bg-[#fafbfd] px-2 py-0.5 text-[11px] font-medium leading-snug text-[#64748b]";
    const priceFieldClass =
      "box-border h-9 w-full max-w-[7.75rem] border-0 bg-transparent text-end text-base font-bold tabular-nums text-navy shadow-none ring-0 focus:ring-0";
    const priceFieldClassCard =
      "box-border h-9 w-auto max-w-none border-0 bg-transparent text-start text-xl font-semibold tabular-nums text-text-dark shadow-none ring-0 focus:ring-0";
    const productCellClass = "px-3 py-3 align-middle sm:px-4 md:px-6";

    const renderProductColorSwatches = (product, { card = false } = {}) => {
      const hasManyColors = product.colors.length >= 3;

      return (
        <div
          className={
            card
              ? "flex flex-wrap items-center justify-start gap-2"
              : hasManyColors
                ? "flex justify-center"
                : "flex flex-wrap items-center justify-center gap-2"
          }
        >
          <div className={card || !hasManyColors ? "contents" : "grid w-fit grid-cols-3 gap-1.5"}>
            {product.colors.map((c) => {
              const hex = (c.hex || "").trim().toLowerCase();
              const isWhite =
                hex === "#fff" ||
                hex === "#ffffff" ||
                hex === "#f5f5f7" ||
                hex === "#f5f0e8" ||
                hex === "#f5f5f5";
              return (
                <span
                  key={c.id}
                  title={(c.hex || "").toUpperCase()}
                  className={`inline-block h-6 w-6 shrink-0 rounded-full ${
                    isWhite ? "border border-[#cbd5e1]" : "border border-black/10"
                  }`}
                  style={{ backgroundColor: c.hex || "#ccc" }}
                />
              );
            })}
          </div>
        </div>
      );
    };

    const renderProductPriceEditor = (product, { card = false } = {}) => {
      const fieldClass = card ? priceFieldClassCard : priceFieldClass;

      if (editingPriceId === product.id) {
        return (
          <input
            type="text"
            inputMode="numeric"
            autoFocus
            value={editingPriceValue}
            onChange={(event) => setEditingPriceValue(event.target.value)}
            onBlur={() => commitInlinePriceEdit(product.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitInlinePriceEdit(product.id);
              }
              if (event.key === "Escape") {
                setEditingPriceId(null);
                setEditingPriceValue("");
              }
            }}
            className={`${fieldClass} rounded-md border border-[#b8c8e8] bg-white px-2 outline-none focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40`}
            aria-label={t("shopAccount.products.fields.price")}
          />
        );
      }

      return (
        <ShopProductPriceButton
          product={product}
          priceText={priceLabel(product)}
          inputClassName={fieldClass}
          editAriaLabel={t("shopAccount.products.editPriceAria")}
          onStartEdit={() => startInlinePriceEdit(product)}
          alignEnd={!card}
        />
      );
    };

    const renderProductListCard = (product) => {
      const inStock = product.availability !== "out_of_stock";

      return (
        <li
          key={product.id}
          className="flex flex-col gap-3 border-b border-border-blue px-4 py-4 last:border-b-0 sm:gap-4 sm:px-5 md:px-6"
        >
          <h3 className="m-0">
            <button
              type="button"
              onClick={() => openProductEdit(product.id)}
              className="m-0 w-full cursor-pointer border-0 bg-transparent p-0 text-start text-base font-bold leading-snug text-navy transition hover:text-link-blue hover:underline"
            >
              {product.title}
            </button>
          </h3>

          {product.variants.length > 0 ? (
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label={t("shopAccount.products.fields.memories")}
            >
              {product.variants.map((variant, vIdx) => (
                <span key={`${product.id}-card-v-${vIdx}`} className={variantChipClass}>
                  {variant}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-block shrink-0 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                inStock ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fce7f3] text-[#6d3459]"
              }`}
            >
              {inStock ? t("shopAccount.products.stock.in") : t("shopAccount.products.stock.out")}
            </span>
            {product.colors.length > 0 ? (
              <div className="min-w-0 flex-1">
                {renderProductColorSwatches(product, { card: true })}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 shrink-0">
              {renderProductPriceEditor(product, { card: true })}
            </div>
            <ProductTableRowActions
              onEdit={() => openProductEdit(product.id)}
              onRefresh={() => refreshShopProduct(product.id)}
              onDelete={() => removeShopProduct(product.id)}
              editAriaLabel={t("shopAccount.products.editAria")}
              refreshAriaLabel={t("shopAccount.products.refreshAria")}
              deleteAriaLabel={t("shopAccount.products.deleteAria")}
            />
          </div>
        </li>
      );
    };

    return (
      <MainCard className="w-full min-w-0 overflow-visible 2xl:overflow-hidden">
        <div className="flex flex-col gap-3 px-4 pt-4 sm:gap-4 sm:px-5 sm:pt-5 md:gap-5 md:px-8 md:pt-6">
          <div className="flex flex-col gap-3 min-[425px]:flex-row min-[425px]:flex-wrap min-[425px]:items-center min-[425px]:justify-between">
            <h2 className="m-0 text-lg font-bold text-navy md:text-xl">
              {t("shopAccount.products.listTitle")}
            </h2>
            <button
              type="button"
              onClick={openProductForm}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-pill bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-active-blue min-[425px]:w-auto"
            >
              <FaPlus size={12} aria-hidden="true" />
              {t("shopAccount.products.addShort")}
            </button>
          </div>
          {sortedShopProducts.length > 0 ? (
            <p className="m-0 text-xs leading-relaxed text-text-muted">
              {t("shopAccount.products.staleHint")}
            </p>
          ) : null}
        </div>

        {showProductForm ? (
          <form
            className="relative z-[1] flex flex-col gap-4 border-b border-[#e1e6ef] bg-[#fbfcff] px-4 py-4 sm:px-5 sm:py-5 md:px-8"
            onSubmit={submitProductForm}
          >
            <h3 className="mb-1 text-base font-bold text-navy">
              {editingProductId
                ? t("shopAccount.products.editFormTitle")
                : t("shopAccount.products.formTitle")}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-text-muted">
              {t("shopAccount.products.formHint")}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5 text-start text-sm font-semibold text-navy md:col-span-2">
                <span>{t("shopAccount.products.fields.category")}</span>
                <ShopFormSelect
                  value={productDraft.categoryId}
                  onChange={selectProductCategory}
                  placeholder={t("shopAccount.products.placeholders.category")}
                  options={SHOP_PRODUCT_CATEGORY_IDS.map((categoryId) => ({
                    value: categoryId,
                    label: t(`filterPage.categories.${categoryId}`),
                  }))}
                  triggerClassName={inputClass}
                  required
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1.5 text-start text-sm font-semibold text-navy md:col-span-2">
                <span>{t("shopAccount.products.fields.title")}</span>
                <ShopFormSelect
                  value={productDraft.catalogProductId}
                  onChange={selectCatalogProduct}
                  placeholder={
                    productDraft.categoryId
                      ? t("shopAccount.products.placeholders.product")
                      : t("shopAccount.products.placeholders.productAfterCategory")
                  }
                  options={catalogProductsForDraft.map((product) => ({
                    value: product.id,
                    label: product.title,
                  }))}
                  triggerClassName={inputClass}
                  required
                  disabled={!productDraft.categoryId}
                />
                {productDraft.categoryId && catalogProductsForDraft.length === 0 ? (
                  <span className="text-xs font-normal text-text-muted">
                    {t("shopAccount.products.noProductsInCategory")}
                  </span>
                ) : null}
              </label>
              <label className="flex min-w-0 flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("shopAccount.products.fields.price")}</span>
                <input
                  name="price"
                  value={productDraft.price}
                  onChange={updateProductPrice}
                  className={inputClass}
                  inputMode="numeric"
                  required
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("shopAccount.products.fields.availability")}</span>
                <ShopFormSelect
                  value={productDraft.availability}
                  onChange={setProductAvailability}
                  options={[
                    {
                      value: "in_stock",
                      label: t("shopAccount.products.availabilityOptions.inStock"),
                    },
                    {
                      value: "out_of_stock",
                      label: t("shopAccount.products.availabilityOptions.outOfStock"),
                    },
                  ]}
                  triggerClassName={inputClass}
                />
              </label>
            </div>

            {selectedCatalogProduct?.image ? (
              <div className="flex items-center gap-3">
                <img
                  src={selectedCatalogProduct.image}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-lg border border-[#e1e6ef] bg-white object-contain object-center"
                />
                <p className="m-0 text-xs leading-relaxed text-text-muted">
                  {t("shopAccount.products.catalogImageNote")}
                </p>
              </div>
            ) : null}

            <div className="min-w-0">
              <h4 className="mb-2 text-sm font-semibold text-navy">
                {t("shopAccount.products.fields.memories")}
              </h4>
              <div
                className="flex flex-wrap gap-1.5 sm:gap-2"
                role="group"
                aria-label={t("shopAccount.products.fields.memories")}
              >
                {SHOP_MEMORY_OPTIONS.map((option) => {
                  const selected = productDraft.selectedMemoryIds.includes(option.id);
                  const label = resolveShopMemoryLabel(option, t);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleProductMemory(option.id)}
                      aria-pressed={selected}
                      className={`max-w-full rounded-md border px-2 py-1.5 text-[11px] font-medium leading-tight transition min-[425px]:px-2.5 min-[425px]:text-xs sm:px-3 sm:py-2 sm:text-sm ${
                        selected
                          ? "border-2 border-navy text-navy"
                          : "border-[#b8c8e8] bg-white text-text-dark hover:border-link-blue"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0">
              <h4 className="mb-2 text-sm font-semibold text-navy">
                {t("shopAccount.products.fields.colors")}
              </h4>
              <div
                className="grid grid-cols-1 gap-2 min-[425px]:grid-cols-2 md:gap-2.5 2xl:flex 2xl:flex-wrap 2xl:gap-3"
                role="group"
                aria-label={t("shopAccount.products.fields.colors")}
              >
                {SHOP_COLOR_OPTIONS.map((option) => {
                  const selected = productDraft.selectedColorIds.includes(option.id);
                  const label = resolveShopColorLabel(option, t);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleProductColor(option.id)}
                      aria-pressed={selected}
                      title={label}
                      className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition ${
                        selected
                          ? "border-2 border-navy"
                          : "border-[#e1e6ef] bg-white hover:border-link-blue"
                      }`}
                    >
                      <span
                        className="h-6 w-6 shrink-0 rounded-full border border-black/10 shadow-inner sm:h-7 sm:w-7"
                        style={{ backgroundColor: option.hex }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate text-text-dark">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 min-[425px]:flex-row min-[425px]:flex-wrap min-[425px]:gap-3">
              <button
                type="button"
                onClick={cancelProductForm}
                className="rounded-pill border-0 bg-transparent px-2 py-2 text-sm font-bold text-text-muted underline-offset-4 hover:underline"
              >
                {t("shopAccount.products.cancel")}
              </button>
              <button
                type="submit"
                className="w-full rounded-pill bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-active-blue min-[425px]:w-auto"
              >
                {t("shopAccount.products.save")}
              </button>
            </div>
          </form>
        ) : null}

        {sortedShopProducts.length === 0 && !showProductForm ? (
          <div className="px-4 py-5 sm:px-5 md:p-8">
            <p className="m-0 text-sm leading-relaxed text-text-muted">
              {t("shopAccount.products.empty")}
            </p>
          </div>
        ) : sortedShopProducts.length > 0 ? (
          <div className="w-full max-w-full pt-4 md:pt-5">
            <ul
              className="m-0 list-none overflow-hidden rounded-lg border border-[#eef1f6] bg-white p-0 xl:hidden"
              aria-label={t("shopAccount.products.tableAria")}
            >
              {sortedShopProducts.map((product) => renderProductListCard(product))}
            </ul>

            <div className="hidden overflow-x-auto rounded-lg border border-[#eef1f6] pb-5 [-webkit-overflow-scrolling:touch] xl:block xl:pb-8">
              <table
                className="w-full min-w-[36rem] table-fixed border-collapse text-sm"
                aria-label={t("shopAccount.products.tableAria")}
              >
                <thead>
                  <tr className="border-b border-[#e8ecf3] bg-[#f6f8fc] text-[#64748b]">
                    <th
                      scope="col"
                      className={`w-[40%] ${productCellClass} text-start text-xs font-semibold tracking-wide`}
                    >
                      {t("shopAccount.products.tableHeaders.product")}
                    </th>
                    <th
                      scope="col"
                      className={`w-[14%] ${productCellClass} text-center text-xs font-semibold`}
                    >
                      {t("shopAccount.products.tableHeaders.available")}
                    </th>
                    <th
                      scope="col"
                      className={`w-[18%] ${productCellClass} text-center text-xs font-semibold`}
                    >
                      {t("shopAccount.products.tableHeaders.color")}
                    </th>
                    <th scope="col" className={`w-[28%] ${productCellClass}`}>
                      <div className="flex items-center justify-end gap-3">
                        <span className="min-w-0 flex-1 text-center text-xs font-semibold">
                          {t("shopAccount.products.tableHeaders.price")}
                        </span>
                        <div
                          className={`${PRODUCT_ROW_ACTIONS_GROUP_CLASS} invisible pointer-events-none`}
                          aria-hidden="true"
                        >
                          <span className="h-7 w-7" />
                          <span className="h-7 w-7" />
                          <span className="h-7 w-7" />
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedShopProducts.map((product) => {
                    const inStock = product.availability !== "out_of_stock";

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-[#eef1f6] transition-colors last:border-b-0 hover:bg-[#fafbfd]"
                      >
                        <td className={productCellClass}>
                          <h3 className="m-0 text-[length:inherit] font-[inherit] leading-[inherit]">
                            <button
                              type="button"
                              onClick={() => openProductEdit(product.id)}
                              className="m-0 cursor-pointer border-0 bg-transparent p-0 text-start font-bold leading-snug text-[#0f172a] transition hover:text-navy hover:underline"
                            >
                              {product.title}
                            </button>
                          </h3>
                          {product.variants.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {product.variants.map((variant, vIdx) => (
                                <span
                                  key={`${product.id}-v-${vIdx}`}
                                  className={variantChipClassCompact}
                                >
                                  {variant}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </td>
                        <td className={`${productCellClass} text-center`}>
                          <span
                            className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-semibold ${
                              inStock
                                ? "bg-[#dcfce7] text-[#166534]"
                                : "bg-[#fce7f3] text-[#6d3459]"
                            }`}
                          >
                            {inStock
                              ? t("shopAccount.products.stock.in")
                              : t("shopAccount.products.stock.out")}
                          </span>
                        </td>
                        <td className={productCellClass}>{renderProductColorSwatches(product)}</td>
                        <td className={`${productCellClass} overflow-visible`}>
                          <div className="flex items-center justify-end gap-3">
                            <div className="min-w-0 flex-1 text-end">
                              {renderProductPriceEditor(product)}
                            </div>
                            <ProductTableRowActions
                              onEdit={() => openProductEdit(product.id)}
                              onRefresh={() => refreshShopProduct(product.id)}
                              onDelete={() => removeShopProduct(product.id)}
                              editAriaLabel={t("shopAccount.products.editAria")}
                              refreshAriaLabel={t("shopAccount.products.refreshAria")}
                              deleteAriaLabel={t("shopAccount.products.deleteAria")}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </MainCard>
    );
  };

  const renderMain = () => {
    switch (activeSidebarId) {
      case sidebarIds.PRODUCTS:
        return renderShopProductsSection();
      case sidebarIds.STATISTICS:
        return <ShopStatisticsWidget />;
      case sidebarIds.FINANCE:
        return createElement(ShopFinanceWidget);
      case sidebarIds.DETAILS:
      default:
        return renderShopDetailsSection();
    }
  };

  return (
    <section
      className="w-full min-w-0 py-4 md:py-6 2xl:py-10"
      aria-labelledby="shop-account-page-heading"
    >
      <div className="cont-width-default mx-auto min-w-0">
        <h1
          id="shop-account-page-heading"
          className="mb-4 text-start text-xl font-bold text-navy min-[425px]:mb-5 min-[425px]:text-2xl md:text-[26px]"
        >
          {t("shopAccount.pageTitle")}
        </h1>

        <div className="flex min-w-0 flex-col gap-4 md:gap-5 lg:flex-row lg:items-start lg:gap-6">
          <aside className="w-full min-w-0 shrink-0 lg:w-[240px] 2xl:w-[280px]">
            <nav
              className="rounded-[12px] border border-[#e1e6ef] bg-white p-1.5 shadow-sm min-[425px]:p-2"
              aria-label={t("shopAccount.sidebarNavAria")}
            >
              <ul
                className={`m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 lg:flex-col lg:overflow-visible ${SHOP_NAV_SCROLL_CLASS}`}
              >
                {sidebarItems.map((item) => {
                  const active = activeSidebarId === item.id;
                  return (
                    <li key={item.id} className="w-auto shrink-0 snap-start lg:w-full">
                      <button
                        type="button"
                        onClick={() => selectSidebar(item.id)}
                        className={`w-full whitespace-nowrap rounded-[10px] border-0 px-3 py-2.5 text-start text-xs font-bold transition min-[425px]:px-4 min-[425px]:py-3 min-[425px]:text-sm lg:whitespace-normal ${
                          active
                            ? "bg-[#eef3ff] text-navy"
                            : "bg-transparent text-text-muted hover:bg-[#f4f6fb] hover:text-navy"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        {t(item.labelKey)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Outside the nav (not a sidebarItems entry): logout is a form submission via
                useLogout, not a selectSidebar(id) tab switch, and keeping it out of the
                <ul> keeps the tabs' aria-current="page" semantics honest. */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#e1e6ef] bg-white px-4 py-3 text-sm font-bold text-navy transition hover:bg-[#f4f6fb]"
            >
              <FaSignOutAlt size={14} aria-hidden="true" />
              {t("auth.logout")}
            </button>
          </aside>

          <div className="relative min-w-0 flex-1">
            {renderStatusToastOverlay()}
            {renderMain()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopAccountDashboardWidget;
