import { redirect } from "react-router";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";
import { getCanonicalProductDetailPath } from "entities/product-detail";
import { getProductDetailForRoute } from "entities/product";

/**
 * `/singleproduct` with no id lands on the default product.
 *
 * Straight to the slugged canonical URL, with a 301. It used to send a 302 to the *slugless*
 * `/singleproduct/fp-1`, which the product route then 301'd again — two hops, the first of
 * them temporary, telling a crawler the destination might move back.
 */
export function loader({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  const product = getProductDetailForRoute(undefined);
  throw redirect(localizedPath(getCanonicalProductDetailPath(product), language), 301);
}
