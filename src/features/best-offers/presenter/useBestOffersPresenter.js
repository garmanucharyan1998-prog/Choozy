import { useCallback, useMemo, useState } from "react";
import { mockProductOffers } from "entities/product-offers";

const INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_STEP = 2;

export const SORT_OPTIONS = [
  { id: "popular", labelKey: "productOffers.bestOffers.sortOptions.popular" },
  { id: "priceAsc", labelKey: "productOffers.bestOffers.sortOptions.priceAsc" },
  { id: "priceDesc", labelKey: "productOffers.bestOffers.sortOptions.priceDesc" },
];

const formatAmd = (amount) =>
  typeof amount === "number" ? amount.toLocaleString("en-US") : "";

const comparePrice = (asc) => (a, b) =>
  asc ? a.priceAmd - b.priceAmd : b.priceAmd - a.priceAmd;

const buildInitialSelections = (offers) =>
  offers.reduce((acc, offer) => {
    acc[offer.id] = {
      variantIndex: offer.defaultVariantIndex ?? 0,
      colorIndex: offer.defaultColorIndex ?? 0,
    };
    return acc;
  }, {});

/**
 * Presenter for the "Best offers" table.
 * Manages per-row variant/color selection, sorting, and paginated "See more".
 */
export const useBestOffersPresenter = () => {
  const [sortId, setSortId] = useState(SORT_OPTIONS[0].id);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selections, setSelections] = useState(() =>
    buildInitialSelections(mockProductOffers),
  );

  const sortedOffers = useMemo(() => {
    const base = mockProductOffers.map((offer) => ({
      ...offer,
      priceFormatted: formatAmd(offer.priceAmd),
    }));
    if (sortId === "priceAsc") return [...base].sort(comparePrice(true));
    if (sortId === "priceDesc") return [...base].sort(comparePrice(false));
    return base;
  }, [sortId]);

  const visibleOffers = useMemo(
    () => sortedOffers.slice(0, visibleCount),
    [sortedOffers, visibleCount],
  );

  const canLoadMore = visibleCount < sortedOffers.length;

  const loadMore = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + LOAD_MORE_STEP, mockProductOffers.length),
    );
  }, []);

  const selectSort = useCallback((nextSortId) => {
    setSortId(nextSortId);
    setIsSortOpen(false);
  }, []);

  const toggleSortOpen = useCallback(() => {
    setIsSortOpen((current) => !current);
  }, []);

  const closeSort = useCallback(() => {
    setIsSortOpen(false);
  }, []);

  const selectVariantForOffer = useCallback((offerId, variantIndex) => {
    setSelections((current) => ({
      ...current,
      [offerId]: {
        ...current[offerId],
        variantIndex,
      },
    }));
  }, []);

  const selectColorForOffer = useCallback((offerId, colorIndex) => {
    setSelections((current) => ({
      ...current,
      [offerId]: {
        ...current[offerId],
        colorIndex,
      },
    }));
  }, []);

  const activeSortOption = useMemo(
    () => SORT_OPTIONS.find((option) => option.id === sortId) ?? SORT_OPTIONS[0],
    [sortId],
  );

  return {
    offers: visibleOffers,
    selections,
    sortOptions: SORT_OPTIONS,
    activeSortOption,
    isSortOpen,
    canLoadMore,
    toggleSortOpen,
    closeSort,
    selectSort,
    selectVariantForOffer,
    selectColorForOffer,
    loadMore,
  };
};

export default useBestOffersPresenter;
