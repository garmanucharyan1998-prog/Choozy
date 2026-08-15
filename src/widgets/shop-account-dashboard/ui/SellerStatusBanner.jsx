import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { SHOP_STATUS_TONES } from "features/shop-account";
import { FOCUS_RING, MOTION_SAFE } from "./sellerUi";

/**
 * The workspace's single feedback channel: one message at a time, in the flow of the page
 * rather than floating over it.
 *
 * Two things changed from what it replaces. It used to render every message — including "the
 * image is too large" and "fill in the name and the e-mail" — in the same green *saved* panel,
 * so a failure and a success were the same colour; tone is now the caller's decision and errors
 * look like errors (§76). And it used to be absolutely positioned *outside* the card, one
 * translate above it, where it covered whatever the page put there; it now occupies real
 * layout, so nothing is hidden behind it.
 *
 * The live region is always mounted, empty when there is nothing to say: a `role="status"`
 * inserted at the same moment as its text is not reliably announced, because assistive tech has
 * to be watching the region before the text arrives. Errors are `assertive` — a seller who has
 * just been told their change was not saved should not hear it after the next three things.
 */
const TONE_STYLES = {
  [SHOP_STATUS_TONES.SUCCESS]: {
    box: "border-[#cfe8d5] bg-[#f1fbf3] text-[#236736]",
    hover: "hover:bg-[#dcefe0]",
    Icon: FaCheckCircle,
  },
  [SHOP_STATUS_TONES.ERROR]: {
    box: "border-[#f5c2c2] bg-[#fef2f2] text-[#991b1b]",
    hover: "hover:bg-[#fde2e2]",
    Icon: FaExclamationTriangle,
  },
  [SHOP_STATUS_TONES.INFO]: {
    box: "border-[#c7d7f5] bg-[#eef3ff] text-[#1e3a8a]",
    hover: "hover:bg-[#dfe8ff]",
    Icon: FaInfoCircle,
  },
};

export const SellerStatusBanner = ({ status, onDismiss, t }) => {
  const tone = TONE_STYLES[status?.tone] ?? TONE_STYLES[SHOP_STATUS_TONES.SUCCESS];
  const { Icon } = tone;
  const isError = status?.tone === SHOP_STATUS_TONES.ERROR;

  const message = status
    ? String(t(status.key)).replace("{{count}}", String(status.values?.count ?? ""))
    : "";

  return (
    /**
     * No `empty:hidden` here, deliberately. `display: none` takes the element out of the
     * accessibility tree, so the region would be inserted at the same instant as its text —
     * which is exactly the case assistive tech does not reliably announce. Empty it occupies
     * no space anyway.
     */
    <div role="status" aria-live={isError ? "assertive" : "polite"}>
      {status ? (
        <div
          className={`mb-3 flex items-start gap-3 rounded-[10px] border px-4 py-3 text-sm font-medium leading-snug transition-opacity md:mb-4 ${tone.box} ${MOTION_SAFE}`}
        >
          <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="m-0 min-w-0 flex-1 text-start">{message}</p>
          <button
            type="button"
            onClick={onDismiss}
            className={`-me-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${tone.hover} ${FOCUS_RING}`}
            aria-label={t("shopAccount.messages.dismissStatus")}
          >
            <FaTimes className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SellerStatusBanner;
