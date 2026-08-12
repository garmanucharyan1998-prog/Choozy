import { FaCheck } from "react-icons/fa";

/**
 * A "why this one" card per compared product — the same numbers the bars already show, reframed
 * as a verdict instead of a grid. This is the unique, per-pair prose the 100+ generated
 * `/compare/<a>-vs-<b>` pages were otherwise missing: two pages comparing different phones
 * against the same third one used to render an otherwise-identical table shape.
 *
 * Every product gets a card — `buildCompareAdvantages` guarantees at least one bullet each
 * (falling back to its own price as a plain fact) — so a product with no real strengths never
 * renders as a silently missing card next to the others.
 *
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   products: { id: string, title: string }[],
 *   advantages: Record<string, { labelKey: string, formatted: string, deltaPercent: number | null }[]>,
 *   seriesColors: Record<string, string>,
 * }} props
 */
export const CompareAdvantages = ({ t, products, advantages, seriesColors }) => {
  const cards = products
    .map((product) => ({ product, items: advantages[product.id] ?? [] }))
    .filter(({ items }) => items.length > 0);

  if (cards.length === 0) return null;

  const headingTemplate = t("comparePage.advantages.heading");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map(({ product, items }) => (
        <article
          key={product.id}
          className="flex flex-col gap-3 rounded-2xl border border-t-4 border-border-blue bg-white p-4 md:p-5"
          style={{ borderTopColor: seriesColors[product.id] }}
        >
          <h3 className="m-0 text-sm font-bold text-navy sm:text-base md:text-lg">
            {headingTemplate.replace("{{title}}", product.title)}
          </h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-xs text-navy sm:text-sm md:text-base">
            {items.map((item) => (
              <li key={item.labelKey} className="flex items-start gap-2">
                <FaCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" aria-hidden />
                <span>
                  {t(item.labelKey)}: <strong>{item.formatted}</strong>
                  {item.deltaPercent != null ? (
                    <span className="text-emerald-600"> (+{item.deltaPercent}%)</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
};

export default CompareAdvantages;
