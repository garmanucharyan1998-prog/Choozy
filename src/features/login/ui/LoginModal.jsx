import { FaTimes } from "react-icons/fa";
import { useLanguage } from "contexts";
import { ROLES } from "entities/session";
import { useAuthModalPresenter } from "../presenter/useAuthModalPresenter";

const INPUT_CLASS =
  "h-11 w-full rounded-[10px] border border-[#b8c8e8] bg-white px-3 text-sm text-text-dark outline-none focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40";

const SWITCH_BUTTON_CLASS =
  "border-0 bg-transparent p-0 text-sm font-bold text-link-blue underline transition hover:opacity-80";

const SEGMENT_BASE =
  "flex-1 rounded-[10px] border px-3 py-2 text-sm font-semibold transition text-center";
const SEGMENT_ACTIVE = `${SEGMENT_BASE} border-navy bg-navy text-white`;
const SEGMENT_IDLE = `${SEGMENT_BASE} border-[#b8c8e8] bg-white text-navy hover:bg-[#f4f6fb]`;

/**
 * Two `type="button"` toggles, deliberately NOT native radio inputs: the dialog's focus
 * trap (see useAuthModalPresenter) collects every element its selector matches, but a
 * browser only makes the *checked* radio in a group tab-reachable — so picking Seller
 * would put the unreachable Buyer radio at `focusables[0]`, and Shift+Tab from the first
 * real field would never land back where the trap expects, letting focus escape the modal.
 * Plain buttons are always tabbable, so the trap holds regardless of which one is active.
 */
const RolePicker = ({ role, onSelect, t }) => (
  <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
    <legend className="p-0 text-sm font-semibold text-navy">{t("auth.roleLabel")}</legend>
    <div className="flex gap-2" role="group">
      <button
        type="button"
        aria-pressed={role === ROLES.BUYER}
        className={role === ROLES.BUYER ? SEGMENT_ACTIVE : SEGMENT_IDLE}
        onClick={() => onSelect(ROLES.BUYER)}
      >
        {t("auth.roleBuyer")}
      </button>
      <button
        type="button"
        aria-pressed={role === ROLES.SELLER}
        className={role === ROLES.SELLER ? SEGMENT_ACTIVE : SEGMENT_IDLE}
        onClick={() => onSelect(ROLES.SELLER)}
      >
        {t("auth.roleSeller")}
      </button>
    </div>
  </fieldset>
);

/**
 * `useAuthModalPresenter` calls `useSubmit()`, which needs a data router — fine in the
 * real app (framework mode), but `SiteShell.test.jsx` renders the header under a plain
 * declarative `MemoryRouter` and never opens this modal. Gating on `isOpen` *before* the
 * hook runs (rather than after, as the old class-free version did) means the presenter —
 * and `useSubmit` with it — is never invoked while closed, in tests or otherwise; it
 * mounts fresh each time the modal opens, which resets the form as a side effect of the
 * mount instead of needing its own explicit "closed" branch.
 */
const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  return <LoginModalDialog onClose={onClose} />;
};

const LoginModalDialog = ({ onClose }) => {
  const { t } = useLanguage();
  const {
    isRegisterMode,
    role,
    selectRole,
    email,
    password,
    confirmPassword,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    switchToLogin,
    switchToRegister,
  } = useAuthModalPresenter({ isOpen: true, onClose });

  const titleId = isRegisterMode ? "register-modal-title" : "login-modal-title";

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label={t("auth.backdropAria")}
        onClick={onClose}
      />

      <div className="relative z-[1] flex w-full max-w-md flex-col gap-5 rounded-[12px] border border-[#e1e6ef] bg-white p-5 shadow-lg sm:p-6">
        <button
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#e1e6ef] bg-white text-navy transition hover:bg-[#f4f6fb]"
          aria-label={t("auth.closeAria")}
          onClick={onClose}
        >
          <FaTimes className="h-4 w-4" aria-hidden />
        </button>

        {isRegisterMode ? (
          <>
            <div className="flex flex-col gap-2 pr-10">
              <h2 id={titleId} className="m-0 text-xl font-bold text-navy">
                {t("register.title")}
              </h2>
              <p className="m-0 text-sm text-text-muted">{t("register.subtitle")}</p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleRegisterSubmit} noValidate>
              <RolePicker role={role} onSelect={selectRole} t={t} />

              <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("register.emailLabel")}</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={INPUT_CLASS}
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("register.passwordLabel")}</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={INPUT_CLASS}
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("register.confirmPasswordLabel")}</span>
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={INPUT_CLASS}
                  required
                />
              </label>

              {error ? (
                <p className="m-0 text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-xl bg-navy px-5 text-sm font-bold text-white transition hover:opacity-95"
                >
                  {t("register.submit")}
                </button>
              </div>
            </form>

            <p className="m-0 text-center text-sm text-text-muted">
              {t("register.switchToLoginPrompt")}{" "}
              <button type="button" className={SWITCH_BUTTON_CLASS} onClick={switchToLogin}>
                {t("register.switchToLoginButton")}
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2 pr-10">
              <h2 id={titleId} className="m-0 text-xl font-bold text-navy">
                {t("login.title")}
              </h2>
              <p className="m-0 text-sm text-text-muted">{t("login.subtitle")}</p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit} noValidate>
              <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("login.emailLabel")}</span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={INPUT_CLASS}
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-start text-sm font-semibold text-navy">
                <span>{t("login.passwordLabel")}</span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={INPUT_CLASS}
                  required
                />
              </label>

              {error ? (
                <p className="m-0 text-sm font-medium text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="pt-2">
                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-xl bg-navy px-5 text-sm font-bold text-white transition hover:opacity-95"
                >
                  {t("login.submit")}
                </button>
              </div>
            </form>

            <p className="m-0 text-center text-sm text-text-muted">
              {t("login.switchToRegisterPrompt")}{" "}
              <button type="button" className={SWITCH_BUTTON_CLASS} onClick={switchToRegister}>
                {t("login.switchToRegisterButton")}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
