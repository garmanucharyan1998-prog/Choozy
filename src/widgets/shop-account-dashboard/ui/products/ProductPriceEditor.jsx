import { useEffect, useRef, useState } from "react";
import {
  formatAmdPriceConversionParts,
  parseProductAmdAmount,
} from "shared/lib/formatAmdPriceConversions";
import { parseAmdInput } from "shared/lib/parseAmdInput";
import { FOCUS_RING } from "../sellerUi";

/**
 * A listing's price, and the fastest way to change it.
 *
 * Editing in place is kept from the previous dashboard — changing a price is the single most
 * repeated seller action here, and sending it through the full edit form for one number would
 * be a worse workflow, not a better one (§21). What is new is that a rejected value keeps the
 * editor open with the bad input still in it: it used to close on blur regardless, so a typo
 * was silently discarded and the row went back to showing the old price beside a red message
 * about a field the seller could no longer see.
 *
 * The USD/RUB conversion stays on hover and on focus. It is a genuine aid — the catalog's
 * buyers think in dram, its suppliers often do not — and it is `aria-describedby`, so it is
 * available rather than announced over the price itself.
 */
export const ProductPriceEditor = ({
  product,
  priceText,
  onCommit,
  t,
  align = "end",
  variant = "table",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [showConversion, setShowConversion] = useState(false);
  const inputRef = useRef(null);

  const conversion = formatAmdPriceConversionParts(parseProductAmdAmount(product));
  const alignEnd = align === "end";

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEditing = () => {
    const parsed = parseAmdInput(product.price) ?? product.priceAmd;
    setDraft(typeof parsed === "number" && Number.isFinite(parsed) ? String(parsed) : "");
    setIsEditing(true);
  };

  const commit = () => {
    /** Unchanged text is not an edit — closing without a write avoids a pointless "saved". */
    const parsed = parseAmdInput(draft);
    const current = parseAmdInput(product.price) ?? product.priceAmd;
    if (parsed !== null && parsed === current) {
      setIsEditing(false);
      return;
    }
    if (onCommit(product.id, draft)) setIsEditing(false);
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft("");
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
        className={`box-border h-9 w-full max-w-[8rem] rounded-md border border-[#b8c8e8] bg-white px-2 text-base font-bold tabular-nums text-navy outline-none focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40 ${
          alignEnd ? "text-end" : "text-start"
        }`}
        aria-label={t("shopAccount.products.editPriceAria")}
      />
    );
  }

  return (
    <div
      className={`relative inline-flex max-w-full whitespace-nowrap ${
        alignEnd ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowConversion(true)}
      onMouseLeave={() => setShowConversion(false)}
      onFocus={() => setShowConversion(true)}
      onBlur={() => setShowConversion(false)}
    >
      {showConversion && conversion ? (
        <div
          id={`price-tip-${product.id}`}
          role="tooltip"
          className={`pointer-events-none absolute bottom-[calc(100%+6px)] z-30 whitespace-nowrap rounded-lg border border-[#e8ecf3] bg-white px-3 py-2 shadow-[0_4px_18px_rgba(15,23,42,0.12)] ${
            alignEnd ? "right-0" : "left-0"
          }`}
        >
          <p className="m-0 text-xs font-normal leading-none text-[#9ca3af]">
            <span>{conversion.usdLabel}</span>
            <span className="mx-1.5 text-[#cbd5e1]">·</span>
            <span>{conversion.rubLabel}</span>
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={startEditing}
        className={`rounded-md border border-transparent bg-transparent px-1.5 py-0.5 tabular-nums text-navy transition hover:border-[#b8c8e8] hover:bg-white ${FOCUS_RING} ${
          variant === "card" ? "text-lg font-bold" : "text-[15px] font-bold"
        } ${alignEnd ? "text-end" : "text-start"}`}
        aria-label={`${t("shopAccount.products.editPriceAria")} — ${product.title}`}
        aria-describedby={showConversion && conversion ? `price-tip-${product.id}` : undefined}
      >
        {priceText}
      </button>
    </div>
  );
};

export default ProductPriceEditor;
