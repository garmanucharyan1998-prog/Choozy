import { translations } from "./translations";
import { DEFAULT_LANGUAGE_CODE, SUPPORTED_LANGUAGE_CODES } from "./languageConfig";

const TRANSLATED_LANGUAGES = SUPPORTED_LANGUAGE_CODES.filter((c) => c !== DEFAULT_LANGUAGE_CODE);

/** Armenian letters. The dram sign ֏ shares the block but is a currency symbol, not prose. */
const ARMENIAN_LETTERS = /[Ա-և]/;

const leafPaths = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) =>
    child && typeof child === "object" && !Array.isArray(child)
      ? leafPaths(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

const at = (tree, path) =>
  path.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), tree);

describe("locale coverage", () => {
  /**
   * `getTranslator` falls back to Armenian for a path a locale doesn't define, which is the
   * right runtime behaviour but silent: 12 keys — including the aria-labels on every product
   * and filter page — shipped Armenian text to English and Russian visitors, because nothing
   * ever compared the trees.
   */
  test.each(TRANSLATED_LANGUAGES)("%s never falls back to Armenian prose", (language) => {
    const leaking = leafPaths(translations[DEFAULT_LANGUAGE_CODE]).filter((path) => {
      const base = at(translations[DEFAULT_LANGUAGE_CODE], path);
      if (typeof base !== "string" || !ARMENIAN_LETTERS.test(base)) return false;
      return at(translations[language], path) === base;
    });

    expect(leaking, `untranslated in ${language}:\n${leaking.join("\n")}`).toEqual([]);
  });

  test.each(TRANSLATED_LANGUAGES)("%s defines every path the base locale does", (language) => {
    const missing = leafPaths(translations[DEFAULT_LANGUAGE_CODE]).filter(
      (path) => at(translations[language], path) === undefined,
    );
    expect(missing, `missing in ${language}:\n${missing.join("\n")}`).toEqual([]);
  });

  /** A key nothing reads is copy that will drift; a key read but undefined renders its path. */
  test("no locale defines a path the base locale does not", () => {
    const base = new Set(leafPaths(translations[DEFAULT_LANGUAGE_CODE]));
    TRANSLATED_LANGUAGES.forEach((language) => {
      const orphans = leafPaths(translations[language]).filter((path) => !base.has(path));
      expect(orphans, `orphans in ${language}:\n${orphans.join("\n")}`).toEqual([]);
    });
  });
});
