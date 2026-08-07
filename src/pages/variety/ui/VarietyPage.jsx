import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.variety", location });
}

const VarietyPage = () => <ComingSoon titleKey="comingSoon.titles.variety" />;

export default VarietyPage;
