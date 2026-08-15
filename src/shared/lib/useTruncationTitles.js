import { useEffect } from "react";

/**
 * Gives every visually truncated string its full text as a native tooltip.
 *
 * Truncation in this codebase is always CSS — `truncate` (nowrap + ellipsis) or `line-clamp-N`.
 * The complete string is already in the DOM either way, so a screen reader has always read it in
 * full; it is the sighted visitor who is shown "Samsung Gal…" with no way to find out the rest.
 * This adds the missing half, and adds no data that was not already on the page.
 *
 * **Measured, not declared.** A `title` on every truncating element would fire tooltips on text
 * that happens to fit — and most of these elements fit at most widths. So each candidate is asked
 * whether it is *currently* clipped: `scrollWidth` for a single-line truncate, `scrollHeight` for
 * a line-clamp. Titles are added and removed as the viewport changes.
 *
 * **Central, not per-site.** Nearly every truncating element here is rendered inside a `.map()`,
 * where a per-element hook cannot be called, and the ones that are not carry layout-critical class
 * strings that a wrapper component would have to inherit intact. One pass over the document keeps
 * all of that untouched and covers anything added later for free.
 */

/** How truncation is spelled here. `text-ellipsis` only truncates alongside `overflow-hidden`. */
const TRUNCATING_SELECTOR = '.truncate, [class*="line-clamp-"], .text-ellipsis';

/** Ours to manage. Anything with a hand-written `title` is left exactly as its author set it. */
const OWNED_ATTRIBUTE = "data-truncation-title";

const isClipped = (element) => {
  const style = getComputedStyle(element);
  /* A clamp that resolves to `none` (e.g. `md:line-clamp-none`) is not truncating right now. */
  const clamped = style.webkitLineClamp && style.webkitLineClamp !== "none";
  if (clamped) return element.scrollHeight > element.clientHeight + 1;
  return element.scrollWidth > element.clientWidth + 1;
};

const syncOne = (element) => {
  const owned = element.hasAttribute(OWNED_ATTRIBUTE);
  if (element.hasAttribute("title") && !owned) return;

  const text = (element.textContent || "").trim();
  if (text && isClipped(element)) {
    /* Only touch the DOM when the value actually changes — see the observer note below. */
    if (element.getAttribute("title") !== text) {
      element.setAttribute("title", text);
      element.setAttribute(OWNED_ATTRIBUTE, "");
    }
  } else if (owned) {
    element.removeAttribute("title");
    element.removeAttribute(OWNED_ATTRIBUTE);
  }
};

export const useTruncationTitles = () => {
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frame = 0;
    const sync = () => {
      frame = 0;
      document.querySelectorAll(TRUNCATING_SELECTOR).forEach(syncOne);
    };
    /** At most one pass per frame: resize fires continuously, and so does a route change. */
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("resize", schedule);

    /**
     * `childList` and `characterData` only — deliberately NOT `attributes`. This effect's own
     * job is to set an attribute, so observing attributes would re-trigger it on every write and
     * spin. Navigation, filtering and lazy content all change children, which is what matters.
     */
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    /** Web fonts land after first paint and change every measurement taken before they do. */
    if (document.fonts?.ready) document.fonts.ready.then(schedule).catch(() => {});

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);
};

export default useTruncationTitles;
