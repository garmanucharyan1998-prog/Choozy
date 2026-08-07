import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.termsOfService", location });
}

const TermsOfServicePage = () => <ComingSoon titleKey="comingSoon.titles.termsOfService" />;

export default TermsOfServicePage;
