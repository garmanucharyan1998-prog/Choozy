import { useMemo } from "react";
import { useParams } from "react-router";
import { defaultMapCenter } from "entities/product-offers";
import { getOffersForProduct, getProductDetailForRoute } from "entities/product";

/**
 * Presenter for the product offers + map section (specs panel + store map).
 *
 * Previously this read `mockProductOffers` (one global offer list) and
 * `mockProductDetail.specsBriefRows` (the one shared detail record) directly, ignoring
 * the current route entirely — every product page showed the exact same map markers
 * and the exact same spec rows regardless of which product was open (K1).
 */
export const useProductOffersPresenter = () => {
  const { productId } = useParams();
  const product = useMemo(() => getProductDetailForRoute(productId), [productId]);
  const offers = useMemo(() => getOffersForProduct(product), [product]);

  const mapMarkers = useMemo(
    () =>
      offers.map((offer) => ({
        id: offer.id,
        lat: offer.location.lat,
        lng: offer.location.lng,
        titleKey: offer.shopNameKey,
      })),
    [offers],
  );

  const specsRows = product?.specsBriefRows ?? [];

  return {
    specsRows,
    mapCenter: defaultMapCenter,
    mapMarkers,
  };
};

export default useProductOffersPresenter;
