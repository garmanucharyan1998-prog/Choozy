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
});
