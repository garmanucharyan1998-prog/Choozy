import ComingSoon from "shared/ui/ComingSoon";
import { buildComingSoonMeta } from "shared/ui/comingSoonMeta";

export function meta({ location }) {
  return buildComingSoonMeta({ titleKey: "comingSoon.titles.about", location });
}

const AboutPage = () => <ComingSoon titleKey="comingSoon.titles.about" />;

export default AboutPage;
