import { useEffect, useRef } from "react";
import { FOCUS_RING } from "../sellerUi";

/**
 * A 16px box inside a 32px label — the bulk-selection control for both the table and the card
 * list.
 *
 * WCAG 2.2 AA asks for a 24x24 target and a bare `<input type="checkbox">` renders at 16, which
 * is also simply annoying to hit in a dense row. The label around it is the real target:
 * clicking anywhere inside toggles the box. Enlarged rather than made visually bigger, because
 * a fat checkbox would outweigh the product title beside it. The negative margin keeps the
 * bigger target from changing the row's spacing.
 */
export const SelectionCheckbox = ({ checked, indeterminate = false, onChange, label }) => {
  const ref = useRef(null);

  /** `indeterminate` is a DOM property, not an attribute — React cannot set it declaratively. */
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="-m-2 flex h-8 w-8 cursor-pointer items-center justify-center p-2">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className={`h-4 w-4 cursor-pointer accent-navy ${FOCUS_RING}`}
      />
    </label>
  );
};

export default SelectionCheckbox;
