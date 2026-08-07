import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "contexts";
import {
  mockFilterProducts,
  SCREEN_SIZE_OPTIONS,
  BRAND_OPTIONS,
  RAM_OPTIONS,
  COLOR_OPTIONS,
  isValidFilterCategoryId,
  productMatchesSearch,
} from "entities/filter-catalog";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const boundsFromProducts = () => {
  const vals = mockFilterProducts.map((p) => p.priceValue);
  return { globalMin: Math.min(...vals), globalMax: Math.max(...vals) };
};

const SORT_VALUES = ["popular", "priceAsc", "priceDesc"];
const PAGE_SIZES = [12, 20, 40];
const DEFAULT_PAGE_SIZE = 20;

/** Comma-separated multi-value params, filtered against the known option ids. */
const readSet = (searchParams, key, allowedIds) => {
  const raw = searchParams.get(key);
  if (!raw) return new Set();
  const allowed = new Set(allowedIds);
  return new Set(
    raw
      .split(",")
      .map((v) => v.trim())
      .filter((v) => allowed.has(v)),
  );
};

const readNumber = (searchParams, key, fallback) => {
  const raw = searchParams.get(key);
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

export const useFilterCatalogPresenter = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const { globalMin, globalMax } = useMemo(boundsFromProducts, []);

  /**
   * Every facet lives in the URL: results stay shareable, the back button works,
   * and crawlers can reach pages beyond the first one.
   */
  const selectedScreens = useMemo(
    () => readSet(searchParams, "screen", SCREEN_SIZE_OPTIONS.map((o) => o.id)),
    [searchParams],
  );
  const selectedBrands = useMemo(
    () => readSet(searchParams, "brand", BRAND_OPTIONS.map((o) => o.id)),
    [searchParams],
  );
  const selectedRam = useMemo(
    () => readSet(searchParams, "ram", RAM_OPTIONS.map((o) => o.id)),
    [searchParams],
  );
  const selectedColor = useMemo(() => {
    const value = searchParams.get("color");
    return COLOR_OPTIONS.some((o) => o.id === value) ? value : null;
  }, [searchParams]);
  const selectedCategory = useMemo(() => {
    const value = searchParams.get("category");
    return isValidFilterCategoryId(value) ? value : null;
  }, [searchParams]);
  const sort = useMemo(() => {
    const value = searchParams.get("sort");
    return SORT_VALUES.includes(value) ? value : "popular";
  }, [searchParams]);
  const pageSize = useMemo(() => {
    const value = readNumber(searchParams, "perPage", DEFAULT_PAGE_SIZE);
    return PAGE_SIZES.includes(value) ? value : DEFAULT_PAGE_SIZE;
  }, [searchParams]);
  const priceMin = useMemo(
    () => clamp(readNumber(searchParams, "priceMin", globalMin), globalMin, globalMax),
    [searchParams, globalMin, globalMax],
  );
  const priceMax = useMemo(
    () => clamp(readNumber(searchParams, "priceMax", globalMax), globalMin, globalMax),
    [searchParams, globalMin, globalMax],
  );
  const urlQuery = searchParams.get("q") ?? "";

  /**
   * The input keeps its own draft so typing is never rewritten by the URL round-trip
   * (a trailing space used to disappear because the URL stores the trimmed value).
   */
  const [searchDraft, setSearchDraft] = useState(urlQuery);
  const lastSyncedQueryRef = useRef(urlQuery);

  useEffect(() => {
    if (urlQuery !== lastSyncedQueryRef.current) {
      lastSyncedQueryRef.current = urlQuery;
      setSearchDraft(urlQuery);
    }
  }, [urlQuery]);

  const [viewMode, setViewMode] = useState("grid");
  const [sectionsOpen, setSectionsOpen] = useState(() => ({
    price: true,
    screen: true,
    brand: true,
    ram: true,
    color: true,
  }));
  const [brandExpanded, setBrandExpanded] = useState(false);

  /**
   * Writes params, dropping any that equal their default so canonical URLs stay short.
   * Any facet change resets pagination unless `page` is set explicitly.
   */
  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(patch).forEach(([key, value]) => {
        const isEmpty =
          value == null ||
          value === "" ||
          (value instanceof Set && value.size === 0) ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          next.delete(key);
          return;
        }
        if (value instanceof Set) {
          next.set(key, [...value].join(","));
          return;
        }
        next.set(key, String(value));
      });

      if (resetPage && !("page" in patch)) {
        next.delete("page");
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const toggleInSet = useCallback(
    (key, currentSet, id) => {
      const nextSet = new Set(currentSet);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      updateParams({ [key]: nextSet });
    },
    [updateParams],
  );

  const toggleScreen = useCallback(
    (id) => toggleInSet("screen", selectedScreens, id),
    [toggleInSet, selectedScreens],
  );
  const toggleBrand = useCallback(
    (id) => toggleInSet("brand", selectedBrands, id),
    [toggleInSet, selectedBrands],
  );
  const toggleRam = useCallback(
    (id) => toggleInSet("ram", selectedRam, id),
    [toggleInSet, selectedRam],
  );

  const setColor = useCallback(
    (id) => updateParams({ color: selectedColor === id ? null : id }),
    [updateParams, selectedColor],
  );

  const removeScreen = useCallback(
    (id) => {
      const next = new Set(selectedScreens);
      next.delete(id);
      updateParams({ screen: next });
    },
    [updateParams, selectedScreens],
  );
  const removeBrand = useCallback(
    (id) => {
      const next = new Set(selectedBrands);
      next.delete(id);
      updateParams({ brand: next });
    },
    [updateParams, selectedBrands],
  );
  const removeRam = useCallback(
    (id) => {
      const next = new Set(selectedRam);
      next.delete(id);
      updateParams({ ram: next });
    },
    [updateParams, selectedRam],
  );

  const clearSelectedColor = useCallback(() => updateParams({ color: null }), [updateParams]);
  const clearCategory = useCallback(() => updateParams({ category: null }), [updateParams]);
  const resetPriceBounds = useCallback(
    () => updateParams({ priceMin: null, priceMax: null }),
    [updateParams],
  );

  const toggleSection = useCallback((key) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const filteredProducts = useMemo(() => {
    const q = urlQuery.trim();
    let list = mockFilterProducts.filter((p) => {
      if (p.priceValue < priceMin || p.priceValue > priceMax) return false;
      if (selectedScreens.size > 0 && !selectedScreens.has(String(p.screenInch))) return false;
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brandId)) return false;
      if (selectedRam.size > 0 && !selectedRam.has(String(p.ramGb))) return false;
      if (selectedColor && p.colorId !== selectedColor) return false;
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (q && !productMatchesSearch(p, q)) return false;
      return true;
    });

    if (sort === "priceAsc") list = [...list].sort((a, b) => a.priceValue - b.priceValue);
    else if (sort === "priceDesc") list = [...list].sort((a, b) => b.priceValue - a.priceValue);

    return list;
  }, [
    priceMin,
    priceMax,
    selectedScreens,
    selectedBrands,
    selectedRam,
    selectedColor,
    selectedCategory,
    urlQuery,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const page = clamp(readNumber(searchParams, "page", 1), 1, totalPages);

  const setPage = useCallback(
    (updater) => {
      const nextPage = typeof updater === "function" ? updater(page) : updater;
      const safePage = clamp(Number(nextPage) || 1, 1, totalPages);
      updateParams({ page: safePage === 1 ? null : safePage }, { resetPage: false });
    },
    [page, totalPages, updateParams],
  );

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  /**
   * Counts reflect the current selection (every other facet applied), so the numbers in
   * brackets match what clicking the option would actually return.
   */
  const countsFor = useCallback(
    (facetKey, valueOf) => {
      const base = mockFilterProducts.filter((p) => {
        if (p.priceValue < priceMin || p.priceValue > priceMax) return false;
        if (facetKey !== "screen" && selectedScreens.size > 0 && !selectedScreens.has(String(p.screenInch)))
          return false;
        if (facetKey !== "brand" && selectedBrands.size > 0 && !selectedBrands.has(p.brandId)) return false;
        if (facetKey !== "ram" && selectedRam.size > 0 && !selectedRam.has(String(p.ramGb))) return false;
        if (selectedColor && p.colorId !== selectedColor) return false;
        if (selectedCategory && p.categoryId !== selectedCategory) return false;
        const q = urlQuery.trim();
        if (q && !productMatchesSearch(p, q)) return false;
        return true;
      });

      const map = {};
      base.forEach((p) => {
        const key = valueOf(p);
        map[key] = (map[key] || 0) + 1;
      });
      return map;
    },
    [priceMin, priceMax, selectedScreens, selectedBrands, selectedRam, selectedColor, selectedCategory, urlQuery],
  );

  const screenCounts = useMemo(
    () => countsFor("screen", (p) => String(p.screenInch)),
    [countsFor],
  );
  const brandCounts = useMemo(() => countsFor("brand", (p) => p.brandId), [countsFor]);
  const ramCounts = useMemo(() => countsFor("ram", (p) => String(p.ramGb)), [countsFor]);

  const setPriceMinSafe = useCallback(
    (v) => {
      const n = clamp(Number(v) || 0, globalMin, globalMax);
      const next = Math.min(n, priceMax);
      updateParams({ priceMin: next === globalMin ? null : next });
    },
    [globalMin, globalMax, priceMax, updateParams],
  );

  const setPriceMaxSafe = useCallback(
    (v) => {
      const n = clamp(Number(v) || 0, globalMin, globalMax);
      const next = Math.max(n, priceMin);
      updateParams({ priceMax: next === globalMax ? null : next });
    },
    [globalMin, globalMax, priceMin, updateParams],
  );

  const onSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      setSearchDraft(value);
      const trimmed = value.trim();
      lastSyncedQueryRef.current = trimmed;
      updateParams({ q: trimmed || null });
    },
    [updateParams],
  );

  const onSortChange = useCallback(
    (e) => updateParams({ sort: e.target.value === "popular" ? null : e.target.value }),
    [updateParams],
  );

  const onPageSizeChange = useCallback(
    (e) => {
      const value = Number(e.target.value);
      updateParams({ perPage: value === DEFAULT_PAGE_SIZE ? null : value });
    },
    [updateParams],
  );

  const sortOptions = useMemo(
    () => [
      { value: "popular", labelKey: "filterPage.sort.popular" },
      { value: "priceAsc", labelKey: "filterPage.sort.priceAsc" },
      { value: "priceDesc", labelKey: "filterPage.sort.priceDesc" },
    ],
    [],
  );

  const pageSizeOptions = useMemo(() => PAGE_SIZES, []);

  const visibleBrandOptions = useMemo(
    () => (brandExpanded ? BRAND_OPTIONS : BRAND_OPTIONS.slice(0, 4)),
    [brandExpanded],
  );

  const priceRangeActive = priceMin > globalMin || priceMax < globalMax;

  /** Builds a URL for a given page — pagination renders real links for crawlers. */
  const buildPageHref = useCallback(
    (targetPage) => {
      const next = new URLSearchParams(searchParams);
      if (targetPage <= 1) next.delete("page");
      else next.set("page", String(targetPage));
      const qs = next.toString();
      return qs ? `/filter?${qs}` : "/filter";
    },
    [searchParams],
  );

  const activeFilterChips = useMemo(() => {
    const chips = [];
    selectedScreens.forEach((id) => {
      const opt = SCREEN_SIZE_OPTIONS.find((o) => o.id === id);
      if (opt) {
        chips.push({
          key: `screen-${id}`,
          kind: "screen",
          id,
          label: t(opt.labelKey),
          remove: () => removeScreen(id),
        });
      }
    });
    selectedBrands.forEach((id) => {
      const opt = BRAND_OPTIONS.find((o) => o.id === id);
      if (opt) {
        chips.push({
          key: `brand-${id}`,
          kind: "brand",
          id,
          label: t(opt.labelKey),
          remove: () => removeBrand(id),
        });
      }
    });
    selectedRam.forEach((id) => {
      const opt = RAM_OPTIONS.find((o) => o.id === id);
      if (opt) {
        chips.push({
          key: `ram-${id}`,
          kind: "ram",
          id,
          label: t(opt.labelKey),
          remove: () => removeRam(id),
        });
      }
    });
    if (selectedColor) {
      chips.push({
        key: `color-${selectedColor}`,
        kind: "color",
        id: selectedColor,
        label: t(`filterPage.filters.colorNames.${selectedColor}`),
        remove: clearSelectedColor,
      });
    }
    if (priceRangeActive) {
      chips.push({
        key: "price",
        kind: "price",
        id: "price",
        label: t("filterPage.activeChips.priceLabel")
          .replace("{{min}}", String(Math.round(priceMin)))
          .replace("{{max}}", String(Math.round(priceMax))),
        remove: resetPriceBounds,
      });
    }
    if (selectedCategory) {
      chips.push({
        key: `category-${selectedCategory}`,
        kind: "category",
        id: selectedCategory,
        label: t(`filterPage.categories.${selectedCategory}`, selectedCategory),
        remove: clearCategory,
      });
    }
    return chips;
  }, [
    t,
    selectedScreens,
    selectedBrands,
    selectedRam,
    selectedColor,
    selectedCategory,
    priceMin,
    priceMax,
    priceRangeActive,
    removeScreen,
    removeBrand,
    removeRam,
    clearSelectedColor,
    resetPriceBounds,
    clearCategory,
  ]);

  return {
    t,
    globalMin,
    globalMax,
    priceMin,
    priceMax,
    setPriceMin: setPriceMinSafe,
    setPriceMax: setPriceMaxSafe,
    onMinRangeChange: setPriceMinSafe,
    onMaxRangeChange: setPriceMaxSafe,
    selectedScreens,
    selectedBrands,
    selectedRam,
    selectedColor,
    selectedCategory,
    clearCategory,
    toggleScreen,
    toggleBrand,
    toggleRam,
    setColor,
    search: searchDraft,
    onSearchChange,
    sort,
    onSortChange,
    viewMode,
    setViewMode,
    page,
    setPage,
    buildPageHref,
    pageSize,
    onPageSizeChange,
    sectionsOpen,
    toggleSection,
    brandExpanded,
    setBrandExpanded,
    screenOptions: SCREEN_SIZE_OPTIONS,
    screenCounts,
    brandOptions: BRAND_OPTIONS,
    brandCounts,
    visibleBrandOptions,
    ramOptions: RAM_OPTIONS,
    ramCounts,
    colorOptions: COLOR_OPTIONS,
    sortOptions,
    pageSizeOptions,
    filteredProducts,
    pageItems,
    totalPages,
    totalResults: filteredProducts.length,
    activeFilterChips,
    resetPriceBounds,
  };
};

export default useFilterCatalogPresenter;
