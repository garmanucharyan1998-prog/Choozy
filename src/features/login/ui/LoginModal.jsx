import { FaTimes } from "react-icons/fa";
import { useLanguage } from "contexts";
import { useAuthModalPresenter } from "../presenter/useAuthModalPresenter";

const INPUT_CLASS =
  "h-11 w-full rounded-[10px] border border-[#b8c8e8] bg-white px-3 text-sm text-text-dark outline-none focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40";

const SWITCH_BUTTON_CLASS =
  "border-0 bg-transparent p-0 text-sm font-bold text-link-blue underline transition hover:opacity-80";

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const {
    isRegisterMode,
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
  } = useAuthModalPresenter({ isOpen, onClose, onSuccess });

  if (!isOpen) {
    return null;
  }

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
