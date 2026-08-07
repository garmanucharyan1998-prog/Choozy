/**
 * Imperative <head> manager.
 *
 * Why not render the tags from React: React 19 hoists `<title>`/`<meta>`/`<link>` into
 * <head>, but on hydration it only re-adopts tags that came from a real React SSR pass.
 * Our HTML is a DOM snapshot taken after a client render, so React appended a *second*
 * copy of every tag (two canonicals, two titles) and hydration failed.
 *
 * Writing the tags outside React keeps <head> out of the hydration diff entirely: the
 * prerendered tags stay, and this module replaces them in place on navigation.
 *
 * Every managed element carries `data-seo`, which is the marker used to clear the
 * previous page's tags — including the ones baked into the prerendered HTML.
 */

const MARKER = "data-seo";

const upsert = (tagName, attributes, textContent) => {
  const el = document.createElement(tagName);
  el.setAttribute(MARKER, "");
  Object.entries(attributes).forEach(([key, value]) => {
    if (value != null) el.setAttribute(key, String(value));
  });
  if (textContent != null) el.textContent = textContent;
  document.head.appendChild(el);
};

/**
 * @param {{
 *   title: string,
 *   metaNames?: Record<string, string>,
 *   metaProperties?: Array<[string, string]>,
 *   links?: Array<Record<string, string>>,
 *   jsonLd?: object[],
 * }} config
 */
export const applyPageMeta = ({
  title,
  metaNames = {},
  metaProperties = [],
  links = [],
  jsonLd = [],
}) => {
  if (typeof document === "undefined") return;

  document.querySelectorAll(`[${MARKER}]`).forEach((el) => el.remove());

  if (title) {
    const existingTitle = document.head.querySelector("title");
    if (existingTitle) existingTitle.remove();
    upsert("title", {}, title);
  }

  Object.entries(metaNames).forEach(([name, content]) => {
    if (content) upsert("meta", { name, content });
  });

  metaProperties.forEach(([property, content]) => {
    if (content) upsert("meta", { property, content });
  });

  links.forEach((attrs) => upsert("link", attrs));

  jsonLd.forEach((entry) => {
    upsert("script", { type: "application/ld+json" }, JSON.stringify(entry));
  });
};

export default applyPageMeta;
