import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { useProductOffersVariantFilter } from "contexts";
import { getOffersForProduct, getProductDetailForRoute } from "entities/product";
import { formatAmd } from "shared/lib/formatAmd";

const INITIAL_VISIBLE_COUNT = 3;
const LOAD_MORE_STEP = 2;
const SHOPS_SEE_MORE_MIN = 3;

export const SORT_OPTIONS = [
  { id: "popular", labelKey: "productOffers.bestOffers.sortOptions.popular" },
  { id: "priceAsc", labelKey: "productOffers.bestOffers.sortOptions.priceAsc" },
  { id: "priceDesc", labelKey: "productOffers.bestOffers.sortOptions.priceDesc" },
  /** Backed by the shops' own `ratingValue` (see `productOffers.js`), which the row also prints. */
  { id: "rating", labelKey: "productOffers.bestOffers.sortOptions.rating" },
];

const comparePrice = (asc) => (a, b) => (asc ? a.priceAmd - b.priceAmd : b.priceAmd - a.priceAmd);

/** Ties broken by review count: a 4.5 from 2000 shoppers outranks a 4.5 from twelve. */
const compareRating = (a, b) =>
  b.shopRatingValue - a.shopRatingValue || b.shopReviewCount - a.shopReviewCount;

const buildInitialSelections = (offers) =>
  offers.reduce((acc, offer) => {
    acc[offer.id] = {
      variantIndex: offer.defaultVariantIndex ?? 0,
      colorIndex: offer.defaultColorIndex ?? 0,
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
 *
 * Offers now come from `getOffersForProduct(product)` — previously this read
 * `mockProductOffers`, one fixed global list shared by every product page (K1: an
 * AirPods page and a MacBook page showed the identical 3 shops at the identical prices).
 */
export const useBestOffersPresenter = () => {
  const { productId } = useParams();
  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);
  const offers = useMemo(() => getOffersForProduct(product), [product]);

  const { selectedVariantIndex } = useProductOffersVariantFilter();
  const [sortId, setSortId] = useState(SORT_OPTIONS[0].id);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selections, setSelections] = useState(() => buildInitialSelections(offers));

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    setSelections(buildInitialSelections(offers));
  }, [offers]);

  useEffect(() => {
    if (selectedVariantIndex == null) return;
    setSelections((current) =>
      Object.fromEntries(
        Object.entries(current).map(([offerId, selection]) => [
          offerId,
          { ...selection, variantIndex: selectedVariantIndex },
        ]),
      ),
    );
  }, [selectedVariantIndex]);

  const sortedOffers = useMemo(() => {
    if (sortId === "priceAsc") return [...offers].sort(comparePrice(true));
    if (sortId === "priceDesc") return [...offers].sort(comparePrice(false));
    if (sortId === "rating") return [...offers].sort(compareRating);
    /** "Most popular" is the shop roster's own order — see the SHOPS comment in productOffers.js. */
    return offers;
  }, [offers, sortId]);

  const visibleOffers = useMemo(
    () => sortedOffers.slice(0, visibleCount).map((offer) => enrichOffer(offer, selections)),
    [sortedOffers, visibleCount, selections],
  );

  const canLoadMore =
    sortedOffers.length > SHOPS_SEE_MORE_MIN && visibleCount < sortedOffers.length;
  const canShowLess = visibleCount > INITIAL_VISIBLE_COUNT;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + LOAD_MORE_STEP, sortedOffers.length));
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
    setSelections((current) => ({
      ...current,
      [offerId]: { ...current[offerId], variantIndex },
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
