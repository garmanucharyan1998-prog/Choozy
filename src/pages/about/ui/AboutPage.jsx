import { buildContentPageMeta, ContentPage } from "shared/ui/content-page";

export function meta({ location }) {
  return buildContentPageMeta({ namespace: "aboutPage", location });
}

const AboutPage = () => <ContentPage namespace="aboutPage" />;

export default AboutPage;
