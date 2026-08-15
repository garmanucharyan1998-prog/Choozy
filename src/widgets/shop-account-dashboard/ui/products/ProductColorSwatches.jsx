import { getShopColorOptionById, resolveShopColorLabel } from "entities/shop";

/** Beyond this the dots stop being scannable and start being a texture; the rest become "+N". */
const MAX_VISIBLE_SWATCHES = 4;

/**
 * Light swatches need their own outline or they vanish into a white row — the same reason the
 * catalog's colour filter rings its white option. Exported because the add/edit form paints the
 * same swatches and had the same problem.
 */
const LIGHT_SWATCH_HEXES = new Set([
  "#fff",
  "#ffffff",
  "#f3f4f6",
  "#f5f5f7",
  "#f5f0e8",
  "#f5f5f5",
  "#e8e8e8",
  "#e3e4e6",
  "#e7dbc7",
  "#d6dae0",
]);

export const isLightSwatch = (hex) => LIGHT_SWATCH_HEXES.has(String(hex || "").trim().toLowerCase());

/**
 * A listing's colour variants, as dots with names.
 *
 * The names are the fix. Each dot used to carry `title={hex.toUpperCase()}`, so the only
 * description of a colour anywhere in the dashboard was "#F5F0E8" — useless on hover and worse
 * to a screen reader, which got a list of hex codes where the seller needed "Starlight" (§19).
 * The labels are the shop catalog's own (`resolveShopColorLabel`), localized, with the swatch
 * id as the last resort for a colour the option list no longer carries.
 *
 * One `sr-only` sentence names the whole set rather than each dot announcing itself, so a row
 * reads as "Colours: Black, Silver, Blue" instead of six separate stops.
 */
export const ProductColorSwatches = ({ colors, t, size = "sm" }) => {
  if (!colors || colors.length === 0) return null;

  const named = colors.map((color) => {
    const option = getShopColorOptionById(color.id);
    const label = option
      ? resolveShopColorLabel(option, t)
      : String(color.id || "").replace(/-/g, " ");
    return { ...color, label: label || color.hex || "" };
  });

  const visible = named.slice(0, MAX_VISIBLE_SWATCHES);
  const overflow = named.length - visible.length;
  const dotSize = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1">
      {visible.map((color) => (
          <span
            key={color.id}
            title={color.label}
            className={`inline-block shrink-0 rounded-full ${dotSize} ${
              isLightSwatch(color.hex) ? "border border-[#cbd5e1]" : "border border-black/10"
            }`}
            style={{ backgroundColor: color.hex || "#ccc" }}
          />
      ))}
      {overflow > 0 ? (
        <span
          className="ms-0.5 shrink-0 text-[11px] font-semibold tabular-nums text-text-muted"
          aria-hidden="true"
        >
          +{overflow}
        </span>
      ) : null}
      {/* The column heading's wording, not the form field's — that one carries a "*". */}
      <span className="sr-only">
        {`${t("shopAccount.products.tableHeaders.color")}: ${named.map((c) => c.label).join(", ")}`}
      </span>
    </div>
  );
};

export default ProductColorSwatches;
