import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  FaArrowLeft,
  FaBalanceScale,
  FaHeart,
  FaPen,
  FaRegHeart,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { SIDEBAR_IDS, toggleWishlistProduct } from "entities/user";
import { getProductDetailHref } from "entities/product-detail";
import { useAccountPresenter } from "features/account";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";
import { MainCard, NotificationFeedCard, ToggleRow } from "shared/ui/dashboard-cards";
import { ProductCardImage } from "shared/ui/product-card-image";
import { LocalizedLink } from "shared/ui/link";

const sidebarItems = [
  { id: SIDEBAR_IDS.PERSONAL, labelKey: "account.sidebar.personal" },
  { id: SIDEBAR_IDS.WISHLIST, labelKey: "account.sidebar.wishlist" },
  { id: SIDEBAR_IDS.RECENT, labelKey: "account.sidebar.recent" },
  { id: SIDEBAR_IDS.SUBSCRIPTION, labelKey: "account.sidebar.subscription" },
  { id: SIDEBAR_IDS.NOTIFICATIONS, labelKey: "account.sidebar.notifications" },
];

const notificationKeys = ["priceDrops", "wishlistUpdates", "accountNews"];

const NOTIFICATIONS_PAGE_TABS = {
  FEED: "feed",
  SETTINGS: "settings",
};

const NOTIFICATIONS_FEED_ITEM_KEYS = ["recent", "hour", "dated"];

const RECENT_INITIAL_VISIBLE_COUNT = 4;
const RECENT_LOAD_MORE_STEP = 4;

const WISHLIST_ACTION_BTN =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[rgba(21,33,71,1)] shadow-[0_2px_6px_rgba(0,0,0,0.07)] transition-colors hover:bg-[#f8f9fc] active:scale-[0.98] xl:h-10 xl:w-10 xl:shadow-[0_2px_8px_rgba(0,0,0,0.08)]";

const WISHLIST_ACTION_ICON = "h-3.5 w-3.5 xl:h-4 xl:w-4";

/**
 * @param {{
 *   item: { id: string, title: string, description: string, price: string, image: string, href: string };
 *   detailTo: string;
 *   inCompare: boolean;
 *   onToggleCompare: () => void;
 *   onHeartClick: () => void;
 *   heartFilled: boolean;
 *   compareAria: string;
 *   heartAria: string;
 * }} props
 */
const AccountGridProductCard = ({
  item,
  detailTo,
  inCompare,
  onToggleCompare,
  onHeartClick,
  heartFilled,
  compareAria,
  heartAria,
}) => (
  <article className="relative flex flex-col text-start">
    <ProductCardImage src={item.image} alt={item.title}>
      <div className="pointer-events-auto absolute right-2 top-2 z-20 flex flex-col gap-1.5 xl:right-3 xl:top-3 xl:gap-2">
        <button
          type="button"
          onClick={onToggleCompare}
          aria-pressed={inCompare}
          aria-label={compareAria}
          className={WISHLIST_ACTION_BTN}
        >
          <FaBalanceScale className={WISHLIST_ACTION_ICON} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onHeartClick}
          aria-pressed={heartFilled}
          aria-label={heartAria}
          className={WISHLIST_ACTION_BTN}
        >
          {heartFilled ? (
            <FaHeart className={`${WISHLIST_ACTION_ICON} text-active-blue`} aria-hidden />
          ) : (
            <FaRegHeart className={WISHLIST_ACTION_ICON} aria-hidden />
          )}
        </button>
      </div>
    </ProductCardImage>
    {/* One stretched link per card — the title stays the anchor text. */}
    <LocalizedLink
      to={detailTo}
      className="flex min-w-0 flex-col gap-1 pt-3 no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
    >
      <h3 className="m-0 line-clamp-2 text-sm font-bold text-navy sm:text-base">{item.title}</h3>
      <p className="m-0 line-clamp-2 text-xs text-text-muted sm:text-sm" title={item.description}>
        {item.description}
      </p>
      <p className="m-0 pt-0.5 text-sm font-semibold text-link-blue sm:text-base">{item.price}</p>
    </LocalizedLink>
  </article>
);

const AccountDashboardWidget = () => {
  const fileInputRef = useRef(null);
  const [wishlistCompare, setWishlistCompare] = useState(() => ({}));
  const [recentCompare, setRecentCompare] = useState(() => ({}));
  const [recentVisibleCount, setRecentVisibleCount] = useState(RECENT_INITIAL_VISIBLE_COUNT);
  const [notificationsPageTab, setNotificationsPageTab] = useState(NOTIFICATIONS_PAGE_TABS.FEED);
  const toggleWishlistCompare = useCallback((id) => {
    setWishlistCompare((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const toggleRecentCompare = useCallback((id) => {
    setRecentCompare((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);
  const {
    t,
    accountState,
    activeSidebarId,
    personalInnerTab,
    isPersonalEditMode,
    profileDraft,
    passwordDraft,
    statusKey,
    passwordErrorKey,
    displayFullName,
    formattedPhone,
    passwordSaveDisabled,
    sidebarIds,
    innerTabs,
    selectSidebar,
    selectPersonalInnerTab,
    enterPersonalEdit,
    exitPersonalEdit,
    updateProfileDraft,
    updatePhoneLocal,
    updatePasswordField,
    saveProfile,
    cancelProfileEdit,
    savePassword,
    cancelPasswordEdit,
    toggleNotification,
    pendingWishlistRemoveId,
    dismissStatus,
    requestRemoveWishlistItem,
    confirmRemoveWishlistItem,
    cancelRemoveWishlistItem,
    clearRecentlyViewed,
    setAvatarFromFile,
    clearAvatar,
  } = useAccountPresenter();

  useEffect(() => {
    if (activeSidebarId === sidebarIds.NOTIFICATIONS) {
      setNotificationsPageTab(NOTIFICATIONS_PAGE_TABS.FEED);
    }
  }, [activeSidebarId, sidebarIds.NOTIFICATIONS]);

  useEffect(() => {
    setRecentVisibleCount(RECENT_INITIAL_VISIBLE_COUNT);
  }, [activeSidebarId, accountState.recentlyViewed.length]);

  useLockBodyScroll(Boolean(pendingWishlistRemoveId));

  useEffect(() => {
    if (!pendingWishlistRemoveId) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") cancelRemoveWishlistItem();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingWishlistRemoveId, cancelRemoveWishlistItem]);

  const wishlistIds = useMemo(
    () => new Set(accountState.wishlistItems.map((w) => w.id)),
    [accountState.wishlistItems],
  );

  const visibleRecentlyViewed = useMemo(
    () => accountState.recentlyViewed.slice(0, recentVisibleCount),
    [accountState.recentlyViewed, recentVisibleCount],
  );

  const canLoadMoreRecent = recentVisibleCount < accountState.recentlyViewed.length;
  const canShowLessRecent = recentVisibleCount > RECENT_INITIAL_VISIBLE_COUNT;

  const loadMoreRecent = useCallback(() => {
    setRecentVisibleCount((current) =>
      Math.min(current + RECENT_LOAD_MORE_STEP, accountState.recentlyViewed.length),
    );
  }, [accountState.recentlyViewed.length]);

  const showLessRecent = useCallback(() => {
    setRecentVisibleCount(RECENT_INITIAL_VISIBLE_COUNT);
  }, []);

  const pendingWishlistItem = useMemo(
    () => accountState.wishlistItems.find((item) => item.id === pendingWishlistRemoveId) ?? null,
    [accountState.wishlistItems, pendingWishlistRemoveId],
  );

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
            aria-label={t("account.messages.dismissStatus")}
          >
            <FaTimes className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    ) : null;

  const renderWishlistRemoveDialog = () => {
    if (!pendingWishlistRemoveId) return null;
    return (
      <div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-remove-title"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/45"
          aria-label={t("account.wishlist.cancelButton")}
          onClick={cancelRemoveWishlistItem}
        />
        <div className="relative z-[1] flex w-full max-w-md flex-col gap-3 rounded-[12px] border border-[#e1e6ef] bg-white p-5 shadow-lg sm:p-6">
          <h2 id="wishlist-remove-title" className="m-0 text-lg font-bold text-navy">
            {t("account.wishlist.confirmTitle")}
          </h2>
          <p className="m-0 text-sm leading-relaxed text-text-muted">
            {t("account.wishlist.confirmMessage")}
          </p>
          {pendingWishlistItem?.title ? (
            <p className="m-0 text-sm font-semibold text-navy">{pendingWishlistItem.title}</p>
          ) : null}
          <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelRemoveWishlistItem}
              className="min-h-[44px] rounded-xl border border-[#e1e6ef] bg-white px-5 text-sm font-bold text-navy transition hover:bg-[#f4f6fb]"
            >
              {t("account.wishlist.cancelButton")}
            </button>
            <button
              type="button"
              onClick={confirmRemoveWishlistItem}
              className="min-h-[44px] rounded-xl bg-navy px-5 text-sm font-bold text-white transition hover:opacity-95"
            >
              {t("account.wishlist.confirmButton")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAvatar = (editable = false) => (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <div className="h-full w-full overflow-hidden rounded-full border border-[#e1e6ef] bg-[#eceff3]">
        {accountState.avatarDataUrl ? (
          <img src={accountState.avatarDataUrl} alt="" className="h-full w-full object-cover" />
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
            aria-label={t("account.avatar.uploadAria")}
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
          title={t(`account.notifications.items.${key}.title`)}
          description={t(`account.notifications.items.${key}.description`)}
          enabled={accountState.notificationPrefs[key]}
          onToggle={() => toggleNotification(key)}
        />
      ))}
    </div>
  );

  const renderNotificationsFeed = () => {
    const body = t("account.notificationsPage.feed.sampleBody");
    return (
      <div
        className="flex flex-col gap-3 sm:gap-4"
        role="feed"
        aria-label={t("account.notificationsPage.title")}
      >
        {NOTIFICATIONS_FEED_ITEM_KEYS.map((itemKey) => (
          <NotificationFeedCard
            key={itemKey}
            title={t(`account.notificationsPage.feed.items.${itemKey}.title`)}
            timeLabel={t(`account.notificationsPage.feed.items.${itemKey}.timeLabel`)}
            body={body}
          />
        ))}
      </div>
    );
  };

  const renderReadMode = () => (
    <div className="p-5 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {renderAvatar()}
          <p className="font-sans text-[16px] font-medium leading-[24px] text-[#171717]">
            {displayFullName}
          </p>
        </div>
        <button
          type="button"
          onClick={enterPersonalEdit}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-pill bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-active-blue"
        >
          <FaPen size={12} aria-hidden="true" />
          {t("account.actions.edit")}
        </button>
      </div>
      <div className="mb-5 border-t border-[#e1e6ef] pt-5" />
      <dl className="flex flex-col gap-[22.5px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">
            {t("account.fields.emailShort")}
          </dt>
          <dd className="text-sm font-bold text-navy">{accountState.profile.email || "—"}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">
            {t("account.fields.phoneShort")}
          </dt>
          <dd className="text-sm font-bold text-navy">{formattedPhone}</dd>
        </div>
      </dl>
    </div>
  );

  const inputClass =
    "h-11 rounded-[10px] border border-[#b8c8e8] bg-white px-3 text-sm text-text-dark outline-none focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40";

  const renderEditMode = () => (
    <form className="p-5 md:p-8" onSubmit={saveProfile}>
      <div className="mb-6 flex items-center gap-4">
        {renderAvatar(true)}
        {accountState.avatarDataUrl ? (
          <button
            type="button"
            className="text-xs font-semibold text-link-blue underline"
            onClick={clearAvatar}
          >
            {t("account.avatar.remove")}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.fields.firstNameRequired")}</span>
          <input
            name="firstName"
            value={profileDraft.firstName}
            onChange={updateProfileDraft}
            className={inputClass}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.fields.lastName")}</span>
          <input
            name="lastName"
            value={profileDraft.lastName}
            onChange={updateProfileDraft}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.fields.emailRequired")}</span>
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
          <span>{t("account.fields.phoneRequired")}</span>
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
              aria-label={t("account.fields.phoneLocalAria")}
            />
          </div>
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-6 pb-8">
        <button
          type="button"
          onClick={cancelProfileEdit}
          className="rounded-pill border-0 bg-transparent px-2 py-2 text-sm font-bold text-text-muted underline-offset-4 hover:underline"
        >
          {t("account.actions.cancel")}
        </button>
        <button
          type="submit"
          className="rounded-pill bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-active-blue"
        >
          {t("account.actions.save")}
        </button>
      </div>

      <div className="border-t border-[#e1e6ef] pt-8">
        <h3 className="mb-4 text-base font-bold text-navy">{t("account.password.sectionTitle")}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
            <span>{t("account.password.old")}</span>
            <input
              name="oldPassword"
              type="password"
              value={passwordDraft.oldPassword}
              onChange={updatePasswordField}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
            <span>{t("account.password.new")}</span>
            <input
              name="newPassword"
              type="password"
              value={passwordDraft.newPassword}
              onChange={updatePasswordField}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy sm:col-span-2 sm:max-w-[50%]">
            <span>{t("account.password.confirm")}</span>
            <input
              name="confirmPassword"
              type="password"
              value={passwordDraft.confirmPassword}
              onChange={updatePasswordField}
              className={inputClass}
            />
          </label>
        </div>
        {passwordErrorKey ? (
          <p className="pt-3 text-sm font-semibold text-red-600">{t(passwordErrorKey)}</p>
        ) : null}
        <div className="flex flex-wrap gap-3 pt-6">
          <button
            type="button"
            onClick={cancelPasswordEdit}
            className="rounded-pill border-0 bg-transparent px-2 py-2 text-sm font-bold text-text-muted underline-offset-4 hover:underline"
          >
            {t("account.actions.cancel")}
          </button>
          <button
            type="button"
            disabled={passwordSaveDisabled}
            onClick={() => void savePassword()}
            className="rounded-pill bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-active-blue disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t("account.actions.save")}
          </button>
        </div>
      </div>
    </form>
  );

  const renderPersonalSection = () => (
    <MainCard>
      <h2 className="sr-only">{t("account.sidebar.personal")}</h2>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e6ef] px-5 pt-5 md:px-8 md:pt-6">
        <div className="flex gap-6" role="tablist" aria-label={t("account.personalTabsAria")}>
          <button
            type="button"
            role="tab"
            aria-selected={personalInnerTab === innerTabs.DATA}
            className={`border-b-2 pb-3 text-sm font-bold transition ${
              personalInnerTab === innerTabs.DATA
                ? "border-navy text-navy"
                : "border-transparent text-text-muted"
            }`}
            onClick={() => selectPersonalInnerTab(innerTabs.DATA)}
          >
            {t("account.innerTabs.data")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={personalInnerTab === innerTabs.NOTIFICATIONS}
            className={`border-b-2 pb-3 text-sm font-bold transition ${
              personalInnerTab === innerTabs.NOTIFICATIONS
                ? "border-navy text-navy"
                : "border-transparent text-text-muted"
            }`}
            onClick={() => selectPersonalInnerTab(innerTabs.NOTIFICATIONS)}
          >
            {t("account.innerTabs.notifications")}
          </button>
        </div>
        {isPersonalEditMode && personalInnerTab === innerTabs.DATA ? (
          <button
            type="button"
            onClick={exitPersonalEdit}
            className="inline-flex items-center gap-2 text-sm font-bold text-navy"
          >
            <FaArrowLeft size={12} aria-hidden="true" />
            {t("account.actions.back")}
          </button>
        ) : null}
      </div>
      {personalInnerTab === innerTabs.NOTIFICATIONS ? (
        <div className="p-5 md:p-8">{renderNotificationSettings()}</div>
      ) : isPersonalEditMode ? (
        renderEditMode()
      ) : (
        renderReadMode()
      )}
    </MainCard>
  );

  const renderWishlist = () => (
    <MainCard className="p-5 md:p-8">
      <h2 className="mb-6 text-lg font-bold text-navy md:text-xl">{t("account.wishlist.title")}</h2>
      {accountState.wishlistItems.length === 0 ? (
        <p className="text-sm text-text-muted">{t("account.wishlist.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {accountState.wishlistItems.map((item) => {
            const detailTo =
              item.href && item.href.startsWith("/")
                ? item.href
                : getProductDetailHref(item.id, item.title);
            return (
              <AccountGridProductCard
                key={item.id}
                item={item}
                detailTo={detailTo}
                inCompare={Boolean(wishlistCompare[item.id])}
                onToggleCompare={() => toggleWishlistCompare(item.id)}
                onHeartClick={() => requestRemoveWishlistItem(item.id)}
                heartFilled
                compareAria={t("relatedProducts.compareAriaLabel")}
                heartAria={t("account.wishlist.remove")}
              />
            );
          })}
        </div>
      )}
    </MainCard>
  );

  const renderRecent = () => (
    <MainCard className="p-5 md:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-lg font-bold text-navy md:text-xl">{t("account.recent.title")}</h2>
        {accountState.recentlyViewed.length > 0 ? (
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="text-sm font-bold text-link-blue underline"
          >
            {t("account.recent.clear")}
          </button>
        ) : null}
      </div>
      {accountState.recentlyViewed.length === 0 ? (
        <p className="text-sm text-text-muted">{t("account.recent.empty")}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visibleRecentlyViewed.map((item) => {
              const detailTo =
                item.href && item.href.startsWith("/")
                  ? item.href
                  : getProductDetailHref(item.id, item.title);
              const inWishlist = wishlistIds.has(item.id);
              return (
                <AccountGridProductCard
                  key={item.id}
                  item={item}
                  detailTo={detailTo}
                  inCompare={Boolean(recentCompare[item.id])}
                  onToggleCompare={() => toggleRecentCompare(item.id)}
                  onHeartClick={() => {
                    toggleWishlistProduct({
                      id: item.id,
                      title: item.title,
                      description: item.description,
                      price: item.price,
                      image: item.image,
                      href: detailTo,
                    });
                  }}
                  heartFilled={inWishlist}
                  compareAria={t("relatedProducts.compareAriaLabel")}
                  heartAria={t("relatedProducts.wishlistAriaLabel")}
                />
              );
            })}
          </div>
          {canLoadMoreRecent || canShowLessRecent ? (
            <div className="flex justify-end gap-3 pt-4">
              {canShowLessRecent ? (
                <button
                  type="button"
                  onClick={showLessRecent}
                  className="inline-flex items-center gap-2 rounded-full border border-border-blue px-5 py-2 text-sm font-semibold text-text-dark transition-colors hover:bg-hover-blue md:text-base"
                >
                  {t("account.recent.seeLess")}
                </button>
              ) : null}
              {canLoadMoreRecent ? (
                <button
                  type="button"
                  onClick={loadMoreRecent}
                  className="inline-flex items-center gap-2 rounded-full border border-link-blue px-5 py-2 text-sm font-semibold text-link-blue transition-colors hover:bg-hover-blue md:text-base"
                >
                  {t("account.recent.seeMore")}
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </MainCard>
  );

  const renderSubscription = () => (
    <MainCard className="overflow-hidden p-0">
      <div className="px-5 py-4 md:px-8 md:py-5">
        <h2 className="m-0 text-lg font-bold text-navy md:text-xl">
          {t("account.subscription.planCardTitle")}
        </h2>
      </div>
      <div className="border-t border-[#e1e6ef]" role="presentation" />
      <dl className="m-0 flex flex-col gap-4 px-5 py-5 md:gap-5 md:px-8 md:py-6">
        <div className="flex flex-col gap-0.5 text-start sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="m-0 shrink-0 text-sm font-normal text-text-muted">
            {t("account.subscription.planNameLabel")}
          </dt>
          <dd className="m-0 text-base font-bold text-[#171717]">
            {t("account.subscription.planName")}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 text-start sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="m-0 shrink-0 text-sm font-normal text-text-muted">
            {t("account.subscription.planValueLabel")}
          </dt>
          <dd className="m-0 text-base font-bold text-[#171717]">
            {t("account.subscription.planTotal")}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5 text-start sm:flex-row sm:items-baseline sm:gap-6">
          <dt className="m-0 shrink-0 text-sm font-normal text-text-muted">
            {t("account.subscription.planMonthlyLabel")}
          </dt>
          <dd className="m-0 text-base font-bold text-[#171717]">
            {t("account.subscription.planMonthly")}
          </dd>
        </div>
      </dl>
    </MainCard>
  );

  const renderMain = () => {
    switch (activeSidebarId) {
      case sidebarIds.WISHLIST:
        return renderWishlist();
      case sidebarIds.RECENT:
        return renderRecent();
      case sidebarIds.SUBSCRIPTION:
        return renderSubscription();
      case sidebarIds.NOTIFICATIONS:
        return (
          <MainCard className="overflow-hidden p-0">
            <h2 className="sr-only">{t("account.notificationsPage.title")}</h2>
            <div className="border-b border-[#e1e6ef] px-3 pt-4 sm:px-5 sm:pt-5 md:px-8 md:pt-6">
              <div
                className="grid w-full grid-cols-2 sm:flex sm:w-auto sm:gap-8"
                role="tablist"
                aria-label={t("account.notificationsPage.tabsAria")}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={notificationsPageTab === NOTIFICATIONS_PAGE_TABS.FEED}
                  className={`touch-manipulation border-b-2 px-1 py-3.5 text-center text-sm font-bold transition sm:px-0 sm:py-0 sm:pb-3 sm:text-start ${
                    notificationsPageTab === NOTIFICATIONS_PAGE_TABS.FEED
                      ? "border-navy text-navy"
                      : "border-transparent text-text-muted"
                  }`}
                  onClick={() => setNotificationsPageTab(NOTIFICATIONS_PAGE_TABS.FEED)}
                >
                  {t("account.notificationsPage.tabs.feed")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={notificationsPageTab === NOTIFICATIONS_PAGE_TABS.SETTINGS}
                  className={`touch-manipulation border-b-2 px-1 py-3.5 text-center text-sm font-bold transition sm:px-0 sm:py-0 sm:pb-3 sm:text-start ${
                    notificationsPageTab === NOTIFICATIONS_PAGE_TABS.SETTINGS
                      ? "border-navy text-navy"
                      : "border-transparent text-text-muted"
                  }`}
                  onClick={() => setNotificationsPageTab(NOTIFICATIONS_PAGE_TABS.SETTINGS)}
                >
                  {t("account.notificationsPage.tabs.settings")}
                </button>
              </div>
            </div>
            <div className="px-3 py-4 sm:p-5 md:p-8">
              {notificationsPageTab === NOTIFICATIONS_PAGE_TABS.FEED ? (
                renderNotificationsFeed()
              ) : (
                <>
                  <p className="mb-4 text-sm leading-relaxed text-text-muted sm:mb-6">
                    {t("account.notificationsPage.settingsIntro")}
                  </p>
                  {renderNotificationSettings()}
                </>
              )}
            </div>
          </MainCard>
        );
      case sidebarIds.PERSONAL:
      default:
        return renderPersonalSection();
    }
  };

  return (
    <section className="w-full py-6 md:py-10" aria-labelledby="account-page-heading">
      <div className="cont-width-default mx-auto">
        <h1
          id="account-page-heading"
          className="mb-5 text-start text-2xl font-bold text-navy md:text-[26px]"
        >
          {t("account.pageTitle")}
        </h1>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
          <aside className="w-full shrink-0 lg:w-[280px]">
            <nav
              className="rounded-[12px] border border-[#e1e6ef] bg-white p-2 shadow-sm"
              aria-label={t("account.sidebarNavAria")}
            >
              <ul className="m-0 flex list-none flex-row gap-1 overflow-x-auto p-0 lg:flex-col lg:overflow-visible">
                {sidebarItems.map((item) => {
                  const active = activeSidebarId === item.id;
                  return (
                    <li key={item.id} className="shrink-0 lg:w-full">
                      <button
                        type="button"
                        onClick={() => selectSidebar(item.id)}
                        className={`w-full whitespace-nowrap rounded-[10px] border-0 px-4 py-3 text-start text-sm font-bold transition lg:whitespace-normal ${
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
          </aside>

          <div className="relative min-w-0 flex-1">
            {renderStatusToastOverlay()}
            {renderMain()}
          </div>
        </div>
      </div>
      {renderWishlistRemoveDialog()}
    </section>
  );
};

export default AccountDashboardWidget;
