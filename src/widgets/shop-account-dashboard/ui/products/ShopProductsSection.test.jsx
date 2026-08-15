import { vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { translations } from "shared/i18n";
import { DEFAULT_LANGUAGE_CODE } from "shared/i18n/languageConfig";
import { ShopProductsSection } from "./ShopProductsSection";

const dict = translations[DEFAULT_LANGUAGE_CODE].shopAccount.products;

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const product = (overrides) => ({
  id: "sp-1",
  title: "Apple iPhone 16 Pro Max",
  category: "Smartphones",
  categoryId: "smartphones",
  price: "550,000",
  priceAmd: 550_000,
  availability: "in_stock",
  variants: ["256 / 12gb"],
  colors: [{ id: "black", hex: "#1a1a1a" }],
  createdAt: now - DAY,
  lastRefreshedAt: now,
  ...overrides,
});

const PRODUCTS = [
  product({ id: "a", title: "Apple iPhone 16 Pro Max" }),
  product({
    id: "b",
    title: "Dell XPS 15 OLED",
    category: "Laptops",
    categoryId: "laptops",
    availability: "out_of_stock",
    priceAmd: 920_000,
    price: "920,000",
    createdAt: now - 2 * DAY,
  }),
];

const renderSection = (overrides = {}) => {
  const handlers = {
    openProductForm: vi.fn(),
    openProductEdit: vi.fn(),
    cancelProductForm: vi.fn(),
    submitProductForm: vi.fn(),
    updateProductPrice: vi.fn(),
    selectProductCategory: vi.fn(),
    selectCatalogProduct: vi.fn(),
    setProductAvailability: vi.fn(),
    toggleProductMemory: vi.fn(),
    toggleProductColor: vi.fn(),
    refreshShopProduct: vi.fn(),
    refreshShopProducts: vi.fn(),
    updateShopProductPrice: vi.fn(() => true),
    requestDeleteProducts: vi.fn(),
  };

  /**
   * No `LanguageProvider`: the section and everything under it take `t` as a prop, which is what
   * makes them testable without a router. The translator here is the same lookup
   * `getTranslator` performs, over the real dictionary — a stub returning the key would let a
   * missing string pass.
   */
  const t = (key) =>
    key.split(".").reduce((node, part) => (node ? node[part] : undefined), translations.am) ?? key;

  const Harness = () => {
    return (
      <ShopProductsSection
        t={t}
        products={PRODUCTS}
        showProductForm={false}
        editingProductId={null}
        productDraft={{
          categoryId: "",
          catalogProductId: "",
          price: "",
          availability: "in_stock",
          selectedMemoryIds: [],
          selectedColorIds: [],
        }}
        formErrorKey=""
        catalogProductsForDraft={[]}
        selectedCatalogProduct={null}
        justRefreshedIds={new Set()}
        {...handlers}
        {...overrides}
      />
    );
  };

  return { handlers, ...render(<Harness />) };
};

/**
 * The table and the phone card list are both in the DOM at every width (one is hidden by CSS,
 * which jsdom does not apply), so every listing appears twice. Counting titles rather than rows
 * keeps the assertions about *which* listings survived a filter rather than about the layout.
 */
const titlesShown = (title) => screen.queryAllByRole("button", { name: title }).length;

describe("ShopProductsSection", () => {
  test("lists every product, with its status and price", () => {
    renderSection();
    expect(titlesShown("Apple iPhone 16 Pro Max")).toBe(2);
    expect(titlesShown("Dell XPS 15 OLED")).toBe(2);
    expect(screen.getAllByText(dict.stock.out).length).toBeGreaterThan(0);
    /** The currency word comes from the dictionary, never a hardcoded "AMD". */
    const currency = translations.am.productDetail.currencySuffix;
    expect(screen.getAllByRole("button", { name: new RegExp(dict.editPriceAria) })[0]).toHaveTextContent(
      `550,000 ${currency}`,
    );
  });

  test("search narrows the list to what matches", () => {
    renderSection();
    fireEvent.change(screen.getByLabelText(dict.searchLabel), { target: { value: "dell" } });

    expect(titlesShown("Dell XPS 15 OLED")).toBe(2);
    expect(titlesShown("Apple iPhone 16 Pro Max")).toBe(0);
  });

  test("a search that matches nothing offers a way back, not a dead end", () => {
    renderSection();
    fireEvent.change(screen.getByLabelText(dict.searchLabel), { target: { value: "zzz" } });

    expect(screen.getByText(dict.empty.filteredTitle)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: dict.filters.reset })[0]);
    expect(titlesShown("Apple iPhone 16 Pro Max")).toBe(2);
  });

  /** The counts on the tabs and the rows behind them come from one function, so they agree. */
  test("the stock tabs carry the counts and apply them", () => {
    renderSection();
    const outOfStockTab = screen.getByRole("button", { name: new RegExp(dict.filters.outOfStock) });
    expect(outOfStockTab).toHaveTextContent("1");

    fireEvent.click(outOfStockTab);
    expect(titlesShown("Dell XPS 15 OLED")).toBe(2);
    expect(titlesShown("Apple iPhone 16 Pro Max")).toBe(0);
  });

  test("bulk selection appears only once something is selected, and reports how many", () => {
    renderSection();
    expect(screen.queryByText(dict.bulk.selected.replace("{{count}}", "2"))).toBeNull();

    fireEvent.click(screen.getByLabelText(dict.bulk.selectAllAria));

    expect(screen.getByText(dict.bulk.selected.replace("{{count}}", "2"))).toBeInTheDocument();
  });

  /**
   * Deleting never acts on the click: it asks the presenter to open a confirmation, and the ids
   * it hands over are the ones the seller selected.
   */
  test("bulk delete asks for confirmation rather than deleting", () => {
    const { handlers } = renderSection();
    fireEvent.click(screen.getByLabelText(dict.bulk.selectAllAria));

    const bulkBar = screen.getByText(dict.bulk.selected.replace("{{count}}", "2")).closest("div");
    fireEvent.click(within(bulkBar).getByRole("button", { name: dict.delete }));

    expect(handlers.requestDeleteProducts).toHaveBeenCalledWith(["a", "b"]);
  });

  test("a row's delete asks about that one listing", () => {
    const { handlers } = renderSection();
    fireEvent.click(
      screen.getAllByRole("button", { name: `${dict.deleteAria} — Dell XPS 15 OLED` })[0],
    );
    expect(handlers.requestDeleteProducts).toHaveBeenCalledWith(["b"]);
  });

  test("a refreshed row cannot be refreshed again while it is acknowledging", () => {
    renderSection({ justRefreshedIds: new Set(["a"]) });
    expect(screen.getAllByRole("button", { name: dict.refreshedAria })[0]).toBeDisabled();
  });
});
