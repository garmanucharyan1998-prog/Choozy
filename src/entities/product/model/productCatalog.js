/**
 * Single product catalog — the source of truth every part of the site reads from.
 *
 * Previously the catalog, the home page's two carousels, the related-products widget,
 * and the search-suggestion index were five separate hand-maintained lists with four
 * different id schemes (fp-N / top-N / var-N / rel-N), most of which just duplicated
 * the same handful of products under a different id and a hand-copied (and therefore
 * driftable) title/price/image. This is the one list; everything else is a view over it
 * (see productSelectors.js) or generated from it at read time (productDetails.js,
 * productOffers.js).
 *
 * Split one file per category under `./catalog/` once the list grew past ~30 entries — a
 * single 1000-line array was unreviewable, and a per-category file is also where a new
 * product's id collision or duplicate `mpn` would actually get noticed in a diff. Ids are
 * **append-only**: `fp-1`..`fp-27` are the original catalog, `fp-28` onward were added
 * later. Never renumber an existing id — it is embedded in saved wishlist rows
 * (`entities/user`), the compare-pairs slugs (`entities/product-compare`) and the sitemap,
 * all of which resolve a product by this id.
 */
import { getProductDetailHref } from "entities/product-detail/model/productRouteRegistry";
import { SMARTPHONES } from "./catalog/smartphones";
import { LAPTOPS } from "./catalog/laptops";
import { TABLETS } from "./catalog/tablets";
import { MONITORS } from "./catalog/monitors";
import { TVS } from "./catalog/tv";
import { HEADPHONES } from "./catalog/headphones";
import { SPEAKERS } from "./catalog/speakers";
import { WEARABLES } from "./catalog/wearables";
import { CAMERAS } from "./catalog/cameras";
import { CONSOLES } from "./catalog/consoles";
import { ACCESSORIES } from "./catalog/accessories";

/**
 * `screenInch`, `storageGb`, `ramGb`, `batteryMah` and `batteryHours` are all optional and
 * all mean exactly what they say — the real diagonal, the real storage size, the real RAM,
 * the real battery capacity, the real rated battery life — absent (as `null`) on products
 * that have neither (a lens, a monitor, a pair of over-ear headphones has no `batteryMah`
 * because its capacity was never published, but does have `batteryHours`). They used to be
 * neither: every product carried a `screenInch` so that headphones turned up under an
 * "11 inch" screen filter, and `ramGb` was rendered as RAM on the catalog card and as SSD
 * capacity in the spec table on the page that card linked to.
 *
 * `mpn`, `ratingValue`, `reviewCount`, `weightGrams`, `releaseYear` and `warrantyMonths` feed
 * the Product JSON-LD (`catalogJsonLd.js`, `pages/singleproduct/model/productJsonLd.js`) and
 * the extended spec table — a `Product` schema with no `mpn`/`aggregateRating`/`weight` is a
 * thinner search result than one that carries them, and this catalog has the real numbers to
 * give it.
 *
 * @typedef {{
 *   id: string,
 *   title: string,
 *   priceValue: number,
 *   image: string,
 *   categoryId: string,
 *   brandId: string,
 *   colorId: string,
 *   screenInch?: number | null,
 *   refreshHz?: number | null,
 *   storageGb?: number | null,
 *   ramGb?: number | null,
 *   batteryMah?: number | null,
 *   batteryHours?: number | null,
 *   weightGrams: number,
 *   releaseYear: number,
 *   warrantyMonths: number,
 *   mpn: string,
 *   ratingValue: number,
 *   reviewCount: number,
 *   homeSection?: "top" | "variety",
 * }} CatalogProduct
 */

/** @type {Omit<CatalogProduct, "href">[]} */
const CATALOG_BASE = [
  ...SMARTPHONES,
  ...LAPTOPS,
  ...TABLETS,
  ...MONITORS,
  ...TVS,
  ...HEADPHONES,
  ...SPEAKERS,
  ...WEARABLES,
  ...CAMERAS,
  ...CONSOLES,
  ...ACCESSORIES,
];

/**
 * No pre-formatted `price` string: it hardcoded "AMD" at module scope, so every card
 * contradicted the product page it linked to in Armenian and Russian, and the whole catalog
 * shipped those strings in the SSR payload for nothing. Views format `priceValue` with
 * `formatPriceAmd` and the visitor's own currency word.
 *
 * @type {CatalogProduct[]}
 */
export const PRODUCT_CATALOG = CATALOG_BASE.map((p) => ({
  ...p,
  href: getProductDetailHref(p.id, p.title),
}));

export const getCatalogProductById = (id) => PRODUCT_CATALOG.find((p) => p.id === id) ?? null;
