import { getShopCategoryLabelKey } from "entities/shop";
import { FOCUS_RING, HAIRLINE } from "../sellerUi";
import { ProductExpiryBadge, ProductRefreshedLabel, ProductStockBadge } from "./ProductBadges";
import { ProductColorSwatches } from "./ProductColorSwatches";
import { ProductPriceEditor } from "./ProductPriceEditor";
import { ProductRowActions } from "./ProductRowActions";
import { SelectionCheckbox } from "./SelectionCheckbox";

/**
 * The same listings on a phone — designed for the width, not shrunk into it (§35, §36).
 *
 * Four short rows with a consistent left/right pairing, so the eye runs down one edge for
 * identity and the other for value and actions: title, then what it is, then status against
 * price, then variants against the controls. That is ~135px per listing where the cards it
 * replaces spent ~180 on strictly less information — and those set every field on its own line,
 * so a phone showed three listings per screen.
 *
 * No horizontal scrolling and no table crammed into 390px: this is the reflow WCAG 1.4.10 asks
 * for, and the row's semantics are carried by the list rather than by a table nobody can read.
 */
export const ProductCardList = ({
  t,
  rows,
  priceLabel,
  selectedIds,
  onToggleSelected,
  justRefreshedIds,
  onEdit,
  onRefresh,
  onDelete,
  onCommitPrice,
}) => (
  <ul className="m-0 list-none p-0 md:hidden" aria-label={t("shopAccount.products.tableAria")}>
    {rows.map(({ product, expiry, daysSinceRefresh, categoryId }) => {
      const selected = selectedIds.has(product.id);
      return (
        <li
          key={product.id}
          className={`flex gap-3 border-b ${HAIRLINE} px-4 py-3 last:border-b-0 ${
            selected ? "bg-[#f5f8ff]" : ""
          }`}
        >
          <div className="mt-0.5 shrink-0">
            <SelectionCheckbox
              checked={selected}
              onChange={() => onToggleSelected(product.id)}
              label={`${t("shopAccount.products.bulk.selectAria")} — ${product.title}`}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <h3 className="m-0">
              <button
                type="button"
                onClick={() => onEdit(product.id)}
                className={`m-0 w-full cursor-pointer border-0 bg-transparent px-0 py-0.5 text-start text-[15px] font-bold leading-snug text-[#0f172a] transition hover:text-link-blue ${FOCUS_RING}`}
              >
                {product.title}
              </button>
            </h3>

            {/*
              Category, configurations and the refresh date on one wrapping line. The date used
              to sit in the bottom row beside the colour dots, where at 320px it had nowhere to
              go and ran underneath the action buttons; here it simply wraps.
            */}
            <p className="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs leading-snug text-text-muted">
              {categoryId ? (
                <span className="rounded bg-[#f1f3f6] px-1.5 py-0.5 font-medium">
                  {t(getShopCategoryLabelKey(categoryId))}
                </span>
              ) : null}
              {product.variants.length > 0 ? (
                <span className="min-w-0">{product.variants.join(" · ")}</span>
              ) : null}
              {daysSinceRefresh === null ? null : (
                <span className="text-[#94a3b8]" aria-hidden="true">
                  ·
                </span>
              )}
              <ProductRefreshedLabel daysSinceRefresh={daysSinceRefresh} t={t} />
            </p>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <ProductStockBadge inStock={product.availability !== "out_of_stock"} t={t} />
                <ProductExpiryBadge expiry={expiry} t={t} />
              </div>
              <ProductPriceEditor
                product={product}
                priceText={priceLabel(product)}
                onCommit={onCommitPrice}
                t={t}
                variant="card"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden text-[11px] text-text-muted">
                <ProductColorSwatches colors={product.colors} t={t} />
              </div>
              <ProductRowActions
                product={product}
                onEdit={() => onEdit(product.id)}
                onRefresh={() => onRefresh(product.id)}
                onDelete={() => onDelete([product.id])}
                justRefreshed={justRefreshedIds.has(product.id)}
                t={t}
                size="md"
              />
            </div>
          </div>
        </li>
      );
    })}
  </ul>
);

export default ProductCardList;
