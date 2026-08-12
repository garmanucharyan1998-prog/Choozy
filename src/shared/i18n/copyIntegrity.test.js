import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { translations } from "./translations";
import { SUPPORTED_LANGUAGE_CODES } from "./languageConfig";

/**
 * Guards the claims the dictionary is allowed to make. `localeCoverage` next door proves every
 * locale *has* a string for every path; this proves the strings are not lying.
 *
 * Each rule here failed against real shipped copy. The services block advertised shops in
 * Ukraine, Poland, the USA, the UK and Kazakhstan, "3000+ shops" and "1.5M products", and
 * categories — auto parts, construction equipment, children's goods — this catalog has never
 * carried. The notification feeds shipped Lorem Ipsum in all three languages. The contact
 * address existed as both `info@choosy.am` and `info@choosy.com` on the same site. The home
 * page's `<title>` called Choosy an online store, which is the one thing it is not.
 *
 * Asserted over the dictionary rather than over rendered pages on purpose: the point is that
 * these hold for every string in every locale, including the ones no test happens to mount.
 */

/** Every leaf string as `[dottedPath, text]`. Arrays yield numeric segments (`sections.0.body`). */
const leafEntries = (value, prefix = "") =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") return [[path, child]];
    if (child && typeof child === "object") return leafEntries(child, path);
    return [];
  });

const allStrings = SUPPORTED_LANGUAGE_CODES.flatMap((language) =>
  leafEntries(translations[language]).map(([path, text]) => ({ language, path, text })),
);

/** Formats offenders so a failure names the language, the key and the offending text. */
const offending = (pattern) =>
  allStrings
    .filter(({ text }) => pattern.test(text))
    .map(({ language, path, text }) => `${language} ${path}: ${text.slice(0, 100)}`);

/**
 * Every character these three languages legitimately need: printable ASCII, the typographic
 * punctuation the copy already uses, Cyrillic, and the Armenian letters plus Armenian
 * punctuation (`՝ ՞ ։ ֊`) and the dram sign `֏`.
 *
 * The non-breaking space is deliberately absent. No string here needs one, and an invisible
 * U+00A0 sitting where a normal space belongs is exactly the kind of thing this rule exists to
 * surface — the same argument `no-irregular-whitespace` makes about the source itself.
 */
const ALLOWED_CHARACTER =
  /[ -~©«»°·×–—‘’“”…≈Ѐ-ӿԱ-Ֆՙ-՟ա-և։֊֏\n]/;

const describeCharacter = (character) =>
  `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")} «${character}»`;

describe("copy integrity", () => {
  test("the sweep actually walked the dictionaries", () => {
    expect(allStrings.length).toBeGreaterThan(500);
  });

  /**
   * The defect this catches is how the Armenian carousel copy was ruined in the first place:
   * a character that merely *looks* like the intended letter, typed in from the wrong Unicode
   * block. `֖` (U+0596) is a Hebrew accent, not the Armenian `ֆ` — invisible in review, and
   * invisible to every other test here, because the surrounding string is still valid Armenian.
   */
  test("no string contains a character from outside the languages it is written in", () => {
    const offenders = allStrings.flatMap(({ language, path, text }) =>
      [...text]
        .filter((character) => !ALLOWED_CHARACTER.test(character))
        .map(
          (character) =>
            `${language} ${path}: ${describeCharacter(character)} in "${text.slice(0, 60)}"`,
        ),
    );

    expect(offenders).toEqual([]);
  });

  test("no locale ships placeholder copy", () => {
    expect(offending(/lorem|ipsum|իպսում|ипсум|\bTODO\b|\bFIXME\b/i)).toEqual([]);
  });

  /**
   * A newline inside a dictionary value is a sentence that was cut in half: it renders as a
   * space in HTML, so the two fragments run together and the string reads as a mistake.
   */
  test("no string carries a hard line break", () => {
    expect(offending(/\n/)).toEqual([]);
  });

  /** This marketplace serves exactly one country. */
  test("no locale claims a market outside Armenia", () => {
    expect(
      offending(
        /ukrain|poland|kazakh|united kingdom|укра[иї]н|польш|казахст|великобритан|Ուկրաին|Լեհաստան|Ղազախստան|Բրիտանի/i,
      ),
    ).toEqual([]);
  });

  /** Numbers nothing in the codebase can substantiate. */
  test("no locale states a shop or product count", () => {
    expect(
      offending(/3[ ,]?000\s*\+?\s*(?:shops?|магазин|խանութ)|1[.,]5\s*(?:m\b|млн|միլիոն|million)/i),
    ).toEqual([]);
  });

  /**
   * The catalog carries eight categories, all electronics. Naming anything else promises a
   * shopper a listing page that does not exist.
   */
  test("no locale advertises a category the catalog does not carry", () => {
    expect(
      offending(
        /auto ?part|автозапчаст|ավտոմաս|construction equipment|стройматериал|շինարարական|kitchen appliance|кухонн\w+ техник|խոհանոցային տեխնիկա|home appliance|бытов\w+ техник|կենցաղային տեխնիկա|kids? product|детск\w+ товар|մանկական ապրանք|tourist gear|туристич|զբոսաշրջային/i,
      ),
    ).toEqual([]);
  });

  /**
   * Armenian does not take English-style Title Case: inside a sentence only proper nouns are
   * capitalized. The dictionary had inherited "Տեսնել Ավելին", "Մեր Մասին", "Հին Գաղտնաբառ" and
   * a dozen more from its English source, which reads to an Armenian speaker the way "See More
   * Products" reads mid-sentence in English.
   *
   * Only `am` is swept — Title Case on English and Russian buttons is idiomatic there. Sentences
   * are split first so a genuine sentence opening is not mistaken for a mid-sentence capital.
   */
  test("Armenian copy does not use English-style Title Case", () => {
    const armenianCapital = /^[Ա-Ֆ]/;
    /** Armenian proper nouns, which stay capitalized wherever they fall. */
    const properNoun = /^(?:Հայաստան|Երևան)/;
    /** Abbreviations are written in caps throughout: ԿԲ (KB), ՄՊ (MP). */
    const abbreviation = /^[Ա-Ֆ]+$/;
    const armenianLetter = /[Ա-Ֆա-և]/;
    /** Drops surrounding brackets and punctuation so only the word itself is judged. */
    const bare = (word) => {
      const letters = [...word];
      const first = letters.findIndex((character) => armenianLetter.test(character));
      if (first === -1) return "";
      let last = letters.length - 1;
      while (last > first && !armenianLetter.test(letters[last])) last -= 1;
      return letters.slice(first, last + 1).join("");
    };

    const offenders = leafEntries(translations.am)
      .filter(([, text]) =>
        text
          /** A «quoted» button label keeps whatever capitalization the button itself has. */
          .replace(/«[^»]*»/g, "")
          /** `·` opens a new segment in a separated list, exactly as a full stop opens a sentence. */
          .split(/[։.!?·]+\s*/)
          .flatMap((sentence) => sentence.trim().split(/\s+/).slice(1))
          .map(bare)
          .some(
            (word) =>
              armenianCapital.test(word) && !properNoun.test(word) && !abbreviation.test(word),
          ),
      )
      .map(([path, text]) => `${path}: ${text.slice(0, 70)}`);

    expect(offenders).toEqual([]);
  });

  /**
   * A capital letter directly inside a lowercase word — camelCase or PascalCase leaking into
   * prose, e.g. "seeMore" where "See more" was meant — reads as a typo or a debugging
   * artifact left in shipped copy. Armenian has its own rule above (Title Case, not
   * mid-word); this one is scoped to en/ru, and only to genuine leaks — real brand names
   * and initialisms that happen to capitalize mid-word are not bugs.
   */
  test("English and Russian copy has no camelCase leaking into prose", () => {
    const KNOWN_MIXED_CASE_WORDS = new Set([
      "iPhone",
      "iPad",
      "iOS",
      "iSpace",
      "MacBook",
      "AirPods",
      "JavaScript",
    ]);
    const midWordCapital = /\p{L}*\p{Ll}\p{Lu}\p{L}*/gu;

    const offenders = allStrings
      .filter(({ language }) => language === "en" || language === "ru")
      .flatMap(({ language, path, text }) => {
        /** `{{priceMin}}`-style interpolation names are code, not prose. */
        const prose = text.replace(/\{\{[^}]*\}\}/g, "");
        const words = [...prose.matchAll(midWordCapital)]
          .map((match) => match[0])
          .filter((word) => !KNOWN_MIXED_CASE_WORDS.has(word));
        return words.map((word) => `${language} ${path}: "${word}" in "${text.slice(0, 70)}"`);
      });

    expect(offenders).toEqual([]);
  });

  test("the contact address has one spelling", () => {
    expect(offending(/choosy\.am/i)).toEqual([]);
  });

  /**
   * Choosy compares prices published by other shops and sells nothing itself, so the strings that
   * introduce the site — its `<title>`, the brand tooltip and alt text in the header, the home
   * page's own copy and the "about" blocks — may not call it a shop. Scoped to those keys rather
   * than swept over everything: prose elsewhere is free to talk about the *retailers'* online
   * stores, which is a different subject and a legitimate thing to say.
   */
  test("no locale introduces Choosy as an online store", () => {
    const identityKey = /^(?:seo\.(?:siteName|home)|header\.brand|homeIntro|aboutUs|aboutPage)/;
    const offenders = allStrings
      .filter(
        ({ path, text }) =>
          identityKey.test(path) && /առցանց խանութ|интернет-магазин|online store/i.test(text),
      )
      .map(({ language, path, text }) => `${language} ${path}: ${text.slice(0, 100)}`);

    expect(offenders).toEqual([]);
  });

  /**
   * User-facing Armenian outside `shared/i18n/**` bypasses every rule above: it is not a leaf
   * in `translations`, so `localeCoverage` cannot see it, and it renders unchanged no matter
   * which locale a visitor picked. `shopAccountModel.defaultShopProfile.description` was
   * exactly this — a literal Armenian sentence shown to English and Russian sellers alike.
   *
   * The remaining files below are not that bug: each is Armenian *by design*, not by
   * accident, and stays out of the dictionary on purpose.
   */
  test("no Armenian literal exists outside the dictionary", () => {
    const SRC_ROOT = join(process.cwd(), "src");
    const I18N_ROOT = join(SRC_ROOT, "shared", "i18n");
    const ARMENIAN_LETTER = /[԰-֏]/;

    /**
     * @type {Record<string, string>} repo-relative path (forward slashes) -> why it's allowed
     */
    const ALLOWED_FILES = {
      "entities/filter-catalog/model/filterSearch.js":
        "Armenian search-term synonyms — must match what an Armenian speaker types, regardless of UI locale.",
      "shared/api/mocks/mockData.js":
        "same Armenian search-term expansion map as filterSearch.js.",
      "shared/lib/formatAmd.js":
        'the "դր." AMD abbreviation — a computed currency suffix, not translatable prose (see the function\'s own comment).',
      "shared/lib/formatPriceAmd.js": "same AMD abbreviation as formatAmd.js.",
      "entities/header/model/headerModel.js":
        'the language switcher\'s own name for Armenian ("Հայ") — a language names itself in its own script.',
      "entities/user/model/userModel.js":
        "the demo buyer profile's own Armenian name — a person's name, not UI copy.",
    };

    const collectFiles = (dir) => {
      const out = [];
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (full === I18N_ROOT) continue;
        if (statSync(full).isDirectory()) {
          out.push(...collectFiles(full));
          continue;
        }
        if (/\.(jsx?|tsx?)$/.test(entry) && !entry.includes(".test.")) out.push(full);
      }
      return out;
    };

    const offenders = [];
    collectFiles(SRC_ROOT).forEach((file) => {
      const rel = file.slice(SRC_ROOT.length + 1).replace(/\\/g, "/");
      if (ALLOWED_FILES[rel]) return;
      /** Block comments document this very rule by naming Armenian letters/examples. */
      const withoutComments = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      if (ARMENIAN_LETTER.test(withoutComments)) offenders.push(rel);
    });

    expect(offenders).toEqual([]);
  });

  /**
   * Tailwind's `uppercase` runs `text-transform` on the rendered string, and Armenian's `և`
   * uppercases to the archaic ligature `ԵՒ` instead of the modern `ԵՎ` — a defect a source
   * reader would never see, since the dictionary itself still holds the correct lowercase
   * `և`. Finds every `eyebrow={t("…")}` call site (the one place this codebase renders
   * translated copy through `uppercase`, via `PageIntro`) and checks the key's Armenian value.
   */
  test("no string rendered with `uppercase` contains և", () => {
    const SRC_ROOT = join(process.cwd(), "src");
    const readAtPath = (path) => path.split(".").reduce((node, key) => node?.[key], translations.am);

    const collectFiles = (dir) => {
      const out = [];
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          out.push(...collectFiles(full));
          continue;
        }
        if (/\.jsx$/.test(entry) && !entry.includes(".test.")) out.push(full);
      }
      return out;
    };

    const offenders = [];
    collectFiles(SRC_ROOT).forEach((file) => {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/eyebrow=\{t\("([^"]+)"/g)) {
        const value = readAtPath(match[1]);
        if (typeof value === "string" && value.includes("և")) offenders.push(match[1]);
      }
    });

    expect(offenders).toEqual([]);
  });
});
