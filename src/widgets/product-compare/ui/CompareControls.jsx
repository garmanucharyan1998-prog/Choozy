import { LocalizedLink } from "shared/ui/link";
import { FOCUS_RING, RADIUS_INNER } from "./compareStyles";

/**
 * The two decisions a visitor can make about the whole page — how much of it to show, and where
 * in it to go — in one bar under the product cards.
 *
 * "Show differences only" used to be a bare native checkbox floating above the table with its
 * label in 12px grey, next to a "Clear all" link of equal weight. It is the single most useful
 * control on a comparison page (a table of thirty rows where twelve differ is a table you read
 * twice), so it is now a segmented pair that states both of its states and says how many rows
 * the filter would leave — a toggle whose result you can predict before pressing it.
 *
 * The jump row is deliberately *not* sticky. Two things already pin on this page (the site
 * header at z-70, the compared-products strip at z-60) and a third would spend a third of a
 * landscape phone's viewport on chrome to save a scroll. It sits once, where a reader arrives.
 */

/**
 * `flex-1` and no `whitespace-nowrap`. The two Armenian labels together are 320px of text —
 * wider than a 390px phone once the group's own padding is counted — so with `nowrap` the second
 * segment ran off the right edge and its differing-row count was cut in half. Letting them wrap
 * costs a second line and keeps both states of the choice readable, which is the entire point of
 * spelling the choice out rather than shipping a checkbox.
 */
const SEGMENT =
  `flex-1 px-3 py-2 text-center text-[11px] font-semibold leading-snug transition-colors sm:flex-none sm:text-sm ${FOCUS_RING}`;
const SEGMENT_ON = "bg-navy text-white";
const SEGMENT_OFF = "bg-white text-navy hover:bg-hover-blue";

/**
 * A jump chip, and two things about it that were wrong.
 *
 * **It wrapped.** `shrink-0` was on the anchor, which does nothing: the flex item is the `<li>`
 * around it, and a flex item shrinks by default. So the moment the row overflowed — which is the
 * normal state of a scrolling chip row — every list item was squeezed and the anchor inside it
 * wrapped. "Ո՞րն ընտրել" became a two-line 47px pill in a row of 28px ones. `shrink-0` now sits
 * on the `<li>`, and `whitespace-nowrap` here makes the chip's own contract explicit: a pill is a
 * single-line shape, and one whose label wraps is not a pill.
 *
 * **It read as text.** On white, `border-border-blue` (#dde3f8) is barely a line, so a chip read
 * as a bare word — and in Armenian that is worse than it sounds: MontserratArm's baseline strokes
 * (ը, ն, ր, ու) merge at 11px into what looks like an underline, so an unfilled chip reads as an
 * underlined text link rather than as a control. A tinted pill says "button" before a single
 * glyph is read, in any language.
 */
const CHIP =
  `block whitespace-nowrap rounded-pill border border-transparent bg-subtle-bg px-3 py-1.5 text-[11px] font-semibold text-navy no-underline transition-colors hover:border-link-blue hover:bg-hover-blue sm:text-xs ${FOCUS_RING}`;

/**
 * @param {{
 *   t: (key: string, fallback?: string) => string,
 *   onlyDifferences: boolean,
 *   setOnlyDifferences: (value: boolean) => void,
 *   differingSpecCount: number,
 *   canFilter: boolean,
 *   anchors: { id: string, labelKey: string }[],
 *   onJump: (id: string) => void,
 *   isFixed: boolean,
 *   editHref: string,
 *   clearAll: () => void,
 * }} props
 */
export const CompareControls = ({
  t,
  onlyDifferences,
  setOnlyDifferences,
  differingSpecCount,
  canFilter,
  anchors,
  onJump,
  isFixed,
  editHref,
  clearAll,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/**
       * A radio group, not two buttons: the two states are one choice with one answer, and a
       * screen reader that hears "pressed / not pressed" twice has to work that out for itself.
       */}
      <div
        role="radiogroup"
        aria-label={t("comparePage.controls.scopeAria")}
        className={`flex w-full ${RADIUS_INNER} overflow-hidden border border-border-blue sm:inline-flex sm:w-auto`}
      >
        <button
          type="button"
          role="radio"
          aria-checked={!onlyDifferences}
          onClick={() => setOnlyDifferences(false)}
          className={`${SEGMENT} ${onlyDifferences ? SEGMENT_OFF : SEGMENT_ON}`}
        >
          {t("comparePage.controls.showAll")}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={onlyDifferences}
          onClick={() => setOnlyDifferences(true)}
          /**
           * Disabled rather than hidden when everything matches: its absence would read as a
           * missing feature, and the count beside it already explains why it is inert.
           */
          disabled={!canFilter}
          className={`${SEGMENT} ${onlyDifferences ? SEGMENT_ON : SEGMENT_OFF} disabled:cursor-not-allowed disabled:bg-subtle-bg disabled:text-text-muted`}
        >
          {t("comparePage.controls.onlyDifferences")}
          {differingSpecCount > 0 ? (
            <span className="ms-1.5 tabular-nums opacity-80">{differingSpecCount}</span>
          ) : null}
        </button>
      </div>

      {isFixed ? (
        <LocalizedLink
          to={editHref}
          className={`rounded-lg px-3 py-2 text-xs font-semibold text-link-blue no-underline transition-colors hover:bg-hover-blue sm:text-sm ${FOCUS_RING}`}
        >
          {t("comparePage.editComparison")}
        </LocalizedLink>
      ) : (
        <button
          type="button"
          onClick={clearAll}
          className={`rounded-lg px-3 py-2 text-xs font-semibold text-link-blue transition-colors hover:bg-hover-blue sm:text-sm ${FOCUS_RING}`}
        >
          {t("comparePage.clearAll")}
        </button>
      )}
    </div>

    {anchors.length > 1 ? (
      <nav aria-label={t("comparePage.controls.jumpAria")}>
        <ul className="m-0 -mx-2.5 flex list-none gap-2 overflow-x-auto px-2.5 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {anchors.map((anchor) => (
            <li key={anchor.id} className="shrink-0">
              {/**
               * A real `href`, so it survives with JavaScript off and can be copied; the handler
               * only upgrades the jump to a smooth one, and only when motion is welcome.
               */}
              <a
                href={`#${anchor.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onJump(anchor.id);
                }}
                className={CHIP}
              >
                {t(anchor.labelKey)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    ) : null}
  </div>
);

export default CompareControls;
