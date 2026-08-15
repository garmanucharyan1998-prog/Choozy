import { useCallback, useEffect, useRef, useState } from "react";
import { useSubmit } from "react-router";
import { useLanguage } from "contexts";
import {
  hasAccountForEmail,
  readPasswordHashForEmail,
  readRoleForEmail,
  rememberPasswordForEmail,
  rememberRoleForEmail,
  ROLES,
} from "entities/session";
import { hashPassword } from "entities/user";
import { localizedPath } from "shared/lib/locale";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";

const AUTH_MODES = {
  REGISTER: "register",
  LOGIN: "login",
};

/** Matches account.password.tooShort's rule so the two places can't disagree. */
const MIN_PASSWORD_LENGTH = 6;

/**
 * Deliberately loose — one `@`, a dot in the domain, no whitespace. Enough to catch a real
 * typo without rejecting the valid-but-unusual addresses a stricter pattern always does.
 */
const isLikelyEmail = (value) => /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(value).trim());

/**
 * There is still no real backend. A role gets posted to `/session/login`, a resource-route
 * `action` that sets the session cookie and issues a real server redirect — see
 * entities/session and app/routes/sessionLoginAction.js for why that's a server action and
 * not a client-side cookie write.
 *
 * The role picker (`role`/`selectRole` below) only ever applies to registration — a real
 * account's role is decided once, when it's created, not re-chosen on every login. Login
 * instead looks the email up in entities/session's local account registry (populated by a
 * prior registration, or pre-seeded for the two demo accounts).
 *
 * **Login can now fail.** It used to be impossible: both handlers checked only that the fields
 * were non-empty, and an unknown address fell through `?? ROLES.BUYER` into a successful sign-in
 * as a buyer with an empty account — indistinguishable, from the visitor's side, from having
 * lost everything in their own. Login now requires the account to exist, and requires the
 * password to match when one is on file.
 *
 * This is not authentication and must not be read as it. The registry is localStorage the
 * visitor can edit, the hash is unsalted SHA-256 computed in the browser, and the session cookie
 * is one the browser sets on itself. What it buys is a login form that can be *wrong* — which is
 * a UX property, not a security one.
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

  /**
   * The dialog element itself, handed over by LoginModal. Was
   * `document.querySelector('[role="dialog"][aria-modal="true"]')`, which returns the first
   * such element in the document — the wishlist-remove confirm and the mobile filter drawer
   * carry the same selector, so this only ever picked the right node because the header
   * happens to precede `<main>` in DOM order.
   */
  const dialogRef = useRef(null);

  /**
   * No "reset the form when closed" effect: `LoginModal` gates on `isOpen` before calling
   * this hook, so the presenter is never mounted while closed and every open starts from
   * these initial values. The old effect could not run — its own condition was unreachable.
   */
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
    /**
     * The ref above, actually used. This line was still the document-wide query the comment on
     * `dialogRef` says it replaced — the ref was created and wired up in `LoginModal`, and then
     * never read here, so the trap kept resolving whichever `[role="dialog"][aria-modal="true"]`
     * came first in the document.
     */
    const dialog = dialogRef.current;
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

  /**
   * Hashes the typed password, or returns `""` when it cannot.
   *
   * `crypto.subtle` exists only in a secure context; over plain HTTP it throws. The account
   * page learned this the hard way — there the rejection was swallowed and the user got no
   * feedback. Here the consequence has to go the other way: an unusable hashing API must not
   * lock anyone out of a demo, so it degrades to "cannot verify" and the account's other
   * checks still apply. Nothing here is an authentication boundary; see the registry.
   */
  const hashOrEmpty = useCallback(async (plainText) => {
    try {
      return await hashPassword(plainText);
    } catch {
      return "";
    }
  }, []);

  const handleLoginSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmedEmail = email.trim();

      if (!trimmedEmail || !password.trim()) {
        setError(t("login.errors.required"));
        return;
      }

      /**
       * An address nobody has registered in this browser is now a failed login rather than a
       * silent success. It used to fall through to `?? ROLES.BUYER`, so a typo in an email —
       * or any address at all — signed the visitor in as a buyer with an empty account, which
       * looks exactly like losing your data.
       */
      if (!hasAccountForEmail(trimmedEmail)) {
        setError(t("login.errors.invalidCredentials"));
        return;
      }

      /**
       * Only accounts that have a password on file can have a wrong one. The two seeded demo
       * accounts have none, and neither does anything registered before passwords were stored,
       * so those still accept any password — refusing them would lock people out of a password
       * that was never set. Registration writes a hash from now on, so every account created
       * from here is checked for real.
       */
      const storedHash = readPasswordHashForEmail(trimmedEmail);
      if (storedHash) {
        const typedHash = await hashOrEmpty(password);
        if (typedHash && typedHash !== storedHash) {
          setError(t("login.errors.invalidCredentials"));
          return;
        }
      }

      /** Guaranteed non-null by the existence check above; the fallback is belt and braces. */
      const resolvedRole = readRoleForEmail(trimmedEmail) ?? ROLES.BUYER;
      submitSession(resolvedRole);
    },
    [email, password, t, submitSession, hashOrEmpty],
  );

  const handleRegisterSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError(t("register.errors.required"));
        return;
      }

      /**
       * The form sets `noValidate` (it renders its own error line rather than the browser's
       * bubble), so `type="email"` alone checks nothing. This address becomes the session
       * cookie's identity and the suffix of the visitor's localStorage shelf, so a typo is
       * not recoverable from the UI — worth one check even in a demo with no backend.
       */
      if (!isLikelyEmail(email)) {
        setError(t("register.errors.invalidEmail"));
        return;
      }

      /** Same 6-character floor the in-account password change already enforces. */
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(t("register.errors.passwordTooShort"));
        return;
      }

      if (password !== confirmPassword) {
        setError(t("register.errors.passwordMismatch"));
        return;
      }

      const trimmedEmail = email.trim();
      rememberRoleForEmail(trimmedEmail, role);
      /**
       * The hash is what gives this account a password that can later be wrong. Written after
       * the role, because `rememberPasswordForEmail` refuses to create an entry on its own — a
       * password without a role is not an account.
       */
      const passwordHash = await hashOrEmpty(password);
      if (passwordHash) rememberPasswordForEmail(trimmedEmail, passwordHash);
      submitSession(role);
    },
    [confirmPassword, email, password, role, t, submitSession, hashOrEmpty],
  );

  const isRegisterMode = mode === AUTH_MODES.REGISTER;

  return {
    dialogRef,
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
