import { getTranslator } from "shared/i18n";
import { getIndexableRoutes } from "app/seo";

const LANGUAGES = ["am", "en", "ru"];
const NAMESPACES = ["aboutPage", "privacyPage", "termsPage"];

/** Mirrors ContentPage: a missing path comes back as the path itself. */
const sectionsOf = (t, namespace) => {
  const out = [];
  for (let index = 0; index < 12; index += 1) {
    const headingKey = `${namespace}.sections.${index}.heading`;
    const heading = t(headingKey);
    if (!heading || heading === headingKey) break;
    out.push({ heading, body: t(`${namespace}.sections.${index}.body`) });
  }
  return out;
};

describe("content pages", () => {
  test.each(NAMESPACES)("%s has a heading, intro and SEO copy in every language", (namespace) => {
    LANGUAGES.forEach((language) => {
      const t = getTranslator(language);
      [
        `${namespace}.heading`,
        `${namespace}.intro`,
        `${namespace}.seoTitle`,
        `${namespace}.seoDescription`,
      ].forEach((key) => {
        const value = t(key);
        expect(value, `${language}/${key}`).toBeTruthy();
        /** A missing key resolves to the key itself, which would render as a literal dot-path. */
        expect(value, `${language}/${key}`).not.toBe(key);
      });
    });
  });

  /**
   * The sections are an array in the dictionaries, and `buildLocale` used to skip arrays
   * entirely — so English and Russian silently rendered the Armenian base text while every
   * count-based check still passed. Comparing the actual copy is what catches that.
   */
  test.each(NAMESPACES)("%s is genuinely translated, not falling back", (namespace) => {
    const firstHeadings = LANGUAGES.map(
      (language) => sectionsOf(getTranslator(language), namespace)[0].heading,
    );
    expect(new Set(firstHeadings).size, firstHeadings.join(" | ")).toBe(LANGUAGES.length);

    const intros = LANGUAGES.map((language) => getTranslator(language)(`${namespace}.intro`));
    expect(new Set(intros).size).toBe(LANGUAGES.length);
  });

  test.each(NAMESPACES)("%s renders the same section count in every language", (namespace) => {
    const counts = LANGUAGES.map((language) => sectionsOf(getTranslator(language), namespace).length);
    expect(counts.every((count) => count === counts[0])).toBe(true);
    expect(counts[0]).toBeGreaterThanOrEqual(5);
  });

  /**
   * Every section says something, and the page as a whole is substantial. Per-section
   * length alone is the wrong gate — a "Contact" section is legitimately one line — so the
   * floor is "not a stub" per section plus a real word count for the page.
   */
  test.each(NAMESPACES)("%s is real prose, not placeholders", (namespace) => {
    LANGUAGES.forEach((language) => {
      const t = getTranslator(language);
      const sections = sectionsOf(t, namespace);

      sections.forEach((section) => {
        expect(section.body.length, `${language}/${namespace}/${section.heading}`).toBeGreaterThan(
          20,
        );
        expect(section.body).not.toMatch(/lorem|TODO|coming soon/i);
      });

      const totalProse = [t(`${namespace}.intro`), ...sections.map((s) => s.body)].join(" ");
      expect(totalProse.length, `${language}/${namespace}`).toBeGreaterThan(900);
    });
  });

  /** Real content is only worth writing if search engines are allowed to see it. */
  test("the three pages are advertised in the sitemap inventory", () => {
    const paths = getIndexableRoutes().map((route) => route.path);
    ["/about", "/privacy-policy", "/terms-of-service"].forEach((path) => {
      expect(paths).toContain(path);
    });
  });
});
