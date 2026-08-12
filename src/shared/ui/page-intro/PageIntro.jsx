/**
 * The panel that introduces a page: an optional eyebrow, the page's `<h1>`, a decorative rule,
 * the descriptive paragraph search engines read, and an optional footnote.
 *
 * Shared rather than copied because the two places it renders exist for the same reason. Both
 * the home page and every category landing page used to carry an `sr-only` heading — valid HTML,
 * fine for assistive tech, but the kind of heading text a search engine discounts, on exactly
 * the pages meant to rank. Each now shows a real, visible, keyword-bearing H1 with prose under
 * it, and they should look like the same site while doing it.
 *
 * A `<header>` rather than a `<section>`: this is the heading block of the main content, and a
 * `<section>` with no accessible name is only a generic wrapper anyway.
 *
 * @param {{
 *   eyebrow?: string,
 *   heading: string,
 *   body?: string,
 *   footnote?: string,
 *   className?: string,
 * }} props
 */
const PageIntro = ({ eyebrow, heading, body, footnote, className = "" }) => (
  /**
   * Two things this layout has to get right, both learned the hard way.
   *
   * It owns no outer *top* spacing — that is `className`'s job, because the right value depends
   * on what precedes the block, which only the page knows. First thing on a category page it
   * needs to cancel the shell's `main` padding; after the category grid on the home page it
   * needs to add a gap instead. A shared component guessing either way is wrong on the other page.
   *
   * The panel spans the page's content column rather than a narrower `max-w-*` of its own. A
   * 768px box centred inside a ~1300px column lines up with nothing else on the page and reads
   * as a stray card; the horizontal padding below is copied from `GridCatalog` on purpose, so
   * this panel's edges land exactly on the grid's. The prose keeps its own readable measure.
   */
  <header className={`flex justify-center px-0 pb-5 sm:px-3 md:px-4 md:pb-7 lg:px-0 ${className}`}>
    <div className="cont-width-default flex flex-col items-center rounded-xl border border-border-blue bg-subtle-bg px-5 py-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)] md:px-8 md:py-8">
      {eyebrow ? (
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-link-blue">
          {eyebrow}
        </p>
      ) : null}
      <h1
        className={`m-0 text-xl font-bold text-navy md:text-2xl lg:text-[26px] ${
          eyebrow ? "mt-2" : ""
        }`}
      >
        {heading}
      </h1>
      {/** Decorative, so `aria-hidden`: it must add nothing to the heading's text. */}
      <span aria-hidden="true" className="mt-2.5 block h-0.5 w-12 rounded-pill bg-active-blue" />
      {body ? (
        <p className="m-0 mx-auto mt-3 max-w-[62ch] text-sm leading-relaxed text-text-muted">
          {body}
        </p>
      ) : null}
      {footnote ? <p className="m-0 mt-4 text-xs text-text-muted">{footnote}</p> : null}
    </div>
  </header>
);

export default PageIntro;
