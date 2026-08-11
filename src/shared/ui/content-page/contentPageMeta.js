import { getTranslator } from "shared/i18n";
import { buildPageMeta } from "shared/lib/seo";
import { getLanguageFromPath } from "shared/lib/locale";

/**
 * `meta()` for the prose pages. Unlike `comingSoonMeta`, these are indexable — the whole
 * point of writing real content for them.
 *
 * @param {{ namespace: string, location: { pathname: string } }} params
 */
export const buildContentPageMeta = ({ namespace, location }) => {
  const language = getLanguageFromPath(location.pathname);
  const t = getTranslator(language);
  return buildPageMeta({
    title: t(`${namespace}.seoTitle`),
    description: t(`${namespace}.seoDescription`),
    language,
    path: location.pathname,
  });
};

export default buildContentPageMeta;
