import { useRef } from "react";
import { FaArrowLeft, FaExclamationCircle, FaPen, FaUpload } from "react-icons/fa";
import { SHOP_NOTIFICATIONS_PAGE_TABS } from "entities/shop";
import { MainCard, NotificationFeedCard, ToggleRow } from "shared/ui/dashboard-cards";
import { BUTTON_PRIMARY, FIELD, FOCUS_RING } from "./sellerUi";

const NOTIFICATION_PREF_KEYS = ["priceDrops", "wishlistUpdates", "accountNews"];

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

/**
 * The shop's own record: name, contact details, description, logo, and what it wants to be
 * notified about.
 *
 * Lifted out of the 1,277-line dashboard widget unchanged in behaviour. What changed is where
 * failure is reported — a missing name or e-mail now says so inside the form it belongs to
 * rather than in the page-level status panel — and that uploading a logo, the one genuinely
 * asynchronous thing in this dashboard, shows that it is working (§29, §30).
 */
export const ShopDetailsSection = ({
  t,
  shopState,
  shopInnerTab,
  innerTabs,
  onSelectInnerTab,
  notificationsPageTab,
  notificationsTabs,
  onSelectNotificationsTab,
  isShopEditMode,
  onEnterEdit,
  onExitEdit,
  profileDraft,
  profileErrorKey,
  onUpdateProfileDraft,
  onUpdateDescription,
  onUpdatePhoneLocal,
  onSaveProfile,
  onAvatarFile,
  isAvatarUploading,
  onClearAvatar,
  onToggleNotification,
  formattedPhone,
  displayWebsiteHref,
}) => {
  const fileInputRef = useRef(null);

  const renderAvatar = (editable = false) => (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <div className="h-full w-full overflow-hidden rounded-full border border-[#e1e6ef] bg-[#eceff3]">
        {shopState.avatarDataUrl ? (
          <img src={shopState.avatarDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-navy/40">
            {(shopState.profile.shopName || "?").trim().charAt(0).toUpperCase()}
          </div>
        )}
        {isAvatarUploading ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70"
            role="status"
            aria-label={t("shopAccount.avatar.uploading")}
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy border-t-transparent motion-reduce:animate-none" />
          </div>
        ) : null}
      </div>
      {editable ? (
        <>
          <button
            type="button"
            className={`absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-[#e1e6ef] bg-white text-navy shadow-sm transition hover:bg-accent-blue ${FOCUS_RING}`}
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
              if (file) onAvatarFile(file);
              event.target.value = "";
            }}
          />
        </>
      ) : null}
    </div>
  );

  const renderReadMode = () => (
    <div className="p-5 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {renderAvatar()}
          <p className="m-0 font-sans text-base font-medium leading-6 text-[#171717]">
            {shopState.profile.shopName}
          </p>
        </div>
        <button
          type="button"
          onClick={onEnterEdit}
          className={`${BUTTON_PRIMARY} shrink-0 self-start rounded-pill px-5`}
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

  const renderEditMode = () => (
    <form className="p-5 md:p-8" onSubmit={onSaveProfile}>
      <div className="mb-6 flex items-center gap-4">
        {renderAvatar(true)}
        {shopState.avatarDataUrl ? (
          <button
            type="button"
            className={`rounded px-1 text-xs font-semibold text-link-blue underline ${FOCUS_RING}`}
            onClick={onClearAvatar}
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
          onChange={onUpdateProfileDraft}
          className={FIELD}
          required
        />
      </label>
      <label className="mb-4 flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
        <span>{t("shopAccount.fields.description")}</span>
        <textarea
          value={profileDraft.description}
          onChange={(event) => onUpdateDescription(event.target.value)}
          placeholder={t("shopAccount.defaultShopDescription")}
          rows={4}
          className={`${FIELD} min-h-[100px] resize-y py-2.5`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("shopAccount.fields.emailRequired")}</span>
          <input
            name="email"
            type="email"
            value={profileDraft.email}
            onChange={onUpdateProfileDraft}
            className={FIELD}
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
              onChange={(event) => onUpdatePhoneLocal(event.target.value)}
              className="min-w-0 flex-1 border-0 px-3 text-sm text-text-dark outline-none"
              placeholder="93001002"
              aria-label={t("shopAccount.fields.phoneLocalAria")}
            />
          </div>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 pt-4 text-start text-sm font-semibold text-navy">
        <span>{t("shopAccount.fields.website")}</span>
        <input
          name="website"
          type="text"
          value={profileDraft.website}
          onChange={onUpdateProfileDraft}
          className={FIELD}
        />
      </label>

      {profileErrorKey ? (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-[10px] border border-[#f5c2c2] bg-[#fef2f2] px-3 py-2 text-sm font-medium text-[#991b1b]"
        >
          <FaExclamationCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t(profileErrorKey)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-6">
        <button
          type="button"
          onClick={onExitEdit}
          className={`rounded-pill px-2 py-2 text-sm font-bold text-text-muted underline-offset-4 hover:underline ${FOCUS_RING}`}
        >
          {t("shopAccount.actions.cancel")}
        </button>
        <button type="submit" className={`${BUTTON_PRIMARY} rounded-pill px-6`}>
          {t("shopAccount.actions.save")}
        </button>
      </div>
    </form>
  );

  const renderNotifications = () => (
    <>
      <h3 className="sr-only">{t("shopAccount.notificationsPage.title")}</h3>
      <div className="border-b border-[#e1e6ef] px-3 pt-2 sm:px-5 md:px-8">
        <div
          className="grid w-full grid-cols-2 sm:flex sm:w-auto sm:gap-8"
          role="group"
          aria-label={t("shopAccount.notificationsPage.tabsAria")}
        >
          {[
            { id: notificationsTabs.FEED, labelKey: "shopAccount.notificationsPage.tabs.feed" },
            {
              id: notificationsTabs.SETTINGS,
              labelKey: "shopAccount.notificationsPage.tabs.settings",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={notificationsPageTab === tab.id}
              className={`touch-manipulation border-b-2 px-1 py-3.5 text-center text-sm font-bold transition sm:px-0 sm:py-0 sm:pb-3 sm:text-start ${FOCUS_RING} ${
                notificationsPageTab === tab.id
                  ? "border-navy text-navy"
                  : "border-transparent text-text-muted"
              }`}
              onClick={() => onSelectNotificationsTab(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="px-3 py-4 sm:p-5 md:p-8">
        {notificationsPageTab === SHOP_NOTIFICATIONS_PAGE_TABS.FEED ? (
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
        ) : (
          <>
            <p className="mb-4 text-sm leading-relaxed text-text-muted sm:mb-6">
              {t("shopAccount.notificationsPage.settingsIntro")}
            </p>
            <div className="flex flex-col gap-3">
              {NOTIFICATION_PREF_KEYS.map((key) => (
                <ToggleRow
                  key={key}
                  title={t(`shopAccount.notifications.items.${key}.title`)}
                  description={t(`shopAccount.notifications.items.${key}.description`)}
                  enabled={shopState.notificationPrefs[key]}
                  onToggle={() => onToggleNotification(key)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <MainCard className="w-full overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e6ef] px-5 pt-5 md:px-8 md:pt-6">
        <div className="flex gap-6" role="group" aria-label={t("shopAccount.shopTabsAria")}>
          {[
            { id: innerTabs.DATA, labelKey: "shopAccount.innerTabs.data" },
            { id: innerTabs.NOTIFICATIONS, labelKey: "shopAccount.innerTabs.notifications" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={shopInnerTab === tab.id}
              className={`border-b-2 pb-3 text-sm font-bold transition ${FOCUS_RING} ${
                shopInnerTab === tab.id
                  ? "border-navy text-navy"
                  : "border-transparent text-text-muted"
              }`}
              onClick={() => onSelectInnerTab(tab.id)}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        {isShopEditMode && shopInnerTab === innerTabs.DATA ? (
          <button
            type="button"
            onClick={onExitEdit}
            className={`inline-flex items-center gap-2 rounded px-1 text-sm font-bold text-navy ${FOCUS_RING}`}
          >
            <FaArrowLeft size={12} aria-hidden="true" />
            {t("shopAccount.actions.back")}
          </button>
        ) : null}
      </div>
      {shopInnerTab === innerTabs.NOTIFICATIONS
        ? renderNotifications()
        : isShopEditMode
          ? renderEditMode()
          : renderReadMode()}
    </MainCard>
  );
};

export default ShopDetailsSection;
