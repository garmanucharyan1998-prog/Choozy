import { useCallback, useMemo, useState } from "react";
import {
  hashPassword,
  PERSONAL_INNER_TABS,
  readAccountState,
  SIDEBAR_IDS,
  writeAccountState,
} from "entities/user";
import { useLanguage } from "contexts";

const emptyPasswordDraft = () => ({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

export const useAccountPresenter = () => {
  const { t } = useLanguage();
  const [accountState, setAccountState] = useState(() => readAccountState());
  const [activeSidebarId, setActiveSidebarId] = useState(SIDEBAR_IDS.PERSONAL);
  const [personalInnerTab, setPersonalInnerTab] = useState(PERSONAL_INNER_TABS.DATA);
  const [isPersonalEditMode, setIsPersonalEditMode] = useState(false);
  const [profileDraft, setProfileDraft] = useState(() => readAccountState().profile);
  const [passwordDraft, setPasswordDraft] = useState(emptyPasswordDraft);
  const [statusKey, setStatusKey] = useState("");
  const [passwordErrorKey, setPasswordErrorKey] = useState("");

  const persist = useCallback((updater) => {
    const saved = writeAccountState(updater);
    setAccountState(saved);
    return saved;
  }, []);

  const selectSidebar = useCallback((id) => {
    setActiveSidebarId(id);
    setStatusKey("");
    setPasswordErrorKey("");
    setIsPersonalEditMode(false);
    setPasswordDraft(emptyPasswordDraft());
    setProfileDraft(readAccountState().profile);
    if (id === SIDEBAR_IDS.PERSONAL) {
      setPersonalInnerTab(PERSONAL_INNER_TABS.DATA);
    }
  }, []);

  const selectPersonalInnerTab = useCallback((tabId) => {
    setPersonalInnerTab(tabId);
    setStatusKey("");
    setPasswordErrorKey("");
    if (tabId !== PERSONAL_INNER_TABS.DATA) {
      setIsPersonalEditMode(false);
      setPasswordDraft(emptyPasswordDraft());
      setProfileDraft(readAccountState().profile);
    }
  }, []);

  const enterPersonalEdit = useCallback(() => {
    setProfileDraft({ ...readAccountState().profile });
    setPasswordDraft(emptyPasswordDraft());
    setIsPersonalEditMode(true);
    setStatusKey("");
    setPasswordErrorKey("");
  }, []);

  const exitPersonalEdit = useCallback(() => {
    setIsPersonalEditMode(false);
    setProfileDraft({ ...readAccountState().profile });
    setPasswordDraft(emptyPasswordDraft());
    setPasswordErrorKey("");
  }, []);

  const updateProfileDraft = useCallback((event) => {
    const { name, value } = event.target;
    setProfileDraft((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updatePhoneLocal = useCallback((value) => {
    setProfileDraft((prev) => ({
      ...prev,
      phoneLocal: value.replace(/\D/g, "").slice(0, 8),
    }));
  }, []);

  const updatePasswordField = useCallback((event) => {
    const { name, value } = event.target;
    setPasswordDraft((prev) => ({ ...prev, [name]: value }));
    setPasswordErrorKey("");
  }, []);

  const saveProfile = useCallback(
    (event) => {
      event.preventDefault();
      const firstName = profileDraft.firstName.trim();
      const email = profileDraft.email.trim();

      if (!firstName || !email) {
        setStatusKey("account.messages.profileRequired");
        return;
      }

      persist((state) => ({
        ...state,
        profile: {
          ...state.profile,
          firstName,
          lastName: profileDraft.lastName.trim(),
          email,
          phoneLocal: profileDraft.phoneLocal.replace(/\D/g, "").slice(0, 8),
        },
      }));
      setStatusKey("account.messages.profileSaved");
      setIsPersonalEditMode(false);
    },
    [persist, profileDraft],
  );

  const savePassword = useCallback(async () => {
    setPasswordErrorKey("");
    const { oldPassword, newPassword, confirmPassword } = passwordDraft;

    if (newPassword.length < 6) {
      setPasswordErrorKey("account.password.tooShort");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorKey("account.password.mismatch");
      return;
    }

    const current = readAccountState();

    if (current.passwordHash) {
      const oldHash = await hashPassword(oldPassword);
      if (oldHash !== current.passwordHash) {
        setPasswordErrorKey("account.password.wrongOld");
        return;
      }
    }

    const newHash = await hashPassword(newPassword);
    persist((state) => ({ ...state, passwordHash: newHash }));
    setPasswordDraft(emptyPasswordDraft());
    setStatusKey("account.messages.passwordSaved");
  }, [passwordDraft, persist]);

  const cancelPasswordEdit = useCallback(() => {
    setPasswordDraft(emptyPasswordDraft());
    setPasswordErrorKey("");
  }, []);

  const toggleNotification = useCallback(
    (key) => {
      persist((state) => ({
        ...state,
        notificationPrefs: {
          ...state.notificationPrefs,
          [key]: !state.notificationPrefs[key],
        },
      }));
      setStatusKey("account.messages.notificationsSaved");
    },
    [persist],
  );

  const toggleSubscription = useCallback(() => {
    persist((state) => ({ ...state, subscriptionOptIn: !state.subscriptionOptIn }));
    setStatusKey("account.messages.subscriptionSaved");
  }, [persist]);

  const removeWishlistItem = useCallback(
    (id) => {
      persist((state) => ({
        ...state,
        wishlistItems: state.wishlistItems.filter((item) => item.id !== id),
      }));
      setStatusKey("account.messages.wishlistUpdated");
    },
    [persist],
  );

  const clearRecentlyViewed = useCallback(() => {
    persist((state) => ({ ...state, recentlyViewed: [] }));
    setStatusKey("account.messages.recentCleared");
  }, [persist]);

  const setAvatarFromFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      if (file.size > 200 * 1024) {
        setStatusKey("account.messages.avatarTooLarge");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        persist((state) => ({ ...state, avatarDataUrl: result }));
        setStatusKey("account.messages.avatarSaved");
      };
      reader.readAsDataURL(file);
    },
    [persist],
  );

  const clearAvatar = useCallback(() => {
    persist((state) => ({ ...state, avatarDataUrl: "" }));
    setStatusKey("account.messages.avatarRemoved");
  }, [persist]);

  const displayFullName = useMemo(() => {
    const { firstName, lastName } = accountState.profile;
    return `${firstName} ${lastName}`.trim() || t("account.profile.placeholderName");
  }, [accountState.profile, t]);

  const formattedPhone = useMemo(() => {
    const digits = accountState.profile.phoneLocal.replace(/\D/g, "");
    if (!digits) return "—";
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 4),
      digits.slice(4, 6),
      digits.slice(6, 8),
    ].filter(Boolean);
    return `+374 ${parts.join(" ")}`;
  }, [accountState.profile.phoneLocal]);

  const passwordSaveDisabled = useMemo(() => {
    const { oldPassword, newPassword, confirmPassword } = passwordDraft;
    if (newPassword.length < 6 || newPassword !== confirmPassword) return true;
    return Boolean(accountState.passwordHash && !oldPassword);
  }, [accountState.passwordHash, passwordDraft]);

  return {
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
    sidebarIds: SIDEBAR_IDS,
    innerTabs: PERSONAL_INNER_TABS,
    selectSidebar,
    selectPersonalInnerTab,
    enterPersonalEdit,
    exitPersonalEdit,
    updateProfileDraft,
    updatePhoneLocal,
    updatePasswordField,
    saveProfile,
    cancelProfileEdit: exitPersonalEdit,
    savePassword,
    cancelPasswordEdit,
    toggleNotification,
    toggleSubscription,
    removeWishlistItem,
    clearRecentlyViewed,
    setAvatarFromFile,
    clearAvatar,
  };
};

export default useAccountPresenter;
