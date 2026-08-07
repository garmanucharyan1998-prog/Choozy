import { data } from "react-router";
import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";
import { NotFoundContent } from "shared/ui/not-found-content";

/** A real HTTP 404 now that there's a real server — previously a soft-200 relying on the static host's fallback config. */
export async function loader() {
  return data(null, { status: 404 });
}

export function meta({ location }) {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: t("notFoundPage.seoTitle"),
    description: t("notFoundPage.seoDescription"),
    language,
    path: `${location.pathname}${location.search}`,
    noIndex: true,
  });
}

const NotFoundPage = () => <NotFoundContent />;

export default NotFoundPage;
