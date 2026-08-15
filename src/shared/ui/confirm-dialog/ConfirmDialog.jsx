import { useCallback, useId, useRef } from "react";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";
import { useDialogFocusTrap } from "shared/lib/useDialogFocusTrap";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-blue";

const BUTTON_BASE = `min-h-[44px] flex-1 rounded-xl px-5 text-sm font-bold transition ${FOCUS_RING}`;

const CONFIRM_TONE = {
  danger: "bg-[#b91c1c] text-white hover:bg-[#991b1b]",
  primary: "bg-navy text-white hover:bg-active-blue",
};

/**
 * "Do you really want to do X?" — for the handful of actions on this site that cannot be undone
 * by repeating them.
 *
 * The rules it encodes, so no caller has to remember them:
 *  - `role="alertdialog"`, not `dialog`: it interrupts to ask about a consequence, so a screen
 *    reader announces the question with the dialog instead of waiting to be explored.
 *  - Cancel is first in DOM order (first tab stop, first thing announced) and is where focus
 *    starts, so Enter on arrival dismisses rather than destroys. `flex-col-reverse` then paints
 *    it *below* the confirm button on a phone, where the bottom of a stacked pair is the
 *    thumb-reachable position.
 *  - The backdrop is a mouse affordance only — `tabIndex={-1}` and `aria-hidden`, because a
 *    keyboard or screen-reader user already has Escape and the pre-focused Cancel button.
 *
 * `body` is a node rather than a string: the seller's delete confirmation names the listing it
 * is about, and a product title deserves to be marked up as one instead of glued into a
 * sentence with string concatenation.
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = "danger",
  backdropTestId = "confirm-dialog-backdrop",
}) => {
  if (!isOpen) return null;
  return (
    <ConfirmDialogBody
      title={title}
      body={body}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
      tone={tone}
      backdropTestId={backdropTestId}
    />
  );
};

/**
 * Split so every hook below sits behind the `isOpen` gate. A dialog that mounts its effects
 * (body-scroll lock, document keydown listener) while closed is a dialog that fights the page
 * it is not showing on.
 */
const ConfirmDialogBody = ({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone,
  backdropTestId,
}) => {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const bodyId = useId();

  useLockBodyScroll(true);
  useDialogFocusTrap({ dialogRef, initialFocusRef: cancelRef, onClose: onCancel });

  /**
   * Closes before running the action. The action can navigate or re-render the list the
   * trigger lived in; leaving the dialog mounted across that keeps its scroll lock on a page
   * being replaced, and the unmount's focus restore would chase a node that no longer exists.
   */
  const handleConfirm = useCallback(() => {
    onCancel();
    onConfirm();
  }, [onCancel, onConfirm]);

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
      <button
        type="button"
        data-testid={backdropTestId}
        className="absolute inset-0 bg-black/45"
        aria-hidden="true"
        tabIndex={-1}
        onClick={onCancel}
      />

      <div className="relative z-[1] flex w-full max-w-sm flex-col gap-4 rounded-[12px] border border-[#e1e6ef] bg-white p-5 shadow-lg sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="m-0 text-lg font-bold text-navy">
            {title}
          </h2>
          <div id={bodyId} className="m-0 text-sm leading-relaxed text-text-muted">
            {body}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={`${BUTTON_BASE} border border-[#b8c8e8] bg-white text-navy hover:bg-[#f4f6fb]`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`${BUTTON_BASE} ${CONFIRM_TONE[tone] ?? CONFIRM_TONE.danger}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
