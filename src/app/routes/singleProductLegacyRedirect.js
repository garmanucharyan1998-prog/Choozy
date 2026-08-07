import { redirect } from "react-router";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";
import { getDefaultProductDetailPath } from "entities/product-detail";

/** `/singleproduct` (no id) redirects to the canonical default product URL. */
export function loader({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  throw redirect(localizedPath(getDefaultProductDetailPath(), language));
}
