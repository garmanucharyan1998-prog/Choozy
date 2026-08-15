import { FaClock, FaExclamationTriangle } from "react-icons/fa";
import { SHOP_PRODUCT_EXPIRY } from "entities/shop";
import { TONE } from "../sellerUi";

/**
 * The two things a row says about itself at a glance: can it be sold, and is it about to
 * disappear.
 *
 * Three semantic colours in the whole workspace and no more (§44): green means sellable, red
 * means it is not, amber means the refresh deadline is close. Every badge also carries its own
 * word, so none of them depends on colour to be understood (§17, §38); the dot is a second,
 * redundant cue for scanning, not the message.
 *
 * Sized down deliberately from the pills these replace. A status a seller reads sixty times a
 * page does not need to be the largest thing in the row.
 */
const BADGE_BASE =
  "inline-flex max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold leading-5";

export const ProductStockBadge = ({ inStock, t }) => {
  const tone = inStock ? TONE.positive : TONE.critical;
  return (
    <span className={`${BADGE_BASE} ${tone.fill} ${tone.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} aria-hidden="true" />
      {inStock ? t("shopAccount.products.stock.in") : t("shopAccount.products.stock.out")}
    </span>
  );
};

/**
 * Renders **nothing** for a listing that is not close to its deadline — and nothing at all for
 * one the pruner exempts (`SHOP_PRODUCT_EXPIRY.PERMANENT`). A countdown on a row that will
 * never be removed would be a claim the data does not support (§12, §62).
 */
export const ProductExpiryBadge = ({ expiry, t }) => {
  if (expiry.state === SHOP_PRODUCT_EXPIRY.OVERDUE) {
    return (
      <span className={`${BADGE_BASE} ${TONE.critical.fill} ${TONE.critical.text}`}>
        <FaExclamationTriangle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
        {t("shopAccount.products.expiry.overdue")}
      </span>
    );
  }

  if (expiry.state !== SHOP_PRODUCT_EXPIRY.SOON) return null;

  return (
    <span className={`${BADGE_BASE} ${TONE.warning.fill} ${TONE.warning.text}`}>
      <FaClock className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
      {t("shopAccount.products.expiry.daysLeft").replace("{{count}}", String(expiry.daysLeft))}
    </span>
  );
};

/**
 * "Refreshed today" / "3 d ago" — the plain fact behind the deadline, shown for every listing
 * because `lastRefreshedAt` is real data on all of them.
 *
 * `null` before hydration: the value is derived from `Date.now()`, and the server and the
 * browser would print two different strings for the same row.
 */
export const ProductRefreshedLabel = ({ daysSinceRefresh, t }) => {
  if (daysSinceRefresh === null) return null;
  return (
    <span className="whitespace-nowrap tabular-nums">
      {daysSinceRefresh === 0
        ? t("shopAccount.products.refreshedToday")
        : t("shopAccount.products.refreshedDaysAgo").replace(
            "{{count}}",
            String(daysSinceRefresh),
          )}
    </span>
  );
};
