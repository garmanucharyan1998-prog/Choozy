import { useCallback, useEffect, useState } from "react";
import { useSubmit } from "react-router";
import { useLanguage } from "contexts";
import { readRoleForEmail, rememberRoleForEmail, ROLES } from "entities/session";
import { localizedPath } from "shared/lib/locale";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";

const AUTH_MODES = {
  REGISTER: "register",
  LOGIN: "login",
};

/**
 * There is still no real backend (see the two submit handlers below — presence checks
 * only, nothing verified against a server). What changed: a role now gets posted to
 * `/session/login`, a resource-route `action` that sets the session cookie and issues a
 * real server redirect — see entities/session and app/routes/sessionLoginAction.js for
 * why that's a server action and not a client-side cookie write.
 *
 * The role picker (`role`/`selectRole` below) only ever applies to registration — a real
 * account's role is decided once, when it's created, not re-chosen on every login. Login
 * instead looks the email up in entities/session's local role registry (populated by a
 * prior registration, or pre-seeded for the two demo accounts) and falls back to buyer for
 * an email that's never been seen — see readRoleForEmail's own doc comment.
 */
export const useAuthModalPresenter = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const submit = useSubmit();
  const [mode, setMode] = useState(AUTH_MODES.REGISTER);
  const [role, setRole] = useState(ROLES.BUYER);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setMode(AUTH_MODES.REGISTER);
    setRole(ROLES.BUYER);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  useLockBodyScroll(isOpen);

  /**
   * Escape to close, Tab kept inside the dialog, focus moved in on open and returned to
   * the trigger on close — without this, keyboard users tabbed straight out of the modal
   * into the page behind it.
   */
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const opener = document.activeElement;
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    const focusablesIn = (root) =>
      Array.from(
        root?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    /** Skip the full-area backdrop button so focus lands on the first real control. */
    const firstField = dialog?.querySelector("input, button[type='submit']");
    firstField?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusables = focusablesIn(dialog);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [isOpen, onClose]);

  const clearError = useCallback(() => setError(""), []);

  /** Survives `switchToLogin`/`switchToRegister` on purpose — toggling register/login
   *  mid-flow shouldn't discard which dashboard the visitor was heading for. */
  const selectRole = useCallback(
    (nextRole) => {
      setRole(nextRole);
      clearError();
    },
    [clearError],
  );

  const handleEmailChange = useCallback(
    (event) => {
      setEmail(event.target.value);
      clearError();
    },
    [clearError],
  );

  const handlePasswordChange = useCallback(
    (event) => {
      setPassword(event.target.value);
      clearError();
    },
    [clearError],
  );

  const handleConfirmPasswordChange = useCallback(
    (event) => {
      setConfirmPassword(event.target.value);
      clearError();
    },
    [clearError],
  );

  const switchToLogin = useCallback(() => {
    setMode(AUTH_MODES.LOGIN);
    setConfirmPassword("");
    setError("");
  }, []);

  const switchToRegister = useCallback(() => {
    setMode(AUTH_MODES.REGISTER);
    setConfirmPassword("");
    setError("");
  }, []);

  const submitSession = useCallback(
    (resolvedRole) => {
      submit(
        { role: resolvedRole, email: email.trim() },
        { method: "post", action: localizedPath("/session/login", language) },
      );
      onClose();
    },
    [submit, email, language, onClose],
  );

  const handleLoginSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!email.trim() || !password.trim()) {
        setError(t("login.errors.required"));
        return;
      }

      /** Unknown email (never registered here) — buyer is the least-surprising default. */
      const resolvedRole = readRoleForEmail(email.trim()) ?? ROLES.BUYER;
      submitSession(resolvedRole);
    },
    [email, password, t, submitSession],
  );

  const handleRegisterSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError(t("register.errors.required"));
        return;
      }

      if (password !== confirmPassword) {
        setError(t("register.errors.passwordMismatch"));
        return;
      }

      rememberRoleForEmail(email.trim(), role);
      submitSession(role);
    },
    [confirmPassword, email, password, role, t, submitSession],
  );

  const isRegisterMode = mode === AUTH_MODES.REGISTER;

  return {
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
  };
};

export default useAuthModalPresenter;
