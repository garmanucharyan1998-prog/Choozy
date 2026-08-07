import { useLanguage } from "contexts";
import { LocalizedLink } from "shared/ui/link";

/**
 * The actual "page not found" message, without SEO tags or page chrome — lives in
 * `shared` (not `pages/not-found`) so both the 404 route and any page that needs to
 * render an inline not-found state (e.g. an unresolved product id) can use it without
 * one page depending on another.
 */
const NotFoundContent = () => {
  const { t } = useLanguage();

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <h1 className="text-6xl font-bold text-navy">{t("notFoundPage.heading")}</h1>
      {/* text-gray-400 was ~2.8:1 on white — well below AA. */}
      <p className="text-lg text-text-muted">{t("notFoundPage.message")}</p>
      <LocalizedLink
        to="/"
        className="rounded-pill bg-navy px-6 py-3 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-80"
      >
        {t("notFoundPage.backHome")}
      </LocalizedLink>
    </section>
  );
};

export default NotFoundContent;
