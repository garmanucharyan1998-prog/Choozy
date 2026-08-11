import { buildContentPageMeta, ContentPage } from "shared/ui/content-page";

export function meta({ location }) {
  return buildContentPageMeta({ namespace: "privacyPage", location });
}

const PrivacyPolicyPage = () => <ContentPage namespace="privacyPage" />;

export default PrivacyPolicyPage;
