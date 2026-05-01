import { useCallback, useMemo, useState } from "react";
import { defaultMapCenter, mockProductOffers } from "entities/product-offers";
import { mockProductDetail } from "entities/product-detail";

const formatAmd = (amount) =>
  typeof amount === "number" ? amount.toLocaleString("en-US") : "";

/**
 * Presenter for the product offers + map section.
 * Holds tab state and prepares view-ready offers / specs data.
 */
export const useProductOffersPresenter = () => {
  const [activeTab, setActiveTab] = useState("sites");

  const selectTab = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const formattedOffers = useMemo(
    () =>
      mockProductOffers.map((offer) => ({
        ...offer,
        priceFormatted: formatAmd(offer.priceAmd),
      })),
    [],
  );

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
    activeTab,
    selectTab,
    offers: formattedOffers,
    specsRows,
    mapCenter: defaultMapCenter,
    mapMarkers,
  };
};

export default useProductOffersPresenter;
