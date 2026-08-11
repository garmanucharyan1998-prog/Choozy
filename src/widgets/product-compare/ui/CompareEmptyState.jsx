import { FaBalanceScale } from "react-icons/fa";
import { LocalizedLink } from "shared/ui/link";

/**
 * What `/compare` shows to someone who has selected nothing — which, for this page, is most
 * arrivals: it is a landing page in the sitemap, so search traffic lands here cold.
 *
 * It therefore has to explain the feature rather than just report an empty list, and hand
 * over a way in. No illustration: the one asset that would fit is 886 KB, and this is the
 * first thing a cold visitor waits for.
 */
export const CompareEmptyState = ({ t }) => (
  <div className="flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed border-border-blue bg-white px-6 py-14 text-center">
    <span
      className="flex h-16 w-16 items-center justify-center rounded-full bg-hover-blue text-navy"
      aria-hidden
    >
      <FaBalanceScale className="h-7 w-7" />
    </span>
    <h2 className="m-0 text-lg font-bold text-navy md:text-xl">{t("comparePage.empty.heading")}</h2>
    <p className="m-0 max-w-xl text-sm leading-relaxed text-text-muted md:text-base">
      {t("comparePage.empty.text")}
    </p>
    <LocalizedLink
      to="/filter"
      className="rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
    >
      {t("comparePage.empty.cta")}
    </LocalizedLink>
  </div>
);

export default CompareEmptyState;
