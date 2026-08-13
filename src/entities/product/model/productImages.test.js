import { PRODUCT_CATALOG } from "./productCatalog";
import { PRODUCT_IMAGES, buildGalleryForProduct } from "./productImages";

const GALLERY_SIZE = 5;

describe("the shared image pool", () => {
  test("no two keys point at the same photo", () => {
    const byUrl = new Map();
    Object.entries(PRODUCT_IMAGES).forEach(([key, url]) => {
      byUrl.set(url, [...(byUrl.get(url) || []), key]);
    });

    const duplicated = [...byUrl.values()].filter((keys) => keys.length > 1);
    expect(duplicated).toEqual([]);
  });

  /**
   * Listing covers, not galleries. `PRODUCT_IMAGES.laptop` was the cover of 8 of the 20
   * laptops, so a third of the catalog page was the same photograph under different names —
   * the single most visible sign that this data was filled in rather than collected.
   */
  test("no photo is the cover of more than two products", () => {
    const counts = new Map();
    PRODUCT_CATALOG.forEach((product) => {
      counts.set(product.image, [...(counts.get(product.image) || []), product.id]);
    });

    const overused = [...counts.values()]
      .filter((ids) => ids.length > 2)
      .map((ids) => ids.join(", "));

    expect(overused).toEqual([]);
  });

  test("every url asks Unsplash for the crop the markup declares", () => {
    Object.values(PRODUCT_IMAGES).forEach((url) => {
      expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?/);
      expect(url).toContain("w=1200");
      expect(url).toContain("h=900");
      expect(url).toContain("fm=webp");
    });
  });
});

describe("buildGalleryForProduct", () => {
  test("every product gets a full gallery, its own listing image first", () => {
    PRODUCT_CATALOG.forEach((product) => {
      const gallery = buildGalleryForProduct(product);
      expect(gallery[0], product.id).toBe(product.image);
      expect(gallery, product.id).toHaveLength(GALLERY_SIZE);
      expect(new Set(gallery).size, `${product.id} repeats a frame`).toBe(GALLERY_SIZE);
    });
  });

  /**
   * The defect this replaced: one hardcoded four-image set per category meant every product in
   * a category showed the identical gallery after its first thumbnail — 22 smartphone pages
   * that looked copied from each other.
   */
  test("products in the same category do not share a gallery", () => {
    const byCategory = new Map();
    PRODUCT_CATALOG.forEach((product) => {
      byCategory.set(product.categoryId, [...(byCategory.get(product.categoryId) || []), product]);
    });

    byCategory.forEach((products, categoryId) => {
      if (products.length < 2) return;
      const galleries = products.map((product) => buildGalleryForProduct(product).join("|"));
      const distinct = new Set(galleries).size;
      /**
       * Not `=== products.length`: the pool is finite, so two of 22 smartphones can legitimately
       * land on the same window. What must not happen is a category collapsing onto one gallery.
       */
      expect(distinct, `${categoryId} has ${distinct} distinct galleries`).toBeGreaterThan(
        Math.min(products.length, 6) - 1,
      );
    });
  });

  test("a gallery never mixes in a frame from another category", () => {
    const galleriesByCategory = new Map();
    PRODUCT_CATALOG.forEach((product) => {
      const set = galleriesByCategory.get(product.categoryId) || new Set();
      buildGalleryForProduct(product).forEach((url) => set.add(url));
      galleriesByCategory.set(product.categoryId, set);
    });

    /** Each category's frames must be disjoint from every other category's. */
    const entries = [...galleriesByCategory.entries()];
    const overlaps = entries.flatMap(([categoryId, urls], index) =>
      entries.slice(index + 1).flatMap(([otherId, otherUrls]) =>
        [...urls]
          .filter((url) => otherUrls.has(url))
          .map((url) => `${categoryId} and ${otherId} share ${url}`),
      ),
    );

    expect(overlaps).toEqual([]);
  });

  test("a product whose category has no pool still gets its own image back", () => {
    const gallery = buildGalleryForProduct({
      id: "fp-none",
      image: PRODUCT_IMAGES.macbook,
      categoryId: "not-a-category",
    });

    expect(gallery).toEqual([PRODUCT_IMAGES.macbook]);
  });
});
