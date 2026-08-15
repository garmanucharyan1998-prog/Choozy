import { useMemo, useState } from "react";
import { BUTTON_GHOST, FOCUS_RING } from "../sellerUi";

/** How many options are worth showing before the grid stops being a choice and becomes a wall. */
const COLLAPSED_LIMIT = 12;

/**
 * The chip grids in the add/edit form — configurations and colours.
 *
 * The shop's option lists are not short: the catalog has grown to ~43 configuration labels and
 * ~35 colours, and the form used to paint every one of them, every time, so choosing two chips
 * meant scrolling past eighty. Two changes, both presentation only — the option sets themselves
 * are untouched:
 *
 *  - what is already selected sorts to the front, so editing a listing opens with its own
 *    choices visible rather than somewhere down the grid;
 *  - the rest collapses behind a count, and the count is honest about how much is hidden.
 *
 * Buttons with `aria-pressed` inside a group labelled by the field's own heading, so the whole
 * grid is announced as one control rather than forty unrelated toggles.
 */
export const ProductOptionGrid = ({
  options,
  selectedIds,
  onToggle,
  groupLabel,
  t,
  renderOption,
  columnsClassName = "flex flex-wrap gap-1.5 sm:gap-2",
}) => {
  const [expanded, setExpanded] = useState(false);

  /**
   * Sorted once per selection change, not per render, and stably: `sort` on the index keeps
   * unselected options in their catalog order instead of reshuffling as chips are clicked.
   */
  const ordered = useMemo(() => {
    const selectedFirst = options.map((option, index) => ({
      option,
      index,
      selected: selectedIds.includes(option.id),
    }));
    selectedFirst.sort((a, b) => {
      if (a.selected !== b.selected) return a.selected ? -1 : 1;
      return a.index - b.index;
    });
    return selectedFirst.map((entry) => entry.option);
  }, [options, selectedIds]);

  const visible = expanded ? ordered : ordered.slice(0, COLLAPSED_LIMIT);
  const hidden = ordered.length - visible.length;

  return (
    <div className="min-w-0">
      <div className={columnsClassName} role="group" aria-label={groupLabel}>
        {visible.map((option) =>
          renderOption(option, selectedIds.includes(option.id), () => onToggle(option.id)),
        )}
      </div>
      {hidden > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`${BUTTON_GHOST} mt-2 px-2 py-1 text-xs ${FOCUS_RING}`}
        >
          {expanded
            ? t("shopAccount.products.options.showFewer")
            : t("shopAccount.products.options.showAll").replace("{{count}}", String(hidden))}
        </button>
      ) : null}
    </div>
  );
};

export default ProductOptionGrid;
