import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaList, FaSlidersH, FaTh, FaTimes } from "react-icons/fa";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
import {
  PRODUCT_CATALOG,
  buildCatalogBreadcrumbJsonLd,
  buildCatalogItemListJsonLd,
  buildProductDescription,
} from "entities/product";
import { useFilterCatalogPresenter } from "features/filter-catalog";
import { useProductCompare } from "features/product-compare";
import { useLanguage } from "contexts";
import { formatPriceAmd } from "shared/lib/formatPriceAmd";
import { useLockBodyScroll } from "shared/lib/useLockBodyScroll";
import FilterProductCard from "shared/ui/filter-product-card/FilterProductCard";
import { LocalizedLink } from "shared/ui/link";
import { PageIntro } from "shared/ui/page-intro";

/** Cards in the first grid row at the widest breakpoint — above the fold, so eager. */
const FIRST_ROW_CARD_COUNT = 4;

const PAGE_LINK_IDLE =
  "inline-block rounded-lg border border-border-blue px-3 py-2 text-sm text-navy no-underline hover:bg-hover-blue";

/**
 * The heading stays outside the button: a heading nested in a button is not exposed as a
 * heading by assistive tech, which broke the sidebar's document outline.
 */
const SectionHead = ({ open, title, onToggle, panelId }) => (
  <h3 className="m-0">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={panelId}
      className="flex w-full items-center justify-between gap-2 border-0 bg-transparent py-2 text-start text-base font-semibold text-navy"
    >
      {title}
      <FaChevronDown
        className={`h-4 w-4 shrink-0 text-link-blue transition-transform ${open ? "rotate-180" : ""}`}
        aria-hidden
      />
    </button>
  </h3>
);

const wishlistMapFromStorage = () => {
  const ids = new Set(readAccountState().wishlistItems.map((x) => x.id));
  return Object.fromEntries([...ids].map((id) => [id, true]));
};

/** Grid/list toggle — identical between the mobile and desktop toolbars, so it lives once. */
const ViewModeToggle = ({ viewMode, onChange, gridAria, listAria, className = "" }) => (
  <div className={`flex shrink-0 gap-0.5 rounded-xl border border-border-blue bg-white p-1 ${className}`}>
    <button
      type="button"
      onClick={() => onChange("grid")}
      aria-pressed={viewMode === "grid"}
      aria-label={gridAria}
      className={`rounded-lg p-2.5 ${viewMode === "grid" ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}
    >
      <FaTh className="h-4 w-4" aria-hidden />
    </button>
    <button
      type="button"
      onClick={() => onChange("list")}
      aria-pressed={viewMode === "list"}
      aria-label={listAria}
      className={`rounded-lg p-2.5 ${viewMode === "list" ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}
    >
      <FaList className="h-4 w-4" aria-hidden />
    </button>
  </div>
);

const FilterCatalogWidget = () => {
  const {
    t,
    globalMin,
    globalMax,
    priceMin,
    priceMax,
    priceMinDraft,
    priceMaxDraft,
    setPriceMinDraft,
    setPriceMaxDraft,
    commitPriceMinDraft,
    commitPriceMaxDraft,
    onMinRangeChange,
    onMaxRangeChange,
    selectedScreens,
    selectedBrands,
    selectedStorage,
    selectedColor,
    selectedCategory,
    toggleScreen,
    toggleBrand,
    toggleStorage,
    setColor,
    search,
    onSearchChange,
    sort,
    onSortChange,
    viewMode,
    setViewMode,
    page,
    buildPageHref,
    pageSize,
    onPageSizeChange,
    sectionsOpen,
    toggleSection,
    brandExpanded,
    setBrandExpanded,
    screenOptions,
    screenCounts,
    brandOptions,
    brandCounts,
    visibleBrandOptions,
    storageOptions,
    storageCounts,
    colorOptions,
    sortOptions,
    pageSizeOptions,
    pageItems,
    totalPages,
    totalResults,
    activeFilterChips,
  } = useFilterCatalogPresenter();

  const { language } = useLanguage();

  /**
   * The page's own name — the selected category, or the generic catalog title. Used as the
   * visible H1 and as the ItemList's `name`, so the two can never disagree.
   */
  const pageHeading = selectedCategory
    ? t(`filterPage.categories.${selectedCategory}`, selectedCategory)
    : t("filterPage.pageTitle");

  /** Per-category keyword copy; the unfiltered catalog has none to show. */
  const categoryIntro = selectedCategory
    ? t(`seo.filterCategories.${selectedCategory}.intro`, "")
    : "";
  /** One currency word for the whole page — cards used to bake a hardcoded "AMD" into the data. */
  const currencySuffix = t("productDetail.currencySuffix");
  const catalogItemListJsonLd = useMemo(
    () =>
      buildCatalogItemListJsonLd({
        items: pageItems,
        language,
        page,
        pageSize,
        name: pageHeading,
        totalItems: totalResults,
      }),
    [pageItems, language, page, pageSize, pageHeading, totalResults],
  );

  const catalogBreadcrumbJsonLd = useMemo(
    () =>
      buildCatalogBreadcrumbJsonLd({
        language,
        homeLabel: t("footer.columns.primary.home"),
        catalogLabel: t("navPanel.catalogLabel"),
        categoryLabel: selectedCategory
          ? t(`filterPage.categories.${selectedCategory}`, selectedCategory)
          : undefined,
        categoryId: selectedCategory,
      }),
    [language, t, selectedCategory],
  );

  /**
   * Starts empty (matching the server, which has no `localStorage`) instead of reading
   * real wishlist state in the initializer — that would diverge from the SSR HTML on the
   * very first client render (React #418). `sync()` inside the mount effect below fills
   * in the real data right after hydration.
   */
  const [wishlist, setWishlist] = useState(() => ({}));
  /** Shared with the header badge and every other list — see `features/product-compare`. */
  const { compareIds, toggleCompare } = useProductCompare();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [overlayOptionQuery, setOverlayOptionQuery] = useState("");

  useEffect(() => {
    const sync = () => setWishlist(wishlistMapFromStorage());
    sync();
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  useLockBodyScroll(mobileFilterOpen);

  /** Escape closes the drawer and focus returns to the button that opened it. */
  useEffect(() => {
    if (!mobileFilterOpen) return undefined;
    const opener = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileFilterOpen(false);
        setOverlayOptionQuery("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (opener instanceof HTMLElement) {
        opener.focus();
      }
    };
  }, [mobileFilterOpen]);

  const closeMobileFilter = useCallback(() => {
    setMobileFilterOpen(false);
    setOverlayOptionQuery("");
  }, []);

  const toggleWishlist = useCallback((product) => {
    const full =
      PRODUCT_CATALOG.find((p) => p.id === product.id) ||
      (product.id && product.title
        ? {
            id: product.id,
            title: product.title,
            description: buildProductDescription(product, t),
            priceValue: product.priceValue,
            image: product.image,
            href: product.href,
            categoryId: product.categoryId,
          }
        : null);
    if (!full) return;
    toggleWishlistProduct({
      id: full.id,
      title: full.title,
      description: buildProductDescription(full, t),
      priceValue: full.priceValue,
      image: full.image,
      href: full.href,
      category: full.categoryId,
    });
    setWishlist(wishlistMapFromStorage());
  }, [t]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, page, page - 1, page + 1]);
    const sorted = [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < sorted.length; i += 1) {
      const n = sorted[i];
      if (i > 0 && n - sorted[i - 1] > 1) out.push("ellipsis");
      out.push(n);
    }
    return out;
  }, [page, totalPages]);

  const listMode = viewMode === "list";

  const overlayQueryLower = overlayOptionQuery.trim().toLowerCase();
  const brandOptionsForOverlay = useMemo(() => {
    if (!overlayQueryLower) return visibleBrandOptions;
    return visibleBrandOptions.filter((opt) =>
      opt.label.toLowerCase().includes(overlayQueryLower),
    );
  }, [visibleBrandOptions, overlayQueryLower]);

  /**
   * Every field below reads `text-base md:text-sm` rather than plain `text-sm`, and that is a
   * behaviour fix, not a type-scale preference: iOS Safari zooms the whole viewport when a
   * focused field's text is under 16px, and it does not zoom back out — the visitor is left on a
   * page wider than the screen, mid-filter, pinching their way back. `Header.css` already does
   * this for the site search; these seven controls were the ones still under the line. Desktop
   * keeps the compact size.
   */
  const renderFilterForm = (idSuffix) => (
    <>
      <div className="border-b border-border-blue/50 pb-2">
        <SectionHead
          open={sectionsOpen.price}
          title={t("filterPage.filters.price")}
          onToggle={() => toggleSection("price")}
          panelId={`filter-panel-price${idSuffix}`}
        />
        {sectionsOpen.price ? (
          <div id={`filter-panel-price${idSuffix}`} className="flex flex-col gap-4 pb-4 pt-1">
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`filter-price-min${idSuffix}`}>
                {t("filterPage.filters.priceMin")}
              </label>
              <input
                id={`filter-price-min${idSuffix}`}
                type="number"
                className="w-full min-w-0 rounded-lg border border-border-blue px-2 py-2 text-base text-navy md:text-sm"
                value={priceMinDraft}
                min={globalMin}
                max={globalMax}
                onChange={(e) => setPriceMinDraft(e.target.value)}
                onBlur={commitPriceMinDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPriceMinDraft();
                  }
                }}
              />
              <span className="text-text-muted">—</span>
              <label className="sr-only" htmlFor={`filter-price-max${idSuffix}`}>
                {t("filterPage.filters.priceMax")}
              </label>
              <input
                id={`filter-price-max${idSuffix}`}
                type="number"
                className="w-full min-w-0 rounded-lg border border-border-blue px-2 py-2 text-base text-navy md:text-sm"
                value={priceMaxDraft}
                min={globalMin}
                max={globalMax}
                onChange={(e) => setPriceMaxDraft(e.target.value)}
                onBlur={commitPriceMaxDraft}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitPriceMaxDraft();
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">{t("filterPage.filters.priceMin")}</span>
                <input
                  type="range"
                  className="h-6 w-full accent-navy"
                  min={globalMin}
                  max={priceMax}
                  value={priceMin}
                  aria-valuetext={formatPriceAmd(priceMin, currencySuffix)}
                  onChange={(e) => onMinRangeChange(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-text-muted">{t("filterPage.filters.priceMax")}</span>
                <input
                  type="range"
                  className="h-6 w-full accent-navy"
                  min={priceMin}
                  max={globalMax}
                  value={priceMax}
                  aria-valuetext={formatPriceAmd(priceMax, currencySuffix)}
                  onChange={(e) => onMaxRangeChange(e.target.value)}
                />
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-b border-border-blue/50 py-2">
        <SectionHead
          open={sectionsOpen.screen}
          title={t("filterPage.filters.screen")}
          onToggle={() => toggleSection("screen")}
          panelId={`filter-panel-screen${idSuffix}`}
        />
        {sectionsOpen.screen ? (
          <ul
            id={`filter-panel-screen${idSuffix}`}
            className="m-0 flex list-none flex-col gap-2 p-0 pb-3 pt-1"
          >
            {screenOptions.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-center gap-2 py-1 -my-1 text-sm text-navy">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-blue accent-navy"
                    checked={selectedScreens.has(opt.id)}
                    onChange={() => toggleScreen(opt.id)}
                  />
                  <span>
                    {opt.label} ({screenCounts[opt.id] ?? 0})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="border-b border-border-blue/50 py-2">
        <SectionHead
          open={sectionsOpen.brand}
          title={t("filterPage.filters.brandTitle")}
          onToggle={() => toggleSection("brand")}
          panelId={`filter-panel-brand${idSuffix}`}
        />
        {sectionsOpen.brand ? (
          <div id={`filter-panel-brand${idSuffix}`} className="pb-3 pt-1">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {brandOptionsForOverlay.map((opt) => (
                <li key={opt.id}>
                  <label className="flex cursor-pointer items-center gap-2 py-1 -my-1 text-sm text-navy">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border-blue accent-navy"
                      checked={selectedBrands.has(opt.id)}
                      onChange={() => toggleBrand(opt.id)}
                    />
                    <span>
                      {opt.label} ({brandCounts[opt.id] ?? 0})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {brandOptions.length > 4 ? (
              <button
                type="button"
                className="pt-2 text-sm font-medium text-link-blue hover:text-navy"
                onClick={() => setBrandExpanded((v) => !v)}
              >
                {brandExpanded ? t("filterPage.filters.seeLess") : t("filterPage.filters.seeMore")}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-b border-border-blue/50 py-2">
        <SectionHead
          open={sectionsOpen.storage}
          title={t("filterPage.filters.storage")}
          onToggle={() => toggleSection("storage")}
          panelId={`filter-panel-storage${idSuffix}`}
        />
        {sectionsOpen.storage ? (
          <ul
            id={`filter-panel-storage${idSuffix}`}
            className="m-0 flex list-none flex-col gap-2 p-0 pb-3 pt-1"
          >
            {storageOptions.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-center gap-2 py-1 -my-1 text-sm text-navy">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-blue accent-navy"
                    checked={selectedStorage.has(opt.id)}
                    onChange={() => toggleStorage(opt.id)}
                  />
                  <span>
                    {opt.label} ({storageCounts[opt.id] ?? 0})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="py-2">
        <SectionHead
          open={sectionsOpen.color}
          title={t("filterPage.filters.color")}
          onToggle={() => toggleSection("color")}
          panelId={`filter-panel-color${idSuffix}`}
        />
        {sectionsOpen.color ? (
          <div id={`filter-panel-color${idSuffix}`} className="flex flex-wrap gap-3 pb-2 pt-2">
            {colorOptions.map((opt) => {
              const selected = selectedColor === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColor(opt.id)}
                  className={`h-9 w-9 rounded-full border-2 shadow-sm transition ring-offset-2 ${
                    selected ? "border-navy ring-2 ring-navy" : "border-white ring-0"
                  }`}
                  style={{ backgroundColor: opt.hex }}
                  aria-pressed={selected}
                  aria-label={t(`filterPage.filters.colorNames.${opt.id}`, opt.id)}
                  title={t(`filterPage.filters.colorNames.${opt.id}`, opt.id)}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="cont-width-default mx-auto w-full max-w-[1600px] py-6 text-start md:py-8">
      {pageItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogItemListJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogBreadcrumbJsonLd) }}
      />
      {/**
       * Visible, and category-specific. This was `sr-only` and always read "Product catalog",
       * so all eight category landing pages presented the same discounted heading to a search
       * engine. The intro paragraph gives each one its own keyword-bearing copy.
       */}
      {/**
       * First thing on the page, so it cancels the shell's `main` top padding (`py-6 md:py-10`)
       * and sits directly under the category bar instead of behind a band of empty page.
       */}
      <PageIntro className="-mt-6 md:-mt-10" heading={pageHeading} body={categoryIntro} />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <aside
          className="hidden w-full shrink-0 rounded-2xl border border-border-blue/60 bg-white p-4 shadow-sm sm:p-5 lg:block lg:w-[300px] xl:w-[320px]"
          aria-label={t("filterPage.sidebarAriaLabel")}
        >
          <h2 className="sr-only">{t("filterPage.sidebarAriaLabel")}</h2>
          {renderFilterForm("")}
        </aside>

        <div className="min-w-0 flex-1">
          <h2 className="sr-only">{t("filterPage.resultsHeading")}</h2>
          <div
            className="mb-3 flex flex-col gap-3 lg:hidden"
            role="group"
            aria-label={t("filterPage.toolbarAriaLabel")}
          >
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border-blue bg-white text-navy shadow-sm"
                aria-label={t("filterPage.openFiltersAria")}
              >
                <FaSlidersH className="h-5 w-5" aria-hidden />
              </button>
              <label className="flex min-w-0 flex-1 flex-col justify-center text-sm text-navy">
                <span className="sr-only">{t("filterPage.sortLabel")}</span>
                <select
                  value={sort}
                  onChange={onSortChange}
                  title={t(sortOptions.find((o) => o.value === sort)?.labelKey)}
                  className="h-11 w-full min-w-0 truncate rounded-xl border border-border-blue bg-white px-3 text-base text-navy md:text-xs"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <ViewModeToggle
                viewMode={viewMode}
                onChange={setViewMode}
                gridAria={t("filterPage.viewGridAria")}
                listAria={t("filterPage.viewListAria")}
                className="shadow-sm"
              />
            </div>
            <input
              type="search"
              value={search}
              onChange={onSearchChange}
              placeholder={t("filterPage.searchPlaceholder")}
              aria-label={t("filterPage.searchPlaceholder")}
              className="h-11 w-full rounded-xl border border-border-blue px-4 text-base text-navy md:text-sm"
            />
          </div>

          <div
            className="mb-4 hidden flex-col gap-3 lg:flex"
            role="group"
            aria-label={t("filterPage.toolbarAriaLabel")}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="search"
                value={search}
                onChange={onSearchChange}
                placeholder={t("filterPage.searchPlaceholder")}
                aria-label={t("filterPage.searchPlaceholder")}
                className="h-11 w-full min-w-0 max-w-xl rounded-xl border border-border-blue px-4 text-sm text-navy"
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-navy">
                  <span className="whitespace-nowrap">{t("filterPage.sortLabel")}</span>
                  <select
                    value={sort}
                    onChange={onSortChange}
                    className="h-11 rounded-lg border border-border-blue bg-white px-3 text-base text-navy md:text-sm"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.labelKey)}
                      </option>
                    ))}
                  </select>
                </label>
                <ViewModeToggle
                  viewMode={viewMode}
                  onChange={setViewMode}
                  gridAria={t("filterPage.viewGridAria")}
                  listAria={t("filterPage.viewListAria")}
                />
              </div>
            </div>
          </div>

          {activeFilterChips.length > 0 ? (
            <div
              className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label={t("filterPage.activeChipsAria")}
            >
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-blue bg-[#eef2fc] px-3 py-1.5 text-sm font-medium text-navy"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.remove}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-navy hover:bg-white/80"
                    aria-label={t("filterPage.removeChipAria")}
                  >
                    <FaTimes className="h-3 w-3" aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          {totalResults === 0 ? (
            <p className="py-12 text-center text-text-muted" role="status">
              {t("filterPage.empty")}
            </p>
          ) : (
            <>
              <div
                className={
                  listMode
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6"
                }
              >
                {pageItems.map((product, index) => (
                  <FilterProductCard
                    key={product.id}
                    eager={index < FIRST_ROW_CARD_COUNT}
                    lcp={index === 0}
                    product={product}
                    priceLabel={formatPriceAmd(product.priceValue, currencySuffix)}
                    descriptionText={buildProductDescription(product, t)}
                    listMode={listMode}
                    inCompare={compareIds.has(product.id)}
                    inWishlist={Boolean(wishlist[product.id])}
                    onToggleCompare={toggleCompare}
                    onToggleWishlist={toggleWishlist}
                    compareAria={t("relatedProducts.compareAriaLabel")}
                    wishlistAria={t("relatedProducts.wishlistAriaLabel")}
                  />
                ))}
              </div>

              {/* Real links, so pages beyond the first are reachable and shareable. */}
              <nav
                className="flex flex-col flex-wrap items-center justify-center gap-4 border-t border-border-blue/60 pt-8 sm:flex-row sm:gap-6"
                aria-label={t("filterPage.pagination.navAria")}
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {page > 1 ? (
                    <LocalizedLink
                      to={buildPageHref(page - 1)}
                      rel="prev"
                      className={PAGE_LINK_IDLE}
                      aria-label={t("filterPage.pagination.prevAria")}
                    >
                      ‹
                    </LocalizedLink>
                  ) : (
                    <span className={`${PAGE_LINK_IDLE} opacity-40`} aria-hidden="true">
                      ‹
                    </span>
                  )}
                  {pageNumbers.map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-1 text-text-muted">
                        …
                      </span>
                    ) : (
                      <LocalizedLink
                        key={item}
                        to={buildPageHref(item)}
                        className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-center text-sm font-semibold no-underline ${
                          page === item
                            ? "border border-navy bg-navy text-white shadow-sm"
                            : "border border-border-blue text-navy hover:bg-hover-blue"
                        }`}
                        aria-label={t("filterPage.pagination.goToPage").replace(
                          "{{n}}",
                          String(item),
                        )}
                        aria-current={page === item ? "page" : undefined}
                      >
                        {item}
                      </LocalizedLink>
                    ),
                  )}
                  {page < totalPages ? (
                    <LocalizedLink
                      to={buildPageHref(page + 1)}
                      rel="next"
                      className={PAGE_LINK_IDLE}
                      aria-label={t("filterPage.pagination.nextAria")}
                    >
                      ›
                    </LocalizedLink>
                  ) : (
                    <span className={`${PAGE_LINK_IDLE} opacity-40`} aria-hidden="true">
                      ›
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm text-navy">
                  <span>{t("filterPage.pagination.showLabel")}:</span>
                  <select
                    value={pageSize}
                    onChange={onPageSizeChange}
                    className="rounded-lg border border-border-blue bg-white px-2 py-2 text-base md:text-sm"
                  >
                    {pageSizeOptions.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </nav>
            </>
          )}
        </div>
      </div>

      {mobileFilterOpen ? (
        <div
          className="fixed inset-0 z-[80] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filter-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label={t("filterPage.closeOverlay")}
            onClick={closeMobileFilter}
          />
          <div className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-blue/60 px-4 py-3">
              <h2 id="mobile-filter-title" className="m-0 text-lg font-bold text-navy">
                {t("filterPage.mobileOverlayTitle")}
              </h2>
              <button
                type="button"
                onClick={closeMobileFilter}
                className="flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-gray-100"
                aria-label={t("filterPage.closeOverlay")}
              >
                <FaTimes className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="border-b border-border-blue/40 px-4 py-3">
              {/* A placeholder is not an accessible name — it disappears the moment you type. */}
              <input
                type="search"
                value={overlayOptionQuery}
                onChange={(e) => setOverlayOptionQuery(e.target.value)}
                placeholder={t("filterPage.overlaySearchPlaceholder")}
                aria-label={t("filterPage.overlaySearchPlaceholder")}
                className="h-11 w-full rounded-xl border border-border-blue px-4 text-base text-navy md:text-sm"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {renderFilterForm("-drawer")}
            </div>
            <div className="border-t border-border-blue/60 p-3">
              <button
                type="button"
                onClick={closeMobileFilter}
                className="h-12 w-full rounded-xl bg-navy text-sm font-semibold text-white transition hover:opacity-95"
              >
                {t("filterPage.applyFilters")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FilterCatalogWidget;
