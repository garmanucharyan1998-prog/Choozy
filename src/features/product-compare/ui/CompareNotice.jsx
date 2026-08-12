import { useEffect, useState } from "react";
import { useLanguage } from "contexts";
import { COMPARE_REJECTION, COMPARE_STORAGE_EVENT } from "entities/product-compare";

/**
 * Tells the visitor why a compare button did nothing.
 *
 * A refused add is silent by construction — the selection does not change, so the card's
 * `aria-pressed` stays exactly where it was and the click reads as a broken button. The two
 * refusals both have a fix the visitor can act on (drop a column, or start a new comparison),
 * so they are worth a sentence.
 *
 * Mounted once per shell rather than per card: the message is about the selection, not about
 * the card that happened to be clicked, and four lists on one page would otherwise stack four
 * copies of it.
 */
const MESSAGE_KEY_BY_REASON = {
  [COMPARE_REJECTION.LIMIT]: "comparePage.limitReached",
  [COMPARE_REJECTION.CATEGORY]: "comparePage.categoryMismatch",
};

const VISIBLE_MS = 5000;

export const CompareNotice = () => {
  const { t } = useLanguage();
  const [reason, setReason] = useState(null);

  useEffect(() => {
    let timer;

    const onCompareChange = (event) => {
      const rejected = event?.detail?.rejected ?? null;
      if (!rejected) return;
      setReason(rejected);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setReason(null), VISIBLE_MS);
    };

    window.addEventListener(COMPARE_STORAGE_EVENT, onCompareChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COMPARE_STORAGE_EVENT, onCompareChange);
    };
  }, []);

  /**
   * The live region is always in the DOM, empty. A `role="status"` inserted at the same moment
   * as its text is not reliably announced — assistive tech has to be watching the region
   * before the text arrives.
   *
   * It rides above the compare tray when one is on screen (`--compare-tray-height`, published by
   * the tray itself). The limit message is precisely the moment a visitor needs to see the tray
   * to drop something, so a toast parked on top of it would hide the fix it is asking for.
   */
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--compare-tray-height,0px)+6rem)] z-50 flex justify-center px-4 md:bottom-[calc(var(--compare-tray-height,0px)+2rem)]"
    >
      {reason ? (
        <p className="m-0 max-w-md rounded-xl bg-navy px-4 py-3 text-center text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
          {t(MESSAGE_KEY_BY_REASON[reason])}
        </p>
      ) : null}
    </div>
  );
};

export default CompareNotice;
