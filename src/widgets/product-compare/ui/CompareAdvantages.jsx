import { FaCheck } from "react-icons/fa";
import { CompareSeriesToken } from "./CompareSeriesToken";
import {
  SECTION_HEADING,
  SECTION_PAD,
  SECTION_SUBHEADING,
  SURFACE,
  SURFACE_INSET,
} from "./compareStyles";

/**
 * "Why you might choose this one" — one card per compared product, and the last thing on the page
 * because it is the last question: everything above establishes what the differences are, and this
 * says what each of them is worth choosing for.
 *
 * These are deliberately **not** a single "best overall" verdict. A composite score across price,
 * storage, RAM, battery and weight needs weights, and the catalog has no basis for choosing them —
 * any number this page invented would be precision it cannot support, dressed up as advice. What
 * it can defend is the per-attribute winner, with the value that won and the value it beat, which
 * is what every bullet here is.
 *
 * `buildCompareAdvantages` guarantees at least one bullet per product (falling back to its own
 * price, stated as a plain fact rather than as a claim), so a product with no measured strengths
 * never renders as a silently missing card next to three full ones.
 *
 * This is also the unique per-pair prose the 100+ generated `/compare/<a>-vs-<b>` pages were
 * otherwise missing — two pages comparing different phones against the same third one used to
 * render an otherwise-identical table shape and nothing else.
 */

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   products: { id: string, title: string }[],
 *   advantages: Record<string, { labelKey: string, formatted: string, deltaPercent: number | null, baselineFormatted: string | null }[]>,
 *   seriesColors: Record<string, string>,
 * }} props
 */
export const CompareAdvantages = ({ t, products, advantages, seriesColors }) => {
  const cards = products
    .map((product, index) => ({ product, index, items: advantages[product.id] ?? [] }))
    .filter(({ items }) => items.length > 0);

  if (cards.length === 0) return null;

  const headingTemplate = t("comparePage.advantages.heading");
  /**
   * `(+100%)` on its own states a margin over a baseline the reader cannot see: the card lists
   * one product's wins, so the value that was beaten is never on screen next to it. Printing it
   * turns a floating number into a claim that can be checked.
   */
  const betterThanTemplate = t("comparePage.advantages.betterThan");

  return (
    <section
      aria-labelledby="compare-verdict-heading"
      className={`${SURFACE} ${SECTION_PAD} flex flex-col gap-4`}
    >
      <div className="flex flex-col gap-1.5">
        <h2 id="compare-verdict-heading" className={SECTION_HEADING}>
          {t("comparePage.advantages.sectionHeading")}
        </h2>
        <p className={SECTION_SUBHEADING}>{t("comparePage.advantages.sectionIntro")}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map(({ product, index, items }) => (
          <article
            key={product.id}
            className={`${SURFACE_INSET} flex flex-col gap-3 p-3 md:p-4`}
          >
            <h3 className="m-0 flex items-center gap-2 text-xs font-bold text-navy sm:text-sm md:text-base">
              <CompareSeriesToken index={index} color={seriesColors[product.id]} />
              {headingTemplate.replace("{{title}}", product.title)}
            </h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-xs text-navy sm:text-sm">
              {items.map((item) => (
                <li key={item.labelKey} className="flex items-start gap-2">
                  <FaCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
                  <span>
                    {t(item.labelKey)}: <strong className="tabular-nums">{item.formatted}</strong>
                    {item.deltaPercent != null && item.baselineFormatted ? (
                      <span className="text-text-muted">
                        {" — "}
                        {betterThanTemplate
                          .replace("{{percent}}", String(item.deltaPercent))
                          .replace("{{baseline}}", item.baselineFormatted)}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CompareAdvantages;
