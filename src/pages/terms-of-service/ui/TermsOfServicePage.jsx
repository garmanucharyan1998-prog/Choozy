import { buildContentPageMeta, ContentPage } from "shared/ui/content-page";

export function meta({ location }) {
  return buildContentPageMeta({ namespace: "termsPage", location });
}

const TermsOfServicePage = () => <ContentPage namespace="termsPage" />;

export default TermsOfServicePage;
