import { useMemo } from "react";
import { defaultMapCenter, mockProductOffers } from "entities/product-offers";
import { mockProductDetail } from "entities/product-detail";

/**
 * Presenter for the product offers + map section (specs panel + store map).
 */
export const useProductOffersPresenter = () => {
  const mapMarkers = useMemo(
    () =>
      mockProductOffers.map((offer) => ({
        id: offer.id,
        lat: offer.location.lat,
        lng: offer.location.lng,
        titleKey: offer.shopNameKey,
      })),
    [],
  );

  const specsRows = mockProductDetail.specsBriefRows;

  return {
    specsRows,
    mapCenter: defaultMapCenter,
    mapMarkers,
  };
};

export default useProductOffersPresenter;
