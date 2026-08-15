import { FaBoxOpen, FaPlus, FaSearch } from "react-icons/fa";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "../sellerUi";

/**
 * The two ways a seller reaches an empty list, told apart — because the answer is different.
 *
 * A shop with no listings needs to know what this section is for and how to start; the old
 * dashboard offered one grey sentence ("no products yet") and left the seller to find the add
 * button on their own (§28). A shop whose *filters* match nothing needs the opposite: its
 * listings are all still there, and the useful action is to widen the search, not to create
 * another product.
 */
export const ProductEmptyState = ({ t, variant, onAddProduct, onResetFilters }) => {
  const filtered = variant === "filtered";
  const Icon = filtered ? FaSearch : FaBoxOpen;

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center md:py-14">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef1f6] text-navy/50"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="m-0 text-base font-bold text-navy">
        {filtered
          ? t("shopAccount.products.empty.filteredTitle")
          : t("shopAccount.products.empty.title")}
      </h3>
      <p className="m-0 max-w-md text-sm leading-relaxed text-text-muted">
        {filtered ? t("shopAccount.products.empty.filteredBody") : t("shopAccount.products.empty.body")}
      </p>
      {filtered ? (
        <button type="button" onClick={onResetFilters} className={`${BUTTON_SECONDARY} mt-1`}>
          {t("shopAccount.products.filters.reset")}
        </button>
      ) : (
        <button type="button" onClick={onAddProduct} className={`${BUTTON_PRIMARY} mt-1`}>
          <FaPlus className="h-3 w-3" aria-hidden="true" />
          {t("shopAccount.products.addProduct")}
        </button>
      )}
    </div>
  );
};

export default ProductEmptyState;
