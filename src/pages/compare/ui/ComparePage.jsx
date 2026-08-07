import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.compare", location });
}

const ComparePage = () => <ComingSoon titleKey="comingSoon.titles.compare" />;

export default ComparePage;
