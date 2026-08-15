import { useCallback } from "react";
import { FaInfoCircle, FaSyncAlt } from "react-icons/fa";
import {
  SHOP_PRODUCT_STALE_DAYS,
  SHOP_PRODUCT_STOCK_FILTERS,
  needsShopProductRefresh,
} from "entities/shop";
import { useShopProductsPresenter } from "features/shop-account";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { BUTTON_SECONDARY, FOCUS_RING, SURFACE_RAISED, TONE } from "../sellerUi";
import { ProductBulkBar } from "./ProductBulkBar";
import { ProductCardList } from "./ProductCardList";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductForm } from "./ProductForm";
import { ProductTable } from "./ProductTable";
import { ProductToolbar } from "./ProductToolbar";

/**
 * The product management workspace: header, attention layer, toolbar, list, bulk actions.
 *
 * It answers, top to bottom, the questions a seller opens this page with — how many listings do
 * I have and how are they doing, does anything need me today, where is the one I came for, and
 * what can I do to it (§9). The old section answered only the last of those, and answered it
 * with a full-width navy "Add" bar as the loudest element on a page about listings that already
 * exist (§10).
 *
 * Composition, not a god component: this file owns the arrangement and the copy that ties the
 * parts together; the toolbar, the table, the card list, the bulk bar, the form and the empty
 * states are each their own component, and none of them knows about `localStorage`.
 */
export const ShopProductsSection = ({
  t,
  products,
  showProductForm,
  editingProductId,
  productDraft,
  formErrorKey,
  catalogProductsForDraft,
  selectedCatalogProduct,
  openProductForm,
  openProductEdit,
  cancelProductForm,
  submitProductForm,
  updateProductPrice,
  selectProductCategory,
  selectCatalogProduct,
  setProductAvailability,
  toggleProductMemory,
  toggleProductColor,
  refreshShopProduct,
  refreshShopProducts,
  justRefreshedIds,
  updateShopProductPrice,
  requestDeleteProducts,
}) => {
  const list = useShopProductsPresenter({ products });

  const priceLabel = useCallback(
    (product) => {
      /** The visitor's own currency word, never a hardcoded "AMD" the dictionary never localized. */
      const suffix = t("productDetail.currencySuffix");
      const raw = typeof product.price === "string" ? product.price.trim() : "";
      if (raw) return `${raw} ${suffix}`;
      return formatPriceAmd(product.priceAmd, suffix) || "—";
    },
    [t],
  );

  const { summary } = list;
  const hasProducts = summary.total > 0;
  const selectedCount = list.selectedMatchedIds.length;
  const allMatchedSelected =
    list.matchedIds.length > 0 && list.matchedIds.every((id) => list.selectedIds.has(id));

  const refreshExpiring = () =>
    refreshShopProducts(
      products
        .filter((product) => needsShopProductRefresh(product, list.nowMs ?? 0))
        .map((product) => product.id),
    );

  /**
   * No separate "62 listings · 47 in stock · 15 out of stock" line: the filter tabs below carry
   * those four numbers already, and there they are also the control that acts on them. A count
   * printed twice is a count that can disagree with itself (§11, §64).
   */
  return (
    <section className="flex flex-col gap-4" aria-labelledby="shop-account-page-heading">
      {/*
        The shop's one automatic behaviour, stated once and escalating rather than repeated: a
        quiet line while nothing is at risk, an amber panel with the count and the fix when
        something is. Both quote the same `SHOP_PRODUCT_STALE_DAYS` the pruner enforces, so the
        copy cannot drift from the rule (§12).
      */}
      {hasProducts ? (
        summary.needsRefresh > 0 ? (
          <div
            className={`flex flex-col gap-3 rounded-[12px] border border-[#f3d9a4] ${TONE.warning.fill} px-4 py-3 sm:flex-row sm:items-center`}
          >
            <p className={`m-0 min-w-0 flex-1 text-sm font-medium leading-snug ${TONE.warning.text}`}>
              {t("shopAccount.products.attention.body")
                .replace("{{count}}", String(summary.needsRefresh))
                .replace("{{days}}", String(SHOP_PRODUCT_STALE_DAYS))}
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  list.setStockFilter(SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH)
                }
                className={`rounded-[10px] border border-[#d9b775] bg-white/70 px-3 py-2 text-sm font-semibold text-[#92400e] transition hover:bg-white ${FOCUS_RING}`}
              >
                {t("shopAccount.products.attention.show")}
              </button>
              <button type="button" onClick={refreshExpiring} className={BUTTON_SECONDARY}>
                <FaSyncAlt className="h-3 w-3" aria-hidden="true" />
                {t("shopAccount.products.attention.refreshAll")}
              </button>
            </div>
          </div>
        ) : (
          <p className="m-0 flex items-start gap-2 text-xs leading-relaxed text-text-muted">
            <FaInfoCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            {t("shopAccount.products.staleHint").replace(
              "{{days}}",
              String(SHOP_PRODUCT_STALE_DAYS),
            )}
          </p>
        )
      ) : null}

      <div className={`${SURFACE_RAISED} min-w-0 overflow-visible`}>
        {hasProducts ? (
          <div className="border-b border-[#eef1f6] px-4 py-4 sm:px-5 md:px-6">
            <ProductToolbar
              t={t}
              query={list.query}
              onQueryChange={list.setQuery}
              stockFilter={list.stockFilter}
              onStockFilterChange={list.setStockFilter}
              categoryId={list.categoryId}
              onCategoryChange={list.setCategoryId}
              categoryIdsInUse={list.categoryIdsInUse}
              sort={list.sort}
              onSortChange={list.setSort}
              summary={summary}
              matchedCount={list.matchedCount}
              hasActiveFilters={list.hasActiveFilters}
              onResetFilters={list.resetFilters}
            />
          </div>
        ) : null}

        {showProductForm ? (
          <ProductForm
            t={t}
            isEditing={Boolean(editingProductId)}
            draft={productDraft}
            errorKey={formErrorKey}
            catalogProducts={catalogProductsForDraft}
            selectedCatalogProduct={selectedCatalogProduct}
            onSubmit={submitProductForm}
            onCancel={cancelProductForm}
            onCategoryChange={selectProductCategory}
            onCatalogProductChange={selectCatalogProduct}
            onPriceChange={updateProductPrice}
            onAvailabilityChange={setProductAvailability}
            onToggleMemory={toggleProductMemory}
            onToggleColor={toggleProductColor}
          />
        ) : null}

        {!hasProducts ? (
          showProductForm ? null : (
            <ProductEmptyState t={t} variant="empty" onAddProduct={openProductForm} />
          )
        ) : list.matchedCount === 0 ? (
          <ProductEmptyState t={t} variant="filtered" onResetFilters={list.resetFilters} />
        ) : (
          <>
            <ProductTable
              t={t}
              rows={list.rows}
              priceLabel={priceLabel}
              selectedIds={list.selectedIds}
              onToggleSelected={list.toggleSelected}
              onToggleSelectAll={list.toggleSelectAllMatched}
              allMatchedSelected={allMatchedSelected}
              someMatchedSelected={selectedCount > 0}
              justRefreshedIds={justRefreshedIds}
              onEdit={openProductEdit}
              onRefresh={refreshShopProduct}
              onDelete={requestDeleteProducts}
              onCommitPrice={updateShopProductPrice}
            />
            <ProductCardList
              t={t}
              rows={list.rows}
              priceLabel={priceLabel}
              selectedIds={list.selectedIds}
              onToggleSelected={list.toggleSelected}
              justRefreshedIds={justRefreshedIds}
              onEdit={openProductEdit}
              onRefresh={refreshShopProduct}
              onDelete={requestDeleteProducts}
              onCommitPrice={updateShopProductPrice}
            />

            {list.hiddenCount > 0 ? (
              <div className="border-t border-[#eef1f6] px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={list.showMore}
                  className={`${BUTTON_SECONDARY} w-full sm:w-auto`}
                >
                  {t("shopAccount.products.showMore").replace(
                    "{{count}}",
                    String(list.hiddenCount),
                  )}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <ProductBulkBar
        t={t}
        count={selectedCount}
        onRefresh={() => refreshShopProducts(list.selectedMatchedIds)}
        onDelete={() => requestDeleteProducts(list.selectedMatchedIds)}
        onClear={list.clearSelection}
      />
    </section>
  );
};

export default ShopProductsSection;
