import { useRef } from "react";
import { FaArrowLeft, FaPen, FaUpload } from "react-icons/fa";
import { SIDEBAR_IDS } from "entities/user";
import { useAccountPresenter } from "features/account";

const sidebarItems = [
  { id: SIDEBAR_IDS.PERSONAL, labelKey: "account.sidebar.personal" },
  { id: SIDEBAR_IDS.WISHLIST, labelKey: "account.sidebar.wishlist" },
  { id: SIDEBAR_IDS.RECENT, labelKey: "account.sidebar.recent" },
  { id: SIDEBAR_IDS.SUBSCRIPTION, labelKey: "account.sidebar.subscription" },
  { id: SIDEBAR_IDS.NOTIFICATIONS, labelKey: "account.sidebar.notifications" },
];

const notificationKeys = ["priceDrops", "wishlistUpdates", "accountNews"];

const MainCard = ({ children, className = "" }) => (
  <div className={`rounded-[12px] border border-[#e1e6ef] bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const ToggleRow = ({ title, description, enabled, onToggle }) => (
  <button
    type="button"
    className="flex w-full items-center justify-between gap-4 rounded-[12px] border border-[#e1e6ef] bg-[#fbfcff] p-4 text-start transition hover:bg-[#f4f6fb]"
    onClick={onToggle}
    aria-pressed={enabled}
  >
    <span>
      <span className="block text-sm font-bold text-navy">{title}</span>
      {description ? (
        <span className="mt-1 block text-xs leading-relaxed text-text-muted">{description}</span>
      ) : null}
    </span>
    <span
      className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
        enabled ? "justify-end bg-navy" : "justify-start bg-[#dfe4f1]"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
    </span>
  </button>
);

const AccountDashboardWidget = () => {
  const fileInputRef = useRef(null);
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
    toggleSubscription,
    removeWishlistItem,
    clearRecentlyViewed,
    setAvatarFromFile,
    clearAvatar,
  } = useAccountPresenter();

  const renderStatus = () =>
    statusKey ? (
      <p className="mb-4 rounded-[10px] border border-[#cfe8d5] bg-[#f1fbf3] px-4 py-2.5 text-sm font-medium text-[#236736]">
        {t(statusKey)}
      </p>
    ) : null;

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

  const renderNotifications = () => (
    <div className="space-y-3">
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

  const renderReadMode = () => (
    <div className="p-5 md:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {renderAvatar()}
          <p className="font-sans text-[16px] font-medium leading-[24px] text-[#171717]">{displayFullName}</p>
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
      <div className="my-5 border-t border-[#e1e6ef]" />
      <dl className="space-y-[22.5px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">{t("account.fields.emailShort")}</dt>
          <dd className="text-sm font-bold text-navy">{accountState.profile.email || "—"}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-sm font-semibold text-text-muted">{t("account.fields.phoneShort")}</dt>
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
          <button type="button" className="text-xs font-semibold text-link-blue underline" onClick={clearAvatar}>
            {t("account.avatar.remove")}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.fields.firstNameRequired")}</span>
          <input name="firstName" value={profileDraft.firstName} onChange={updateProfileDraft} className={inputClass} required />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.fields.lastName")}</span>
          <input name="lastName" value={profileDraft.lastName} onChange={updateProfileDraft} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.fields.emailRequired")}</span>
          <input name="email" type="email" value={profileDraft.email} onChange={updateProfileDraft} className={inputClass} required />
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

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={cancelProfileEdit}
          className="rounded-pill border-0 bg-transparent px-2 py-2 text-sm font-bold text-text-muted underline-offset-4 hover:underline"
        >
          {t("account.actions.cancel")}
        </button>
        <button type="submit" className="rounded-pill bg-navy px-6 py-2.5 text-sm font-bold text-white transition hover:bg-active-blue">
          {t("account.actions.save")}
        </button>
      </div>

      <div className="my-8 border-t border-[#e1e6ef]" />
      <h3 className="mb-4 text-base font-bold text-navy">{t("account.password.sectionTitle")}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.password.old")}</span>
          <input name="oldPassword" type="password" value={passwordDraft.oldPassword} onChange={updatePasswordField} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
          <span>{t("account.password.new")}</span>
          <input name="newPassword" type="password" value={passwordDraft.newPassword} onChange={updatePasswordField} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy sm:col-span-2 sm:max-w-[50%]">
          <span>{t("account.password.confirm")}</span>
          <input name="confirmPassword" type="password" value={passwordDraft.confirmPassword} onChange={updatePasswordField} className={inputClass} />
        </label>
      </div>
      {passwordErrorKey ? <p className="mt-3 text-sm font-semibold text-red-600">{t(passwordErrorKey)}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
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
    </form>
  );

  const renderPersonalSection = () => (
    <MainCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e6ef] px-5 pt-5 md:px-8 md:pt-6">
        <div className="flex gap-6" role="tablist" aria-label={t("account.personalTabsAria")}>
          <button
            type="button"
            role="tab"
            aria-selected={personalInnerTab === innerTabs.DATA}
            className={`border-b-2 pb-3 text-sm font-bold transition ${
              personalInnerTab === innerTabs.DATA ? "border-navy text-navy" : "border-transparent text-text-muted"
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
              personalInnerTab === innerTabs.NOTIFICATIONS ? "border-navy text-navy" : "border-transparent text-text-muted"
            }`}
            onClick={() => selectPersonalInnerTab(innerTabs.NOTIFICATIONS)}
          >
            {t("account.innerTabs.notifications")}
          </button>
        </div>
        {isPersonalEditMode && personalInnerTab === innerTabs.DATA ? (
          <button type="button" onClick={exitPersonalEdit} className="inline-flex items-center gap-2 text-sm font-bold text-navy">
            <FaArrowLeft size={12} aria-hidden="true" />
            {t("account.actions.back")}
          </button>
        ) : null}
      </div>
      {personalInnerTab === innerTabs.NOTIFICATIONS ? (
        <div className="p-5 md:p-8">{renderNotifications()}</div>
      ) : isPersonalEditMode ? (
        renderEditMode()
      ) : (
        renderReadMode()
      )}
    </MainCard>
  );

  const renderWishlist = () => (
    <MainCard className="p-5 md:p-8">
      <h2 className="mb-4 text-lg font-bold text-navy">{t("account.wishlist.title")}</h2>
      {accountState.wishlistItems.length === 0 ? (
        <p className="text-sm text-text-muted">{t("account.wishlist.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {accountState.wishlistItems.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 rounded-[12px] border border-[#e1e6ef] bg-[#fbfcff] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-start">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{item.category}</p>
                <p className="mt-1 font-bold text-navy">{item.title}</p>
                <p className="mt-1 text-sm font-semibold text-active-blue">{item.priceLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => removeWishlistItem(item.id)}
                className="rounded-pill border border-[#e1e6ef] bg-white px-4 py-2 text-sm font-bold text-navy hover:bg-accent-blue"
              >
                {t("account.wishlist.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </MainCard>
  );

  const renderRecent = () => (
    <MainCard className="p-5 md:p-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-navy">{t("account.recent.title")}</h2>
        {accountState.recentlyViewed.length > 0 ? (
          <button type="button" onClick={clearRecentlyViewed} className="text-sm font-bold text-link-blue underline">
            {t("account.recent.clear")}
          </button>
        ) : null}
      </div>
      {accountState.recentlyViewed.length === 0 ? (
        <p className="text-sm text-text-muted">{t("account.recent.empty")}</p>
      ) : (
        <ul className="m-0 list-none divide-y divide-[#e1e6ef] rounded-[12px] border border-[#e1e6ef] bg-[#fbfcff] p-0">
          {accountState.recentlyViewed.map((item) => (
            <li key={item.id} className="px-4 py-3 text-start text-sm font-semibold text-navy">
              {item.title}
            </li>
          ))}
        </ul>
      )}
    </MainCard>
  );

  const renderSubscription = () => (
    <MainCard className="p-5 md:p-8">
      <h2 className="mb-2 text-lg font-bold text-navy">{t("account.subscription.title")}</h2>
      <p className="mb-6 text-sm leading-relaxed text-text-muted">{t("account.subscription.description")}</p>
      <ToggleRow
        title={t("account.subscription.toggleLabel")}
        enabled={accountState.subscriptionOptIn}
        onToggle={toggleSubscription}
      />
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
          <MainCard className="p-5 md:p-8">
            <h2 className="mb-2 text-lg font-bold text-navy">{t("account.notificationsPage.title")}</h2>
            <p className="mb-6 text-sm text-text-muted">{t("account.notificationsPage.description")}</p>
            {renderNotifications()}
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
        <h1 id="account-page-heading" className="mb-5 text-start text-2xl font-bold text-navy md:text-[26px]">
          {t("account.pageTitle")}
        </h1>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
          <aside className="w-full shrink-0 lg:w-[280px]">
            <nav className="rounded-[12px] border border-[#e1e6ef] bg-white p-2 shadow-sm" aria-label={t("account.sidebarNavAria")}>
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

          <div className="min-w-0 flex-1">
            {renderStatus()}
            {renderMain()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountDashboardWidget;
