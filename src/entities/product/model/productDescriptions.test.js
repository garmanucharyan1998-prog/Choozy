import { getTranslator } from "shared/i18n";
import { PRODUCT_CATALOG } from "./productCatalog";
import { buildProductDescription, getProductDescriptionKey } from "./productDescriptions";

const LANGUAGES = ["am", "en", "ru"];

describe("buildProductDescription", () => {
  test("every product resolves to real copy in every language", () => {
    LANGUAGES.forEach((language) => {
      const t = getTranslator(language);
      PRODUCT_CATALOG.forEach((product) => {
        const text = buildProductDescription(product, t);
        expect(text.length).toBeGreaterThan(20);
        /** An unresolved key or placeholder would leak straight into the page. */
        expect(text).not.toContain("{{");
        expect(text).not.toContain("productDescriptions.");
      });
    });
  });

  /**
   * The point of the change: `/ru/…` and `/en/…` used to differ from the Armenian page only
   * in UI chrome, leaving three near-duplicate URLs per product.
   */
  test("the three languages produce different copy for the same product", () => {
    const product = PRODUCT_CATALOG.find((p) => p.categoryId === "laptops");
    const [am, en, ru] = LANGUAGES.map((language) =>
      buildProductDescription(product, getTranslator(language)),
    );

    expect(new Set([am, en, ru]).size).toBe(3);
  });

  test("quotes the product's own screen and storage", () => {
    const t = getTranslator("en");
    const product = PRODUCT_CATALOG.find((p) => p.id === "fp-2");
    const text = buildProductDescription(product, t);

    expect(text).toContain(`${product.screenInch}″`);
    expect(text).toContain("512 GB");
  });

  test("a product with no screen or storage still reads as a sentence", () => {
    const t = getTranslator("en");
    PRODUCT_CATALOG.filter((p) => !p.screenInch && !p.storageGb).forEach((product) => {
      const text = buildProductDescription(product, t);
      expect(text).not.toContain("  ");
      expect(text).not.toContain("″");
    });
  });

  test("iOS and Android phones get different copy", () => {
    const apple = PRODUCT_CATALOG.find((p) => p.categoryId === "smartphones" && p.brandId === "apple");
    const other = PRODUCT_CATALOG.find(
      (p) => p.categoryId === "smartphones" && p.brandId !== "apple",
    );
    expect(getProductDescriptionKey(apple)).not.toBe(getProductDescriptionKey(other));
  });

  test("returns an empty string rather than throwing on a missing product", () => {
    expect(buildProductDescription(null, getTranslator("en"))).toBe("");
  });
});
