import { getShopCategoryLabelKey } from "entities/shop";
import { FOCUS_RING, HAIRLINE, SUBTLE_FILL } from "../sellerUi";
import { ProductExpiryBadge, ProductRefreshedLabel, ProductStockBadge } from "./ProductBadges";
import { ProductColorSwatches } from "./ProductColorSwatches";
import { ProductPriceEditor } from "./ProductPriceEditor";
import { ProductRowActions } from "./ProductRowActions";
import { SelectionCheckbox } from "./SelectionCheckbox";

/**
 * Column widths are declared on the fixed columns only; the product column takes whatever is
 * left, because the title is the one field whose length actually varies. Each fixed width is
 * its content plus this cell padding and nothing more — the first pass gave status and price
 * 8.5rem each and left a 1024px laptop with a 224px title column wrapping every model name
 * onto three lines.
 */
const CELL = "px-3 py-2.5 align-middle first:ps-4 last:pe-4";

/**
 * The seller's listings as a real table, from the tablet breakpoint up.
 *
 * It used to appear only at 1280px and wider; every laptop at 1024 and every tablet got the
 * phone's card list, one listing per ~180px of scroll — sixty-two of them made a twelve-thousand
 * pixel page (§13, §47). A table is the right shape here because the questions are comparative
 * ("which of these is out of stock", "which is cheapest", "which have I not refreshed"), and
 * those are answered by scanning a column, which is the one thing a stack of cards cannot offer.
 *
 * Columns arrive as the width to carry them does, rather than the layout switching wholesale:
 * identity, status, price and actions at every size; colour variants from `xl`; the refresh date
 * from `2xl`. Each hidden column's data still exists in the row for the sizes that show it, and
 * nothing is *only* in a hidden column — the expiry badge sits beside the title, so a seller on
 * a narrow laptop still sees what needs attention.
 *
 * No sticky header. The list pages at 24 rows, so the header is never far, and this page already
 * sits under a sticky site header that a second pinned strip would have to negotiate with.
 */
export const ProductTable = ({
  t,
  rows,
  priceLabel,
  selectedIds,
  onToggleSelected,
  onToggleSelectAll,
  allMatchedSelected,
  someMatchedSelected,
  justRefreshedIds,
  onEdit,
  onRefresh,
  onDelete,
  onCommitPrice,
}) => (
  <div className="hidden md:block">
    <table className="w-full table-fixed border-collapse text-sm">
      <caption className="sr-only">{t("shopAccount.products.tableAria")}</caption>
      <thead>
        <tr className={`border-b border-[#e8ecf3] ${SUBTLE_FILL} text-[#64748b]`}>
          <th scope="col" className={`${CELL} w-12`}>
            <SelectionCheckbox
              checked={allMatchedSelected}
              indeterminate={!allMatchedSelected && someMatchedSelected}
              onChange={onToggleSelectAll}
              label={t("shopAccount.products.bulk.selectAllAria")}
            />
          </th>
          <th scope="col" className={`${CELL} text-start text-xs font-semibold`}>
            {t("shopAccount.products.tableHeaders.product")}
          </th>
          <th scope="col" className={`${CELL} w-[6.75rem] text-start text-xs font-semibold`}>
            {t("shopAccount.products.tableHeaders.available")}
          </th>
          <th
            scope="col"
            className={`${CELL} hidden w-[5.75rem] text-start text-xs font-semibold xl:table-cell`}
          >
            {t("shopAccount.products.tableHeaders.color")}
          </th>
          <th
            scope="col"
            className={`${CELL} hidden w-[7rem] text-start text-xs font-semibold 2xl:table-cell`}
          >
            {t("shopAccount.products.tableHeaders.refreshed")}
          </th>
          {/* Never narrower than its longest amount: a squeezed price is a wrong price. */}
          <th scope="col" className={`${CELL} w-[8.5rem] text-end text-xs font-semibold`}>
            {t("shopAccount.products.tableHeaders.price")}
          </th>
          {/*
            The heading is for screen readers only. "Գործողություններ" is 16 characters and does
            not fit the column its own buttons need, and a visible label buys a sighted seller
            nothing: three icon buttons at the end of a row are self-evident, and each one
            carries its own name for anyone who cannot see them.
          */}
          <th scope="col" className={`${CELL} w-[8.25rem]`}>
            <span className="sr-only">{t("shopAccount.products.tableHeaders.actions")}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ product, expiry, daysSinceRefresh, categoryId }) => {
          const selected = selectedIds.has(product.id);
          return (
            <tr
              key={product.id}
              className={`border-b ${HAIRLINE} transition-colors last:border-b-0 ${
                selected ? "bg-[#f5f8ff]" : "hover:bg-[#fafbfd]"
              }`}
            >
              <td className={CELL}>
                <SelectionCheckbox
                  checked={selected}
                  onChange={() => onToggleSelected(product.id)}
                  label={`${t("shopAccount.products.bulk.selectAria")} — ${product.title}`}
                />
              </td>

              <td className={CELL}>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {/*
                      The title is a heading and the row's own way into the edit form — the
                      shortest path for the action a seller repeats most (§21). The explicit
                      Edit button in the actions column is the discoverable one; this is the
                      shortcut for whoever has already learned it.
                    */}
                    <h3 className="m-0 min-w-0 text-[length:inherit] font-[inherit] leading-[inherit]">
                      <button
                        type="button"
                        onClick={() => onEdit(product.id)}
                        className={`m-0 cursor-pointer border-0 bg-transparent px-0 py-0.5 text-start text-[15px] font-bold leading-snug text-[#0f172a] transition hover:text-link-blue hover:underline ${FOCUS_RING}`}
                      >
                        {product.title}
                      </button>
                    </h3>
                    <ProductExpiryBadge expiry={expiry} t={t} />
                  </div>
                  {/*
                    Configurations as one quiet line rather than a chip each: with two or three
                    per listing the pills were the loudest thing in the row and carried the
                    least (§18).
                  */}
                  <p className="m-0 flex flex-wrap items-center gap-x-1.5 text-xs leading-snug text-text-muted">
                    {categoryId ? (
                      <span className="rounded bg-[#f1f3f6] px-1.5 py-0.5 font-medium">
                        {t(getShopCategoryLabelKey(categoryId))}
                      </span>
                    ) : null}
                    {product.variants.length > 0 ? (
                      <span className="min-w-0">{product.variants.join(" · ")}</span>
                    ) : null}
                  </p>
                </div>
              </td>

              <td className={CELL}>
                <ProductStockBadge inStock={product.availability !== "out_of_stock"} t={t} />
              </td>

              <td className={`${CELL} hidden xl:table-cell`}>
                <ProductColorSwatches colors={product.colors} t={t} />
              </td>

              <td className={`${CELL} hidden text-xs text-text-muted 2xl:table-cell`}>
                <ProductRefreshedLabel daysSinceRefresh={daysSinceRefresh} t={t} />
              </td>

              {/*
                Sized by content and never flex-shrunk. The price is `whitespace-nowrap`; when it
                was allowed to be squeezed, the overflow painted straight over the action buttons
                in Russian and English, where "драм"/"AMD" are wider than Armenian's "դր.".
              */}
              <td className={`${CELL} overflow-visible text-end`}>
                <ProductPriceEditor
                  product={product}
                  priceText={priceLabel(product)}
                  onCommit={onCommitPrice}
                  t={t}
                />
              </td>

              <td className={CELL}>
                <div className="flex justify-end">
                  <ProductRowActions
                    product={product}
                    onEdit={() => onEdit(product.id)}
                    onRefresh={() => onRefresh(product.id)}
                    onDelete={() => onDelete([product.id])}
                    justRefreshed={justRefreshedIds.has(product.id)}
                    t={t}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default ProductTable;
