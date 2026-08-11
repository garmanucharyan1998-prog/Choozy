import { getTranslator } from "shared/i18n";
import { PRODUCT_CATALOG } from "./productCatalog";
import { resolveSpecValue } from "./productSpecValue";
import { buildSpecsForProduct } from "./productSpecs";
import { buildVariantsForProduct } from "./productVariants";

const t = getTranslator("en");

const specRows = (product) => {
  const { brief, extended } = buildSpecsForProduct(product);
  return [...brief, ...extended];
};

/** Rows carry either a literal value or a translation key — compare what actually renders. */
const specValues = (product) => specRows(product).map((row) => resolveSpecValue(row, t));

describe("buildSpecsForProduct", () => {
  test("every emitted row has a non-empty value", () => {
    PRODUCT_CATALOG.forEach((product) => {
      specRows(product).forEach((row) => {
        expect(row.labelKey).toBeTruthy();
        expect(resolveSpecValue(row, t), `${product.id}/${row.labelKey}`).toBeTruthy();
      });
    });
  });

  /** A 128 GB tablet used to advertise "0.128 TB" here while its picker said "128 GB". */
  test("a 128 GB product reports 128 GB, not a fraction of a terabyte", () => {
    const product = PRODUCT_CATALOG.find((p) => p.storageGb === 128);
    const values = specValues(product);

    expect(values).toContain("128 GB");
    values.forEach((value) => expect(value).not.toContain("0.128"));
  });

  test("a 1 TB product reports 1 TB", () => {
    const product = PRODUCT_CATALOG.find((p) => p.storageGb === 1000);
    expect(specRows(product).map((row) => row.value)).toContain("1 TB");
  });

  /**
   * Screen sizes were derived with per-category arithmetic over a fabricated field:
   * `${screenInch}.6″` for phones, `* 4` for TVs, `/ 3` for watches. A 55-inch TV called
   * itself "60″-class" and an Apple Watch "4″".
   */
  test("screen rows quote the product's real diagonal", () => {
    const tv = PRODUCT_CATALOG.find((p) => p.categoryId === "tv");
    expect(specValues(tv)).toContain(`${tv.screenInch}″`);

    const watch = PRODUCT_CATALOG.find((p) => p.categoryId === "wearables");
    expect(specValues(watch)).toContain(`${watch.screenInch}″`);

    const phone = PRODUCT_CATALOG.find((p) => p.categoryId === "smartphones");
    expect(specValues(phone)).toContain(`${phone.screenInch}″`);
  });

  test("products with no screen never quote a diagonal", () => {
    PRODUCT_CATALOG.filter((p) => typeof p.screenInch !== "number").forEach((product) => {
      const rows = specRows(product);
      expect(rows.map((row) => row.labelKey)).not.toContain(
        "productDetail.specsBrief.screenSize",
      );
      /** Catches any row that smuggles a size in, e.g. the laptops' `N″ Retina/OLED`. */
      rows.forEach((row) => expect(resolveSpecValue(row, t)).not.toContain("″"));
    });
  });

  test("products with no storage emit no storage row", () => {
    PRODUCT_CATALOG.filter((p) => typeof p.storageGb !== "number").forEach((product) => {
      const labels = specRows(product).map((row) => row.labelKey);
      expect(labels).not.toContain("productDetail.specsBrief.storage");
      expect(labels).not.toContain("productDetail.specsExtended.ssd");
    });
  });

  test("the storage row and the variant picker agree on the same product", () => {
    PRODUCT_CATALOG.filter((p) => typeof p.storageGb === "number").forEach((product) => {
      const variantLabels = buildVariantsForProduct(product).map((v) => v.label);
      const storageValues = specRows(product)
        .filter(
          (row) =>
            row.labelKey === "productDetail.specsBrief.storage" ||
            row.labelKey === "productDetail.specsExtended.ssd",
        )
        .map((row) => resolveSpecValue(row, t).replace(" SSD", ""));

      storageValues.forEach((value) => expect(variantLabels).toContain(value));
    });
  });
});

describe("buildVariantsForProduct", () => {
  test("a product with no storage axis gets no variants", () => {
    PRODUCT_CATALOG.filter((p) => typeof p.storageGb !== "number").forEach((product) => {
      expect(buildVariantsForProduct(product)).toEqual([]);
    });
  });

  test("configurable categories offer a step up from the real size", () => {
    const phone = PRODUCT_CATALOG.find((p) => p.categoryId === "smartphones" && p.storageGb === 256);
    expect(buildVariantsForProduct(phone).map((v) => v.label)).toEqual(["256 GB", "512 GB"]);
  });

  test("a 512 GB laptop steps up to 1 TB, not 1024 GB", () => {
    const laptop = PRODUCT_CATALOG.find((p) => p.categoryId === "laptops" && p.storageGb === 512);
    expect(buildVariantsForProduct(laptop).map((v) => v.label)).toEqual(["512 GB", "1 TB"]);
  });
});
