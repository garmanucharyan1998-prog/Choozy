import { useEffect, useRef } from "react";
import { FaExclamationCircle, FaTimes } from "react-icons/fa";
import {
  getShopCategoryLabelKey,
  resolveShopColorLabel,
  resolveShopMemoryLabel,
  SHOP_COLOR_OPTIONS,
  SHOP_MEMORY_OPTIONS,
  SHOP_PRODUCT_CATEGORY_IDS,
} from "entities/shop";
import { ProductCardImage } from "shared/ui/product-card-image";
import { Select } from "shared/ui/select";
import { BUTTON_PRIMARY, FIELD, FOCUS_RING, SUBTLE_FILL } from "../sellerUi";
import { isLightSwatch } from "./ProductColorSwatches";
import { ProductOptionGrid } from "./ProductOptionGrid";

/**
 * Adding and editing a listing.
 *
 * Three things about it changed, all of them about where the seller's attention is:
 *
 *  - **It scrolls itself into view and takes focus.** Editing the fortieth listing used to open
 *    a form at the top of a page the seller was nowhere near, with no indication anything had
 *    happened. The heading is focusable and focused on open, which also tells a screen reader
 *    that a form appeared and what it is for.
 *  - **Rejected input is reported inside the form**, next to the button that will not submit —
 *    not in the page-level status panel above a list the seller has already scrolled past (§30).
 *  - **The option grids collapse** (see `ProductOptionGrid`). Every configuration and colour the
 *    shop knows about used to be painted at once; picking two of them meant scrolling past
 *    eighty chips.
 *
 * The fields themselves are unchanged: category and product come from the catalog, only the
 * price is typed, and the photo is the catalog's. That is the existing business rule, not a
 * limitation introduced here.
 */
export const ProductForm = ({
  t,
  isEditing,
  draft,
  errorKey,
  catalogProducts,
  selectedCatalogProduct,
  onSubmit,
  onCancel,
  onCategoryChange,
  onCatalogProductChange,
  onPriceChange,
  onAvailabilityChange,
  onToggleMemory,
  onToggleColor,
}) => {
  const headingRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    formRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, [isEditing]);

  const labelClass = "flex min-w-0 flex-col gap-1.5 text-start text-sm font-semibold text-navy";

  return (
    <form
      ref={formRef}
      className={`flex flex-col gap-5 border-b border-[#e1e6ef] ${SUBTLE_FILL} px-4 py-4 sm:px-5 sm:py-5 md:px-6`}
      onSubmit={onSubmit}
      aria-labelledby="shop-product-form-heading"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            id="shop-product-form-heading"
            ref={headingRef}
            tabIndex={-1}
            className="m-0 text-base font-bold text-navy outline-none"
          >
            {isEditing
              ? t("shopAccount.products.editFormTitle")
              : t("shopAccount.products.formTitle")}
          </h3>
          <p className="m-0 pt-1 text-sm leading-relaxed text-text-muted">
            {t("shopAccount.products.formHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label={t("shopAccount.products.cancel")}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-white hover:text-navy ${FOCUS_RING}`}
        >
          <FaTimes className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className={`${labelClass} md:col-span-2`}>
          <span>{t("shopAccount.products.fields.category")}</span>
          <Select
            value={draft.categoryId}
            onChange={onCategoryChange}
            placeholder={t("shopAccount.products.placeholders.category")}
            options={SHOP_PRODUCT_CATEGORY_IDS.map((categoryId) => ({
              value: categoryId,
              label: t(getShopCategoryLabelKey(categoryId)),
            }))}
            required
          />
        </label>

        <label className={`${labelClass} md:col-span-2`}>
          <span>{t("shopAccount.products.fields.title")}</span>
          <Select
            value={draft.catalogProductId}
            onChange={onCatalogProductChange}
            placeholder={
              draft.categoryId
                ? t("shopAccount.products.placeholders.product")
                : t("shopAccount.products.placeholders.productAfterCategory")
            }
            options={catalogProducts.map((product) => ({
              value: product.id,
              label: product.title,
            }))}
            required
            disabled={!draft.categoryId}
          />
          {draft.categoryId && catalogProducts.length === 0 ? (
            <span className="text-xs font-normal text-text-muted">
              {t("shopAccount.products.noProductsInCategory")}
            </span>
          ) : null}
        </label>

        <label className={labelClass}>
          <span>{t("shopAccount.products.fields.price")}</span>
          <input
            name="price"
            value={draft.price}
            onChange={onPriceChange}
            className={FIELD}
            inputMode="numeric"
            autoComplete="off"
            required
          />
        </label>

        <label className={labelClass}>
          <span>{t("shopAccount.products.fields.availability")}</span>
          <Select
            value={draft.availability}
            onChange={onAvailabilityChange}
            options={[
              { value: "in_stock", label: t("shopAccount.products.availabilityOptions.inStock") },
              {
                value: "out_of_stock",
                label: t("shopAccount.products.availabilityOptions.outOfStock"),
              },
            ]}
          />
        </label>
      </div>

      {selectedCatalogProduct?.image ? (
        <div className="flex items-center gap-3">
          <div className="w-16 shrink-0 overflow-hidden rounded-lg border border-[#e1e6ef] bg-white">
            <ProductCardImage
              variant="compare"
              src={selectedCatalogProduct.image}
              alt={selectedCatalogProduct.title}
            />
          </div>
          <p className="m-0 text-xs leading-relaxed text-text-muted">
            {t("shopAccount.products.catalogImageNote")}
          </p>
        </div>
      ) : null}

      <div className="min-w-0">
        <h4 className="mb-2 text-sm font-semibold text-navy">
          {t("shopAccount.products.fields.memories")}
        </h4>
        <ProductOptionGrid
          t={t}
          options={SHOP_MEMORY_OPTIONS}
          selectedIds={draft.selectedMemoryIds}
          onToggle={onToggleMemory}
          groupLabel={t("shopAccount.products.fields.memories")}
          renderOption={(option, selected, toggle) => (
            <button
              key={option.id}
              type="button"
              onClick={toggle}
              aria-pressed={selected}
              className={`max-w-full rounded-md border px-2.5 py-1.5 text-xs font-medium leading-tight transition sm:px-3 sm:py-2 sm:text-sm ${FOCUS_RING} ${
                selected
                  ? "border-navy bg-[#eef3ff] text-navy"
                  : "border-[#b8c8e8] bg-white text-text-dark hover:border-link-blue"
              }`}
            >
              {resolveShopMemoryLabel(option, t)}
            </button>
          )}
        />
      </div>

      <div className="min-w-0">
        <h4 className="mb-2 text-sm font-semibold text-navy">
          {t("shopAccount.products.fields.colors")}
        </h4>
        <ProductOptionGrid
          t={t}
          options={SHOP_COLOR_OPTIONS}
          selectedIds={draft.selectedColorIds}
          onToggle={onToggleColor}
          groupLabel={t("shopAccount.products.fields.colors")}
          columnsClassName="grid grid-cols-2 gap-2 min-[425px]:grid-cols-3 lg:grid-cols-4"
          renderOption={(option, selected, toggle) => {
            const label = resolveShopColorLabel(option, t);
            return (
              <button
                key={option.id}
                type="button"
                onClick={toggle}
                aria-pressed={selected}
                title={label}
                className={`flex min-w-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition ${FOCUS_RING} ${
                  selected
                    ? "border-navy bg-[#eef3ff]"
                    : "border-[#e1e6ef] bg-white hover:border-link-blue"
                }`}
              >
                <span
                  className={`h-5 w-5 shrink-0 rounded-full ${
                    isLightSwatch(option.hex) ? "border border-[#cbd5e1]" : "border border-black/10"
                  }`}
                  style={{ backgroundColor: option.hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate text-text-dark">{label}</span>
              </button>
            );
          }}
        />
      </div>

      {errorKey ? (
        <p
          role="alert"
          className="m-0 flex items-center gap-2 rounded-[10px] border border-[#f5c2c2] bg-[#fef2f2] px-3 py-2 text-sm font-medium text-[#991b1b]"
        >
          <FaExclamationCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t(errorKey)}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={`rounded-[10px] px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-white hover:text-navy ${FOCUS_RING}`}
        >
          {t("shopAccount.products.cancel")}
        </button>
        <button type="submit" className={BUTTON_PRIMARY}>
          {t("shopAccount.products.save")}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
