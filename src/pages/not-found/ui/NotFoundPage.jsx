import { useLocation } from "react-router-dom";
import { useLanguage } from "contexts";
import { PageSeo } from "shared/lib/seo";
import { NotFoundContent } from "shared/ui/not-found-content";

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
      <NotFoundContent />
    </>
  );
};

export default NotFoundPage;
