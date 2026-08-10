import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "shared/i18n/languageConfig";
import { getSiteBaseUrl } from "shared/config/siteMeta";
import { loader } from "./robots";

const readBody = async () => {
  const response = await loader();
  return { response, body: await response.text() };
};

describe("robots.txt resource route", () => {
  test("serves plain text with a cache header", async () => {
    const { response } = await readBody();
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600");
  });

  test("allows crawling and points at the sitemap on the canonical domain", async () => {
    const { body } = await readBody();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
    expect(body).toContain(`Sitemap: ${getSiteBaseUrl()}/sitemap.xml`);
  });

  /**
   * The static file it replaced hardcoded the domain a second time (drifting from every
   * canonical tag) and hand-listed `/ru/…` and `/en/…`, so a new locale would have been
   * silently crawlable.
   */
  test("disallows the private areas in every language, generated not hand-listed", async () => {
    const { body } = await readBody();
    const prefixed = SUPPORTED_LANGUAGE_CODES.filter((code) => code !== DEFAULT_LANGUAGE_CODE);

    ["/account", "/session"].forEach((area) => {
      expect(body).toContain(`Disallow: ${area}`);
      prefixed.forEach((language) => {
        expect(body).toContain(`Disallow: /${language}${area}`);
      });
    });
  });

  test("does not disallow anything the sitemap advertises", async () => {
    const { body } = await readBody();
    const disallowed = [...body.matchAll(/^Disallow: (.+)$/gm)].map((m) => m[1]);
    expect(disallowed).not.toContain("/");
    expect(disallowed).not.toContain("/filter");
  });
});
