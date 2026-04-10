import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";

const NotFoundPage = () => {
  const { t } = useLanguage();
  const { pathname, search } = useLocation();
  const pathForCanonical = `${pathname}${search}`;

  return (
    <>
      <PageSeo
        title={t("notFoundPage.seoTitle")}
        description={t("notFoundPage.seoDescription")}
        path={pathForCanonical}
        noIndex
      />
      <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-navy">{t("notFoundPage.heading")}</h1>
        <p className="text-gray-400 text-lg">{t("notFoundPage.message")}</p>
        <Link
          to="/"
          className="px-6 py-3 bg-navy text-white rounded-pill text-sm font-semibold no-underline hover:opacity-80 transition-opacity"
        >
          {t("notFoundPage.backHome")}
        </Link>
      </section>
    </>
  );
};

export default NotFoundPage;
