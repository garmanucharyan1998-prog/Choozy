import { useId } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import {
  getShopCategoryLabelKey,
  SHOP_PRODUCT_SORT_ORDER,
  SHOP_PRODUCT_STOCK_FILTERS,
  SHOP_PRODUCT_STOCK_FILTER_ORDER,
} from "entities/shop";
import { Select } from "shared/ui/select";
import { BUTTON_GHOST, FOCUS_RING, TONE } from "../sellerUi";

/**
 * Find, narrow, order — the three things a seller does before they touch a listing.
 *
 * The dashboard had none of them. Sixty-two rows in one fixed "newest first" list meant every
 * visit to a specific product was a scroll and a scan, and the four numbers a seller actually
 * runs their day on (how many listings, how many sellable, how many not, how many about to
 * expire) were nowhere on the page (§9, §24–26).
 *
 * The counts and the filters are the same control, following the index-table pattern common to
 * marketplace back offices: a metric that cannot be acted on is decoration, and a filter with
 * no count is a guess. `NEEDS_REFRESH` is the one that matters most here, because that is the
 * shop's only self-inflicted way to lose a listing.
 *
 * Buttons with `aria-pressed` inside a labelled group, not a `tablist` — they filter one list
 * in place rather than swapping panels, and this is the pattern the rest of this app already
 * uses for the same job.
 */
const STOCK_FILTER_LABEL_KEYS = {
  [SHOP_PRODUCT_STOCK_FILTERS.ALL]: "shopAccount.products.filters.all",
  [SHOP_PRODUCT_STOCK_FILTERS.IN_STOCK]: "shopAccount.products.filters.inStock",
  [SHOP_PRODUCT_STOCK_FILTERS.OUT_OF_STOCK]: "shopAccount.products.filters.outOfStock",
  [SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH]: "shopAccount.products.filters.needsRefresh",
};

const countFor = (filterId, summary) => {
  switch (filterId) {
    case SHOP_PRODUCT_STOCK_FILTERS.IN_STOCK:
      return summary.inStock;
    case SHOP_PRODUCT_STOCK_FILTERS.OUT_OF_STOCK:
      return summary.outOfStock;
    case SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH:
      return summary.needsRefresh;
    default:
      return summary.total;
  }
};

export const ProductToolbar = ({
  t,
  query,
  onQueryChange,
  stockFilter,
  onStockFilterChange,
  categoryId,
  onCategoryChange,
  categoryIdsInUse,
  sort,
  onSortChange,
  summary,
  matchedCount,
  hasActiveFilters,
  onResetFilters,
}) => {
  const searchId = useId();

  const categoryOptions = [
    { value: "", label: t("shopAccount.products.filters.allCategories") },
    ...categoryIdsInUse.map((id) => ({ value: id, label: t(getShopCategoryLabelKey(id)) })),
  ];

  const sortOptions = SHOP_PRODUCT_SORT_ORDER.map((id) => ({
    value: id,
    label: t(`shopAccount.products.sort.${id}`),
  }));

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label={t("shopAccount.products.filters.groupAria")}
        className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SHOP_PRODUCT_STOCK_FILTER_ORDER.map((filterId) => {
          const active = stockFilter === filterId;
          const count = countFor(filterId, summary);
          const urgent = filterId === SHOP_PRODUCT_STOCK_FILTERS.NEEDS_REFRESH && count > 0;
          return (
            <button
              key={filterId}
              type="button"
              aria-pressed={active}
              onClick={() => onStockFilterChange(filterId)}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] border px-3 py-2 text-sm font-semibold transition ${FOCUS_RING} ${
                active
                  ? "border-navy bg-navy text-white"
                  : "border-[#e1e6ef] bg-white text-text-muted hover:border-link-blue hover:text-navy"
              }`}
            >
              {t(STOCK_FILTER_LABEL_KEYS[filterId])}
              <span
                className={`rounded px-1.5 text-xs font-bold tabular-nums ${
                  active
                    ? "bg-white/15 text-white"
                    : urgent
                      ? `${TONE.warning.fill} ${TONE.warning.text}`
                      : "bg-[#f1f3f6] text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/*
        Search on its own line and the two menus sharing the next one below `sm`: stacking all
        three put 150px of controls between the seller and their first listing on a phone.
      */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
        <div className="relative col-span-2 min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            {t("shopAccount.products.searchLabel")}
          </label>
          <FaSearch
            className="pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("shopAccount.products.searchPlaceholder")}
            /**
             * 16px on the smallest screens: iOS Safari zooms the whole page in when a focused
             * field's text is smaller, and a seller who taps search should not have to pinch
             * their way back out.
             *
             * The WebKit cancel button is suppressed because this field already has a clear
             * button of its own — one that is the right size, keeps the app's focus ring, and
             * carries a name. Both drawn at once put two × glyphs side by side in the field.
             */
            className={`box-border h-10 w-full appearance-none rounded-[10px] border border-[#b8c8e8] bg-white ps-9 pe-9 text-base text-text-dark outline-none transition placeholder:text-text-muted focus:border-active-blue focus:ring-2 focus:ring-accent-blue/40 sm:text-sm [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none ${FOCUS_RING}`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label={t("shopAccount.products.searchClear")}
              className={`absolute end-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-text-muted transition hover:bg-[#f1f3f6] hover:text-navy ${FOCUS_RING}`}
            >
              <FaTimes className="h-3 w-3" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {categoryIdsInUse.length > 1 ? (
          <Select
            value={categoryId}
            onChange={onCategoryChange}
            options={categoryOptions}
            size="sm"
            ariaLabel={t("shopAccount.products.filters.categoryAria")}
            className="sm:w-44 sm:shrink-0"
          />
        ) : null}

        <Select
          value={sort}
          onChange={onSortChange}
          options={sortOptions}
          size="sm"
          ariaLabel={t("shopAccount.products.sort.aria")}
          className={
            categoryIdsInUse.length > 1 ? "sm:w-52 sm:shrink-0" : "col-span-2 sm:w-52 sm:shrink-0"
          }
        />
      </div>

      {/*
        The live region is mounted whether or not anything is filtered, and empty when nothing
        is: a `role="status"` that appears together with its text is not reliably announced,
        which would leave a screen-reader user typing into a search box with no idea how many
        listings are left.
      */}
      <div
        role="status"
        aria-live="polite"
        /**
         * `-mt-3` when there is nothing to say cancels the parent's `gap-3`, so an always-mounted
         * empty region costs no space. `hidden` would have been simpler and wrong — see above.
         */
        className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${hasActiveFilters ? "" : "-mt-3"}`}
      >
        {hasActiveFilters ? (
          <>
            <p className="m-0 text-xs text-text-muted">
              {t("shopAccount.products.filters.resultCount")
                .replace("{{count}}", String(matchedCount))
                .replace("{{total}}", String(summary.total))}
            </p>
            <button type="button" onClick={onResetFilters} className={`${BUTTON_GHOST} px-2 py-1`}>
              {t("shopAccount.products.filters.reset")}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProductToolbar;
