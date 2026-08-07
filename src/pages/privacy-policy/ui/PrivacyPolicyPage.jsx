import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.privacyPolicy", location });
}

const PrivacyPolicyPage = () => <ComingSoon titleKey="comingSoon.titles.privacyPolicy" />;

export default PrivacyPolicyPage;
