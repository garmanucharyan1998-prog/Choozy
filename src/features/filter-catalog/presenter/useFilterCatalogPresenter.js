import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "contexts";
import {
  mockFilterProducts,
  SCREEN_SIZE_OPTIONS,
  BRAND_OPTIONS,
  RAM_OPTIONS,
  COLOR_OPTIONS,
} from "entities/filter-catalog";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

const boundsFromProducts = () => {
  const vals = mockFilterProducts.map((p) => p.priceValue);
  return { globalMin: Math.min(...vals), globalMax: Math.max(...vals) };
};

export const useFilterCatalogPresenter = () => {
  const { t } = useLanguage();
  const { globalMin, globalMax } = useMemo(boundsFromProducts, []);

  const [priceMin, setPriceMin] = useState(globalMin);
  const [priceMax, setPriceMax] = useState(globalMax);
  const [selectedScreens, setSelectedScreens] = useState(() => new Set());
  const [selectedBrands, setSelectedBrands] = useState(() => new Set());
  const [selectedRam, setSelectedRam] = useState(() => new Set());
  const [selectedColor, setSelectedColor] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sectionsOpen, setSectionsOpen] = useState(() => ({
    price: true,
    screen: true,
    brand: true,
    ram: true,
    color: true,
  }));
  const [brandExpanded, setBrandExpanded] = useState(false);

  const toggleSection = useCallback((key) => {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleScreen = useCallback((id) => {
    setSelectedScreens((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPage(1);
  }, []);

  const toggleBrand = useCallback((id) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPage(1);
  }, []);

  const toggleRam = useCallback((id) => {
    setSelectedRam((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setPage(1);
  }, []);

  const setColor = useCallback((id) => {
    setSelectedColor((prev) => (prev === id ? null : id));
    setPage(1);
  }, []);

  const removeScreen = useCallback((id) => {
    setSelectedScreens((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPage(1);
  }, []);

  const removeBrand = useCallback((id) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPage(1);
  }, []);

  const removeRam = useCallback((id) => {
    setSelectedRam((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPage(1);
  }, []);

  const clearSelectedColor = useCallback(() => {
    setSelectedColor(null);
    setPage(1);
  }, []);

  const resetPriceBounds = useCallback(() => {
    setPriceMin(globalMin);
    setPriceMax(globalMax);
    setPage(1);
  }, [globalMin, globalMax]);

  const screenCounts = useMemo(() => {
    const map = {};
    mockFilterProducts.forEach((p) => {
      const k = String(p.screenInch);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, []);

  const brandCounts = useMemo(() => {
    const map = {};
    mockFilterProducts.forEach((p) => {
      map[p.brandId] = (map[p.brandId] || 0) + 1;
    });
    return map;
  }, []);

  const ramCounts = useMemo(() => {
    const map = {};
    mockFilterProducts.forEach((p) => {
      const k = String(p.ramGb);
      map[k] = (map[k] || 0) + 1;
    });
    return map;
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = mockFilterProducts.filter((p) => {
      if (p.priceValue < priceMin || p.priceValue > priceMax) return false;
      if (selectedScreens.size > 0 && !selectedScreens.has(String(p.screenInch))) return false;
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brandId)) return false;
      if (selectedRam.size > 0 && !selectedRam.has(String(p.ramGb))) return false;
      if (selectedColor && p.colorId !== selectedColor) return false;
      if (q) {
        const hay = `${p.title} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
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
    search,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  useEffect(() => {
    setPage((p) => clamp(p, 1, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  const setPriceMinSafe = useCallback(
    (v) => {
      const n = clamp(Number(v) || 0, globalMin, globalMax);
      setPriceMin(Math.min(n, priceMax));
      setPage(1);
    },
    [globalMin, globalMax, priceMax],
  );

  const setPriceMaxSafe = useCallback(
    (v) => {
      const n = clamp(Number(v) || 0, globalMin, globalMax);
      setPriceMax(Math.max(n, priceMin));
      setPage(1);
    },
    [globalMin, globalMax, priceMin],
  );

  const onMinRangeChange = useCallback(
    (v) => {
      const n = clamp(Number(v), globalMin, globalMax);
      setPriceMin(Math.min(n, priceMax));
      setPage(1);
    },
    [globalMin, globalMax, priceMax],
  );

  const onMaxRangeChange = useCallback(
    (v) => {
      const n = clamp(Number(v), globalMin, globalMax);
      setPriceMax(Math.max(n, priceMin));
      setPage(1);
    },
    [globalMin, globalMax, priceMin],
  );

  const onSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const onSortChange = useCallback((e) => {
    setSort(e.target.value);
    setPage(1);
  }, []);

  const onPageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  }, []);

  const sortOptions = useMemo(
    () => [
      { value: "popular", labelKey: "filterPage.sort.popular" },
      { value: "priceAsc", labelKey: "filterPage.sort.priceAsc" },
      { value: "priceDesc", labelKey: "filterPage.sort.priceDesc" },
    ],
    [],
  );

  const pageSizeOptions = useMemo(() => [12, 20, 40], []);

  const visibleBrandOptions = useMemo(() => {
    const list = BRAND_OPTIONS;
    return brandExpanded ? list : list.slice(0, 4);
  }, [brandExpanded]);

  const priceRangeActive = priceMin > globalMin || priceMax < globalMax;

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
    return chips;
  }, [
    t,
    selectedScreens,
    selectedBrands,
    selectedRam,
    selectedColor,
    priceMin,
    priceMax,
    priceRangeActive,
    removeScreen,
    removeBrand,
    removeRam,
    clearSelectedColor,
    resetPriceBounds,
  ]);

  return {
    t,
    globalMin,
    globalMax,
    priceMin,
    priceMax,
    setPriceMin: setPriceMinSafe,
    setPriceMax: setPriceMaxSafe,
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
