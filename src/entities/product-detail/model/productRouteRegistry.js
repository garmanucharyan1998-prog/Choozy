import { slugifyProductTitle } from "../lib/slugifyProductTitle";

/** Keep in sync with `PRODUCT_CATALOG[0].id` in `entities/product/model/productCatalog.js`. */
const DEFAULT_DETAIL_PRODUCT_ID = "fp-1";

const KNOWN_ID_PATTERN = /^fp-\d+$/;

const isKnownProductId = (id) => KNOWN_ID_PATTERN.test(String(id || "").trim());

/**
 * Public product URL: SEO slug from title, then `~`, then stable internal id (unique, reversible).
 * @param {string | undefined} id
 * @param {string | undefined} title
 */
export function getProductDetailHref(id, title) {
  const sid = id != null && String(id).trim() ? String(id).trim() : DEFAULT_DETAIL_PRODUCT_ID;
  const base = title ? slugifyProductTitle(title) : "";
  if (!base) {
    return `/singleproduct/${encodeURIComponent(sid)}`;
  }
  return `/singleproduct/${encodeURIComponent(`${base}~${sid}`)}`;
}

export function getDefaultProductDetailPath() {
  return getProductDetailHref(DEFAULT_DETAIL_PRODUCT_ID);
}

/**
 * @param {string | undefined} routeParam
 */
export function resolveProductRouteParam(routeParam) {
  const raw = routeParam != null ? decodeURIComponent(String(routeParam).trim()) : "";
  if (!raw) return DEFAULT_DETAIL_PRODUCT_ID;
  if (isKnownProductId(raw)) return raw;
  const tilde = raw.lastIndexOf("~");
  if (tilde !== -1) {
    const idPart = raw.slice(tilde + 1).trim();
    if (idPart) return idPart;
  }
  return raw;
}

/**
 * Canonical path for the resolved product (pretty URL with slug~id).
 * @param {{ id: string, listingTitle?: string }} product
 */
export function getCanonicalProductDetailPath(product) {
  const pid = String(product?.id ?? "").trim() || DEFAULT_DETAIL_PRODUCT_ID;
  return getProductDetailHref(pid, product?.listingTitle);
}
