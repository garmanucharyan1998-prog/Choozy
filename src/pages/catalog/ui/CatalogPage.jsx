import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.catalog", location });
}

const CatalogPage = () => <ComingSoon titleKey="comingSoon.titles.catalog" />;

export default CatalogPage;
