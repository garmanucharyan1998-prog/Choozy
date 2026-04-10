/**
 * useTopProductsPresenter — MVP Presenter for TopProducts section.
 * Delegates async state handling to a shared presenter hook.
 */

import { productModel } from "entities/product";
import { useAsyncItemsPresenter } from "hooks/useAsyncItemsPresenter";

export const useTopProductsPresenter = () => useAsyncItemsPresenter(productModel.getTopProducts);

export default useTopProductsPresenter;
