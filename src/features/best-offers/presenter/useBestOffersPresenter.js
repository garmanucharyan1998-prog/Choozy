import { useCallback, useEffect, useMemo, useState } from "react";
import { useProductOffersVariantFilter } from "contexts";
import {
  mockProductOffers,
  offerMatchesVariantFilter,
  resolveOfferVariantIndex,
} from "entities/product-offers";

const INITIAL_VISIBLE_COUNT = 3;
const LOAD_MORE_STEP = 2;
const SHOPS_SEE_MORE_MIN = 3;

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

const applyVariantKeyToSelections = (variantKey, current) =>
  mockProductOffers.reduce((acc, offer) => {
    const prev = current[offer.id] ?? {
      variantIndex: offer.defaultVariantIndex ?? 0,
      colorIndex: offer.defaultColorIndex ?? 0,
    };
    acc[offer.id] = {
      variantIndex: resolveOfferVariantIndex(offer, variantKey, prev.variantIndex),
      colorIndex: prev.colorIndex,
    };
    return acc;
  }, {});

const enrichOffer = (offer, selections) => {
  const selection = selections[offer.id] ?? {
    variantIndex: offer.defaultVariantIndex ?? 0,
    colorIndex: offer.defaultColorIndex ?? 0,
  };

  return {
    ...offer,
    priceFormatted: formatAmd(offer.priceAmd),
    activeVariantIndex: selection.variantIndex,
  };
};

/**
 * Presenter for the "Best offers" table.
 * Manages global variant filter, per-row color selection, sorting, and paginated see more/less.
 */
export const useBestOffersPresenter = () => {
  const { globalVariantKey } = useProductOffersVariantFilter();
  const [sortId, setSortId] = useState(SORT_OPTIONS[0].id);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selections, setSelections] = useState(() =>
    buildInitialSelections(mockProductOffers),
  );

  useEffect(() => {
    if (globalVariantKey == null) return;
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setSelections((current) => applyVariantKeyToSelections(globalVariantKey, current));
  }, [globalVariantKey]);

  const filteredOffers = useMemo(
    () => mockProductOffers.filter((offer) => offerMatchesVariantFilter(offer, globalVariantKey)),
    [globalVariantKey],
  );

  const sortedOffers = useMemo(() => {
    if (sortId === "priceAsc") return [...filteredOffers].sort(comparePrice(true));
    if (sortId === "priceDesc") return [...filteredOffers].sort(comparePrice(false));
    return filteredOffers;
  }, [filteredOffers, sortId]);

  const visibleOffers = useMemo(
    () =>
      sortedOffers
        .slice(0, visibleCount)
        .map((offer) => enrichOffer(offer, selections)),
    [sortedOffers, visibleCount, selections],
  );

  const canLoadMore =
    sortedOffers.length > SHOPS_SEE_MORE_MIN && visibleCount < sortedOffers.length;
  const canShowLess = visibleCount > INITIAL_VISIBLE_COUNT;

  const loadMore = useCallback(() => {
    setVisibleCount((current) =>
      Math.min(current + LOAD_MORE_STEP, sortedOffers.length),
    );
  }, [sortedOffers.length]);

  const showLess = useCallback(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
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
    setSelections((current) => {
      const offer = mockProductOffers.find((item) => item.id === offerId);
      const prev = current[offerId] ?? {
        variantIndex: offer?.defaultVariantIndex ?? 0,
        colorIndex: offer?.defaultColorIndex ?? 0,
      };
      return {
        ...current,
        [offerId]: {
          ...prev,
          variantIndex,
        },
      };
    });
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
    globalVariantKey,
    canLoadMore,
    canShowLess,
    toggleSortOpen,
    closeSort,
    selectSort,
    selectVariantForOffer,
    selectColorForOffer,
    loadMore,
    showLess,
  };
};

export default useBestOffersPresenter;
