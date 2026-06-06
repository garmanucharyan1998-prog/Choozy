import { useCallback, useEffect, useMemo, useState } from "react";
import { FaChevronDown, FaList, FaSlidersH, FaTh, FaTimes } from "react-icons/fa";
import { BRAND_OPTIONS } from "entities/filter-catalog";
import { mockFilterProducts } from "entities/filter-catalog/model/mockFilterProducts";
import { ACCOUNT_STORAGE_EVENT, readAccountState, toggleWishlistProduct } from "entities/user";
import { useFilterCatalogPresenter } from "features/filter-catalog";
import FilterProductCard from "shared/ui/filter-product-card/FilterProductCard";

const SectionHead = ({ open, title, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex w-full items-center justify-between gap-2 border-0 bg-transparent py-2 text-start text-base font-semibold text-navy"
  >
    <span>{title}</span>
    <FaChevronDown className={`h-4 w-4 shrink-0 text-link-blue transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
  </button>
);

const wishlistMapFromStorage = () => {
  const ids = new Set(readAccountState().wishlistItems.map((x) => x.id));
  return Object.fromEntries([...ids].map((id) => [id, true]));
};

const FilterCatalogWidget = () => {
  const {
    t,
    globalMin,
    globalMax,
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    onMinRangeChange,
    onMaxRangeChange,
    selectedScreens,
    selectedBrands,
    selectedRam,
    selectedColor,
    toggleScreen,
    toggleBrand,
    toggleRam,
    setColor,
    search,
    onSearchChange,
    sort,
    onSortChange,
    viewMode,
    setViewMode,
    page,
    setPage,
    pageSize,
    onPageSizeChange,
    sectionsOpen,
    toggleSection,
    brandExpanded,
    setBrandExpanded,
    screenOptions,
    screenCounts,
    brandCounts,
    visibleBrandOptions,
    ramOptions,
    ramCounts,
    colorOptions,
    sortOptions,
    pageSizeOptions,
    pageItems,
    totalPages,
    totalResults,
    activeFilterChips,
  } = useFilterCatalogPresenter();

  const [wishlist, setWishlist] = useState(wishlistMapFromStorage);
  const [compare, setCompare] = useState(() => ({}));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [overlayOptionQuery, setOverlayOptionQuery] = useState("");

  useEffect(() => {
    const sync = () => setWishlist(wishlistMapFromStorage());
    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!mobileFilterOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileFilterOpen]);

  const closeMobileFilter = useCallback(() => {
    setMobileFilterOpen(false);
    setOverlayOptionQuery("");
  }, []);

  const toggleWishlist = useCallback((product) => {
    const full =
      mockFilterProducts.find((p) => p.id === product.id) ||
      (product.id && product.title
        ? {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            image: product.image,
            href: product.href,
          }
        : null);
    if (!full) return;
    toggleWishlistProduct({
      id: full.id,
      title: full.title,
      description: full.description,
      price: full.price,
      image: full.image,
      href: full.href,
    });
    setWishlist(wishlistMapFromStorage());
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompare((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

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
    return visibleBrandOptions.filter((opt) => t(opt.labelKey).toLowerCase().includes(overlayQueryLower));
  }, [visibleBrandOptions, overlayQueryLower, t]);

  const renderFilterForm = (idSuffix) => (
    <>
      <div className="border-b border-border-blue/50 pb-2">
        <SectionHead
          open={sectionsOpen.price}
          title={t("filterPage.filters.price")}
          onToggle={() => toggleSection("price")}
        />
        {sectionsOpen.price ? (
          <div className="pb-4 pt-1">
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor={`filter-price-min${idSuffix}`}>
                {t("filterPage.filters.priceMin")}
              </label>
              <input
                id={`filter-price-min${idSuffix}`}
                type="number"
                className="w-full min-w-0 rounded-lg border border-border-blue px-2 py-2 text-sm text-navy"
                value={priceMin}
                min={globalMin}
                max={globalMax}
                onChange={(e) => setPriceMin(e.target.value)}
              />
              <span className="text-text-muted">—</span>
              <label className="sr-only" htmlFor={`filter-price-max${idSuffix}`}>
                {t("filterPage.filters.priceMax")}
              </label>
              <input
                id={`filter-price-max${idSuffix}`}
                type="number"
                className="w-full min-w-0 rounded-lg border border-border-blue px-2 py-2 text-sm text-navy"
                value={priceMax}
                min={globalMin}
                max={globalMax}
                onChange={(e) => setPriceMax(e.target.value)}
              />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <span className="text-xs text-text-muted">{t("filterPage.filters.priceMin")}</span>
                <input
                  type="range"
                  className="mt-1 w-full accent-navy"
                  min={globalMin}
                  max={priceMax}
                  value={priceMin}
                  onChange={(e) => onMinRangeChange(e.target.value)}
                />
              </div>
              <div>
                <span className="text-xs text-text-muted">{t("filterPage.filters.priceMax")}</span>
                <input
                  type="range"
                  className="mt-1 w-full accent-navy"
                  min={priceMin}
                  max={globalMax}
                  value={priceMax}
                  onChange={(e) => onMaxRangeChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-b border-border-blue/50 py-2">
        <SectionHead
          open={sectionsOpen.screen}
          title={t("filterPage.filters.screen")}
          onToggle={() => toggleSection("screen")}
        />
        {sectionsOpen.screen ? (
          <ul className="m-0 list-none space-y-2 p-0 pb-3 pt-1">
            {screenOptions.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-blue accent-navy"
                    checked={selectedScreens.has(opt.id)}
                    onChange={() => toggleScreen(opt.id)}
                  />
                  <span>
                    {t(opt.labelKey)} ({screenCounts[opt.id] ?? 0})
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
        />
        {sectionsOpen.brand ? (
          <div className="pb-3 pt-1">
            <ul className="m-0 list-none space-y-2 p-0">
              {brandOptionsForOverlay.map((opt) => (
                <li key={opt.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border-blue accent-navy"
                      checked={selectedBrands.has(opt.id)}
                      onChange={() => toggleBrand(opt.id)}
                    />
                    <span>
                      {t(opt.labelKey)} ({brandCounts[opt.id] ?? 0})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            {BRAND_OPTIONS.length > 4 ? (
              <button
                type="button"
                className="mt-2 text-sm font-medium text-link-blue hover:text-navy"
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
          open={sectionsOpen.ram}
          title={t("filterPage.filters.ram")}
          onToggle={() => toggleSection("ram")}
        />
        {sectionsOpen.ram ? (
          <ul className="m-0 list-none space-y-2 p-0 pb-3 pt-1">
            {ramOptions.map((opt) => (
              <li key={opt.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-navy">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border-blue accent-navy"
                    checked={selectedRam.has(opt.id)}
                    onChange={() => toggleRam(opt.id)}
                  />
                  <span>
                    {t(opt.labelKey)} ({ramCounts[opt.id] ?? 0})
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
        />
        {sectionsOpen.color ? (
          <div className="flex flex-wrap gap-3 pb-2 pt-2">
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
                  title={t(`filterPage.filters.colorNames.${opt.id}`)}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <div
      className="cont-width-default mx-auto w-full max-w-[1600px] py-6 text-start md:py-8"
      aria-label={t("filterPage.mainAriaLabel")}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <aside
          className="hidden w-full shrink-0 rounded-2xl border border-border-blue/60 bg-white p-4 shadow-sm sm:p-5 lg:block lg:w-[300px] xl:w-[320px]"
          aria-label={t("filterPage.sidebarAriaLabel")}
        >
          {renderFilterForm("")}
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-col gap-3 lg:hidden" aria-label={t("filterPage.toolbarAriaLabel")}>
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
                  className="h-11 w-full min-w-0 rounded-xl border border-border-blue bg-white px-3 text-sm text-navy"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex shrink-0 gap-0.5 rounded-xl border border-border-blue bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  aria-label={t("filterPage.viewGridAria")}
                  className={`rounded-lg p-2.5 ${viewMode === "grid" ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}
                >
                  <FaTh className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label={t("filterPage.viewListAria")}
                  className={`rounded-lg p-2.5 ${viewMode === "list" ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}
                >
                  <FaList className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>
            <input
              type="search"
              value={search}
              onChange={onSearchChange}
              placeholder={t("filterPage.searchPlaceholder")}
              className="h-11 w-full rounded-xl border border-border-blue px-4 text-sm text-navy"
            />
          </div>

          <div className="mb-4 hidden flex-col gap-3 lg:flex" aria-label={t("filterPage.toolbarAriaLabel")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="search"
                value={search}
                onChange={onSearchChange}
                placeholder={t("filterPage.searchPlaceholder")}
                className="h-11 w-full min-w-0 max-w-xl rounded-xl border border-border-blue px-4 text-sm text-navy"
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-navy">
                  <span className="whitespace-nowrap">{t("filterPage.sortLabel")}</span>
                  <select
                    value={sort}
                    onChange={onSortChange}
                    className="h-11 rounded-lg border border-border-blue bg-white px-3 text-sm text-navy"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.labelKey)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-0.5 rounded-xl border border-border-blue p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                    aria-label={t("filterPage.viewGridAria")}
                    className={`rounded-lg p-2.5 ${viewMode === "grid" ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}
                  >
                    <FaTh className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                    aria-label={t("filterPage.viewListAria")}
                    className={`rounded-lg p-2.5 ${viewMode === "list" ? "bg-navy text-white" : "text-navy hover:bg-gray-100"}`}
                  >
                    <FaList className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {activeFilterChips.length > 0 ? (
            <div
              className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
            <p className="py-12 text-center text-text-muted">{t("filterPage.empty")}</p>
          ) : (
            <>
              <div
                className={
                  listMode
                    ? "flex flex-col gap-4"
                    : "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6"
                }
              >
                {pageItems.map((product) => (
                  <FilterProductCard
                    key={product.id}
                    product={product}
                    listMode={listMode}
                    inCompare={Boolean(compare[product.id])}
                    inWishlist={Boolean(wishlist[product.id])}
                    onToggleCompare={toggleCompare}
                    onToggleWishlist={toggleWishlist}
                    compareAria={t("relatedProducts.compareAriaLabel")}
                    wishlistAria={t("relatedProducts.wishlistAriaLabel")}
                  />
                ))}
              </div>

              <nav
                className="mt-8 flex flex-col flex-wrap items-center justify-center gap-4 border-t border-border-blue/60 pt-6 sm:flex-row sm:gap-6"
                aria-label={t("filterPage.pagination.navAria")}
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-border-blue px-3 py-2 text-sm text-navy disabled:opacity-40"
                    aria-label={t("filterPage.pagination.prevAria")}
                  >
                    ‹
                  </button>
                  {pageNumbers.map((item, idx) =>
                    item === "ellipsis" ? (
                      <span key={`e-${idx}`} className="px-1 text-text-muted">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-sm font-semibold ${
                          page === item
                            ? "border border-navy bg-navy text-white shadow-sm"
                            : "border border-border-blue text-navy hover:bg-hover-blue"
                        }`}
                        aria-label={t("filterPage.pagination.goToPage").replace("{{n}}", String(item))}
                        aria-current={page === item ? "page" : undefined}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-border-blue px-3 py-2 text-sm text-navy disabled:opacity-40"
                    aria-label={t("filterPage.pagination.nextAria")}
                  >
                    ›
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-navy">
                  <span>{t("filterPage.pagination.showLabel")}:</span>
                  <select
                    value={pageSize}
                    onChange={onPageSizeChange}
                    className="rounded-lg border border-border-blue bg-white px-2 py-2"
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
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title">
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
              <input
                type="search"
                value={overlayOptionQuery}
                onChange={(e) => setOverlayOptionQuery(e.target.value)}
                placeholder={t("filterPage.overlaySearchPlaceholder")}
                className="h-11 w-full rounded-xl border border-border-blue px-4 text-sm text-navy"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">{renderFilterForm("-drawer")}</div>
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
