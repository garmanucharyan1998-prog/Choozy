import { useEffect } from "react";

/**
 * Keyboard behaviour every modal on this site owes its users: Escape closes, Tab cycles inside
 * instead of wandering off onto the page behind, focus starts on a named control, and focus
 * goes back to whatever opened the dialog when it closes.
 *
 * Extracted from `LogoutConfirmDialog`, which had all of it inline. It is now shared with the
 * seller dashboard's destructive confirmations, and a second hand-written copy of a focus trap
 * is exactly the kind of thing that ends up subtly different — the auth modal's own trap finds
 * its dialog with a document-wide `querySelector('[role="dialog"][aria-modal="true"]')` and
 * silently picks whichever one comes first in the document. Every caller here traps against
 * its own ref.
 *
 * `:not([tabindex="-1"])` on the button clause too, not just the generic one — a backdrop is a
 * `<button>` deliberately taken out of the tab order, and without this it would be swept back
 * in as the trap's "first" stop, so Shift+Tab would land on an invisible full-screen control.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * @param {{
 *   dialogRef: import("react").RefObject<HTMLElement>,
 *   initialFocusRef?: import("react").RefObject<HTMLElement>,
 *   onClose: () => void,
 * }} options
 */
export const useDialogFocusTrap = ({ dialogRef, initialFocusRef, onClose }) => {
  useEffect(() => {
    const opener = typeof document !== "undefined" ? document.activeElement : null;
    /** Falls back to the dialog itself so focus is never left behind on the page underneath. */
    (initialFocusRef?.current ?? dialogRef.current)?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      /**
       * No `offsetParent !== null` visibility filter. Callers render their controls
       * unconditionally, so the filter could only ever remove something it should not — and it
       * does exactly that under jsdom, where `offsetParent` is always null, emptying the list
       * and disabling the trap in the one place it can be tested. A filter that cannot be
       * exercised is a filter that cannot be trusted.
       */
      const focusables = Array.from(dialog.querySelectorAll(FOCUSABLE));
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
      /**
       * Only when the opener is still in the document. Confirming can replace the page around
       * it, and focusing a detached node drops focus to `<body>` — worse than leaving it alone.
       */
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
    /**
     * `initialFocusRef`/`dialogRef` are refs — stable objects whose `.current` this reads at
     * mount, deliberately, so a re-render does not re-run the trap and steal focus back from
     * wherever the user has since tabbed to.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);
};

export default useDialogFocusTrap;
