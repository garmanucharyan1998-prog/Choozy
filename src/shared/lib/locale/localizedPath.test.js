import {
  getLanguageFromPath,
  hasUnknownLanguagePrefix,
  localizedPath,
  stripLanguageFromPath,
} from "./localizedPath";

describe("localizedPath", () => {
  test.each([
    ["/filter", "am", "/filter"],
    ["/filter", "ru", "/ru/filter"],
    ["/filter", "en", "/en/filter"],
    ["/", "ru", "/ru"],
    ["/", "am", "/"],
  ])("builds %s for %s -> %s", (path, language, expected) => {
    expect(localizedPath(path, language)).toBe(expected);
  });

  test("preserves query string and hash across languages", () => {
    expect(localizedPath("/filter?category=laptops", "ru")).toBe("/ru/filter?category=laptops");
    expect(localizedPath("/filter#top", "en")).toBe("/en/filter#top");
  });

  test("re-prefixing an already-prefixed path swaps the language instead of stacking it", () => {
    expect(localizedPath("/ru/filter", "en")).toBe("/en/filter");
    expect(localizedPath("/en/filter", "am")).toBe("/filter");
  });

  test("leaves external URLs, mailto/tel links, and in-page anchors untouched", () => {
    expect(localizedPath("https://example.com/x", "ru")).toBe("https://example.com/x");
    expect(localizedPath("mailto:a@b.com", "ru")).toBe("mailto:a@b.com");
    expect(localizedPath("#section", "ru")).toBe("#section");
  });

  test("falls back to the default language for an unsupported code", () => {
    expect(localizedPath("/filter", "de")).toBe("/filter");
  });
});

describe("getLanguageFromPath", () => {
  test.each([
    ["/", "am"],
    ["/filter", "am"],
    ["/ru", "ru"],
    ["/ru/filter", "ru"],
    ["/en/singleproduct/x~fp-1", "en"],
  ])("%s -> %s", (path, expected) => {
    expect(getLanguageFromPath(path)).toBe(expected);
  });

  test("an unsupported two-letter prefix does not get treated as a language", () => {
    expect(getLanguageFromPath("/de/filter")).toBe("am");
  });

  /** The router matches `/RU/filter` to the ru branch, so this has to agree with it. */
  test.each([
    ["/RU/filter", "ru"],
    ["/Ru", "ru"],
    ["/EN/singleproduct/x~fp-1", "en"],
  ])("reads the language from the capitalized prefix %s -> %s", (path, expected) => {
    expect(getLanguageFromPath(path)).toBe(expected);
  });
});

describe("hasUnknownLanguagePrefix", () => {
  test("flags a two-letter prefix that isn't a supported language", () => {
    expect(hasUnknownLanguagePrefix("/de/filter")).toBe(true);
  });

  test.each(["/", "/filter", "/ru/filter", "/en"])("does not flag %s", (path) => {
    expect(hasUnknownLanguagePrefix(path)).toBe(false);
  });
});

describe("stripLanguageFromPath", () => {
  test.each([
    ["/ru/filter", "/filter"],
    ["/en/filter?category=laptops", "/filter?category=laptops"],
    ["/filter", "/filter"],
    ["/ru", "/"],
    ["/RU/account", "/account"],
    ["/EN", "/"],
  ])("%s -> %s", (path, expected) => {
    expect(stripLanguageFromPath(path)).toBe(expected);
  });
});
