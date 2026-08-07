import { useLanguage } from "contexts";

/**
 * Placeholder for pages that are not yet implemented.
 * Routed (so links are never broken) but kept out of the index and out of sitemap.xml
 * until real content lands. SEO metadata is built by each route's own `meta()` export
 * (see `shared/ui/comingSoonMeta.js`), not here — this is content only.
 *
 * @param {string} titleKey — translation key for the heading, e.g. `comingSoon.titles.about`.
 */
const ComingSoon = ({ titleKey }) => {
  const { t } = useLanguage();

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-navy">{t(titleKey)}</h1>
      <p className="text-text-muted text-base">{t("comingSoon.message")}</p>
    </section>
  );
};

export default ComingSoon;
