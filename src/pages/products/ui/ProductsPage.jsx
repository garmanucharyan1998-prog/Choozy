import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.products", location });
}

const ProductsPage = () => <ComingSoon titleKey="comingSoon.titles.products" />;

export default ProductsPage;
