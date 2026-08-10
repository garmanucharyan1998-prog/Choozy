import { canonicalizePathname } from "./canonicalizePathname";

describe("canonicalizePathname", () => {
  test.each([
    ["/", "/"],
    ["/filter", "/filter"],
    ["/ru/filter", "/ru/filter"],
    ["/en/singleproduct/apple-iphone-17-pro-max~fp-1", "/en/singleproduct/apple-iphone-17-pro-max~fp-1"],
  ])("leaves the already-canonical %s untouched", (path, expected) => {
    expect(canonicalizePathname(path)).toBe(expected);
  });

  test.each([
    ["/Account", "/account"],
    ["/ACCOUNT/Shop-Account", "/account/shop-account"],
    ["/RU/filter", "/ru/filter"],
  ])("lowercases %s", (path, expected) => {
    expect(canonicalizePathname(path)).toBe(expected);
  });

  test.each([
    ["/filter/", "/filter"],
    ["/ru/filter///", "/ru/filter"],
    ["/Account/", "/account"],
  ])("strips trailing slashes from %s", (path, expected) => {
    expect(canonicalizePathname(path)).toBe(expected);
  });

  /** A doubled slash used to strip to an empty Location, which resolves to itself. */
  test.each([
    ["//", "/"],
    ["///", "/"],
    ["//filter", "/filter"],
    ["/ru//filter", "/ru/filter"],
  ])("collapses repeated slashes in %s without producing an empty path", (path, expected) => {
    const result = canonicalizePathname(path);
    expect(result).toBe(expected);
    expect(result.startsWith("/")).toBe(true);
  });

  test("never returns an empty string, so a redirect always has a real target", () => {
    expect(canonicalizePathname("")).toBe("/");
    expect(canonicalizePathname(undefined)).toBe("/");
    expect(canonicalizePathname(null)).toBe("/");
  });

  /** Static assets are case-sensitive on disk: /assets/images/AboutUs/AboutUs.jpg. */
  test.each([
    "/assets/images/AboutUs/AboutUs.jpg",
    "/assets/Icons/catalog.svg",
    "/logo512.png",
    "/sitemap.xml",
    "/robots.txt",
  ])("does not rewrite the file request %s", (path) => {
    expect(canonicalizePathname(path)).toBe(path);
  });

  test("is idempotent", () => {
    const once = canonicalizePathname("/Account/Shop-Account//");
    expect(canonicalizePathname(once)).toBe(once);
  });
});
