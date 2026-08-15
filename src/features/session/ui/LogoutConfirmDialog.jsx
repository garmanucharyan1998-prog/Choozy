import { useCallback, useId, useRef } from "react";
import { useLanguage } from "contexts";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";
import { useDialogFocusTrap } from "shared/lib/useDialogFocusTrap";
import { useLogout } from "../presenter/useLogout";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-blue";

const BUTTON_BASE = `min-h-[44px] flex-1 rounded-xl px-5 text-sm font-bold transition ${FOCUS_RING}`;

/**
 * "Are you sure you want to log out?" — the one modal on the site whose answer is destructive,
 * so the layout says which button is which before either is read: cancel is the wide, plain,
 * pre-focused one, and confirming is the deliberate second choice.
 *
 * Not built on `useAuthModalPresenter`'s trap. That one finds its dialog with a document-wide
 * `querySelector('[role="dialog"][aria-modal="true"]')`, which silently picks the first dialog
 * in the document — fine while the login modal was the only one, wrong the moment a second
 * exists. This traps against its own ref, via `useDialogFocusTrap` — the same hook the shared
 * `ConfirmDialog` uses, so there is one implementation of Escape/Tab/focus-restore rather than
 * one per modal.
 *
 * Kept as its own component rather than folded into `ConfirmDialog`: the confirm button here is
 * `navy`, not the destructive red, because ending a session is reversible by signing back in —
 * and the `useLogout` submission has to stay behind the `isOpen` gate (see below).
 *
 * `role="alertdialog"` rather than `dialog`: it interrupts to ask about a consequence, so a
 * screen reader should announce the question with the dialog instead of waiting to be read.
 *
 * The gate on `isOpen` sits before any hook runs, which is what keeps `useLogout` — and the
 * `useSubmit` inside it — off the render path of a header mounted without a data router. Same
 * arrangement as `LoginModal`/`LoginModalDialog`, for the same reason.
 */
const LogoutConfirmDialog = ({ isOpen, onCancel }) => {
  if (!isOpen) return null;
  return <LogoutConfirmDialogBody onCancel={onCancel} />;
};

const LogoutConfirmDialogBody = ({ onCancel }) => {
  const { t } = useLanguage();
  const logout = useLogout();
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();

  useLockBodyScroll(true);

  /**
   * Focus starts on Cancel — the safe choice — so Enter on arrival dismisses rather than logs
   * out, and returns to whichever trigger opened it (the header icon or a sidebar entry) when
   * the dialog goes away.
   */
  useDialogFocusTrap({ dialogRef, initialFocusRef: cancelRef, onClose: onCancel });

  const handleBackdrop = useCallback(() => onCancel(), [onCancel]);

  /**
   * Closes before submitting. The submission navigates and revalidates every loader; leaving the
   * dialog mounted across that keeps the body scroll lock on while the page it locked is
   * replaced, and the unmount's focus restore would chase a node that no longer exists.
   */
  const handleConfirm = useCallback(() => {
    onCancel();
    logout();
  }, [onCancel, logout]);

  return (
    <div
      ref={dialogRef}
      /** Above the login modal's 95 and the mobile panel's scrim, so it is never asked from under something. */
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      {/**
       * A click target for the mouse, and nothing else: `tabIndex={-1}` and `aria-hidden` keep
       * it out of the tab cycle and off the accessibility tree, because a keyboard or screen
       * reader user already has two better ways out — Escape, and the Cancel button that is
       * where focus starts. The auth modal keeps its backdrop tabbable and then has to skip it
       * when choosing initial focus; there is no reason to inherit that here.
       */}
      <button
        type="button"
        data-logout-backdrop
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
        tabIndex={-1}
        onClick={handleBackdrop}
      />

      <div className="relative z-[1] flex w-full max-w-sm flex-col gap-4 rounded-[12px] border border-[#e1e6ef] bg-white p-5 shadow-lg sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="m-0 text-lg font-bold text-navy">
            {t("auth.logoutConfirmTitle")}
          </h2>
          {/**
           * Says only what is certainly true: the session ends and signing in again is what
           * undoes it. No promises about what a logout does or does not keep — nothing here
           * has been verified to survive it.
           */}
          <p id={bodyId} className="m-0 text-sm text-text-muted">
            {t("auth.logoutConfirmBody")}
          </p>
        </div>

        {/**
         * Cancel first in DOM order, so it is both the first tab stop and the first thing a
         * screen reader reaches. `flex-col-reverse` then paints it second on a phone, where the
         * bottom of a stacked pair is the thumb-reachable position.
         */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={`${BUTTON_BASE} border border-[#b8c8e8] bg-white text-navy hover:bg-[#f4f6fb]`}
          >
            {t("auth.logoutConfirmCancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${BUTTON_BASE} bg-navy text-white hover:opacity-95`}
          >
            {t("auth.logoutConfirmSubmit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export { LogoutConfirmDialog };
export default LogoutConfirmDialog;
