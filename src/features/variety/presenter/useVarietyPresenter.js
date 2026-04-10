/**
 * useVarietyPresenter — MVP Presenter for Variety section.
 * Delegates async state handling to a shared presenter hook.
 */

import { productModel } from "entities/product";
import { useAsyncItemsPresenter } from "hooks/useAsyncItemsPresenter";

export const useVarietyPresenter = () => useAsyncItemsPresenter(productModel.getVarietyProducts);

export default useVarietyPresenter;
