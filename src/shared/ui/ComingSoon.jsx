import { useLocation } from "react-router-dom";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";

/**
 * Placeholder for pages that are not yet implemented.
 * Routed (so links are never broken) but kept out of the index and out of sitemap.xml
 * until real content lands.
 *
 * @param {string} titleKey — translation key for the heading, e.g. `comingSoon.titles.about`.
 */
const ComingSoon = ({ titleKey }) => {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const title = t(titleKey);

  return (
    <>
      <PageSeo
        title={`${title} — ${t("seo.siteName")}`}
        description={t("comingSoon.seoDescription")}
        path={pathname}
        noIndex
      />
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-navy">{title}</h1>
        <p className="text-text-muted text-base">{t("comingSoon.message")}</p>
      </section>
    </>
  );
};

export default ComingSoon;
