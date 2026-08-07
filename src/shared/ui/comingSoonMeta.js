import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

/**
 * Shared `meta()` builder for the seven "coming soon" placeholder routes — same
 * `noIndex` treatment, differing only in which heading translation key each uses.
 *
 * @param {{ titleKey: string, location: { pathname: string } }} params
 */
export const buildComingSoonMeta = ({ titleKey, location }) => {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: `${t(titleKey)} — ${t("seo.siteName")}`,
    description: t("comingSoon.seoDescription"),
    language,
    path: location.pathname,
    noIndex: true,
  });
};

export default buildComingSoonMeta;
