/**
 * Builds a URL-safe slug from a product title (Latin letters and digits only).
 * Non-Latin characters are removed; use `id` suffix in the registry when the base slug is empty.
 * @param {string | undefined | null} title
 * @returns {string}
 */
export function slugifyProductTitle(title) {
  if (title == null) return "";
  const s = String(title).trim();
  if (!s) return "";
  const slug = s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug;
}
