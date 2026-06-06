import { slugifyProductTitle } from "../lib/slugifyProductTitle";

/** Keep in sync with `defaultProductDetailRouteId` in `mockProductDetail.js`. */
const DEFAULT_DETAIL_PRODUCT_ID = "apple-macbook-pro-demo";

const KNOWN_ID_PATTERN = /^(?:fp-\d+|var-\d+|top-\d+|apple-macbook-pro-demo)$/;

const isKnownProductId = (id) => KNOWN_ID_PATTERN.test(String(id || "").trim());

/**
 * Public product URL: SEO slug from title, then `~`, then stable internal id (unique, reversible).
 * Legacy `/singleproduct/fp-1` and `/singleproduct/var-5` still resolve via `resolveProductRouteParam`.
 * @param {string | undefined} id
 * @param {string | undefined} title
 */
export function getProductDetailHref(id, title) {
  const sid = id != null ? String(id).trim() : "";
  if (!sid) {
    return `/singleproduct/${encodeURIComponent(`${slugifyProductTitle("Apple MacBook Pro") || "product"}~${DEFAULT_DETAIL_PRODUCT_ID}`)}`;
  }
  const base = slugifyProductTitle(title);
  if (!base) {
    return `/singleproduct/${encodeURIComponent(sid)}`;
  }
  return `/singleproduct/${encodeURIComponent(`${base}~${sid}`)}`;
}

export function getDefaultProductDetailPath() {
  return getProductDetailHref(DEFAULT_DETAIL_PRODUCT_ID, "Apple MacBook Pro");
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
  const pid = String(product?.id ?? "").trim();
  const title =
    product?.listingTitle ||
    (pid === DEFAULT_DETAIL_PRODUCT_ID ? "Apple MacBook Pro" : "Product");
  return getProductDetailHref(pid || DEFAULT_DETAIL_PRODUCT_ID, title);
}
