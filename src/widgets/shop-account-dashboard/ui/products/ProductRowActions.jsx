import { FaCheck, FaPen, FaRegTrashAlt, FaSyncAlt } from "react-icons/fa";
import { FOCUS_RING, ICON_BUTTON, MOTION_SAFE } from "../sellerUi";

/**
 * Edit, refresh, delete — three actions with three different weights, which is the whole point.
 *
 * They used to be three identical 28px glyphs in one grey capsule, so the safe action and the
 * irreversible one were the same size, the same colour and 8px apart (§20). Now: edit reads as
 * the row's default (a bordered control, the only one with a fill), refresh is quieter, and
 * delete sits past a divider and turns red the moment it is hovered or focused — and never acts
 * on its own, since it opens a confirmation naming the listing (§23).
 *
 * Every label names the product. "Edit product" repeated sixty times tells a screen-reader user
 * nothing about which row they are on.
 *
 * After a refresh the button holds a tick for a couple of seconds and refuses to fire again.
 * The write is synchronous, so there is no progress worth animating and none is invented (§22);
 * what the seller gets is proof it happened and a control that cannot be double-fired.
 */
export const ProductRowActions = ({
  product,
  onEdit,
  onRefresh,
  onDelete,
  justRefreshed,
  t,
  showLabels = false,
  /** 36px on touch-first layouts (the phone card list), 32px in the table's denser rows. */
  size = "sm",
}) => {
  const refreshLabel = justRefreshed
    ? t("shopAccount.products.refreshedAria")
    : `${t("shopAccount.products.refreshAria")} — ${product.title}`;
  const iconButton = size === "md" ? `${ICON_BUTTON} h-9 w-9` : ICON_BUTTON;

  return (
    <div className="flex shrink-0 items-center gap-1" role="group">
      <button
        type="button"
        onClick={onEdit}
        title={t("shopAccount.products.edit")}
        aria-label={`${t("shopAccount.products.editAria")} — ${product.title}`}
        className={
          showLabels
            ? `inline-flex items-center gap-2 rounded-lg border border-[#dde3f8] bg-white px-3 py-2 text-xs font-semibold text-navy transition hover:border-link-blue hover:bg-hover-blue ${FOCUS_RING}`
            : `${iconButton} border border-[#dde3f8] bg-white text-navy hover:border-link-blue hover:bg-hover-blue`
        }
      >
        <FaPen className="h-3 w-3" aria-hidden="true" />
        {showLabels ? t("shopAccount.products.edit") : null}
      </button>

      <button
        type="button"
        onClick={onRefresh}
        disabled={justRefreshed}
        title={t("shopAccount.products.refresh")}
        aria-label={refreshLabel}
        className={
          showLabels
            ? `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${MOTION_SAFE} ${FOCUS_RING} ${
                justRefreshed
                  ? "cursor-default bg-[#f1fbf3] text-[#236736]"
                  : "text-text-muted hover:bg-hover-blue hover:text-link-blue"
              }`
            : `${iconButton} ${MOTION_SAFE} ${
                justRefreshed
                  ? "cursor-default bg-[#f1fbf3] text-[#236736]"
                  : "text-text-muted hover:bg-hover-blue hover:text-link-blue"
              }`
        }
      >
        {justRefreshed ? (
          <FaCheck className="h-3 w-3" aria-hidden="true" />
        ) : (
          <FaSyncAlt className="h-3 w-3" aria-hidden="true" />
        )}
        {showLabels
          ? justRefreshed
            ? t("shopAccount.products.refreshedShort")
            : t("shopAccount.products.refresh")
          : null}
      </button>

      {/* The separation is the warning: past this line, actions do not come back. */}
      <span className="mx-0.5 h-5 w-px shrink-0 bg-[#e8ecf3]" aria-hidden="true" />

      <button
        type="button"
        onClick={onDelete}
        title={t("shopAccount.products.delete")}
        aria-label={`${t("shopAccount.products.deleteAria")} — ${product.title}`}
        className={
          showLabels
            ? `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-text-muted transition hover:bg-[#fef2f2] hover:text-[#b91c1c] ${FOCUS_RING}`
            : `${iconButton} text-text-muted hover:bg-[#fef2f2] hover:text-[#b91c1c]`
        }
      >
        <FaRegTrashAlt className="h-3.5 w-3.5" aria-hidden="true" />
        {showLabels ? t("shopAccount.products.delete") : null}
      </button>
    </div>
  );
};

export default ProductRowActions;
