import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * A source-level guard for the markup rules this project holds itself to. They cannot be
 * asserted by rendering, because the point is that they hold across *every* component, not
 * only the ones a test happens to mount.
 *
 * The rule that prompted this: an element may carry an `<img>` or a CSS background image,
 * never both. A background image is invisible to crawlers and to image search and carries
 * no alt text, so any image that is content belongs in an `<img>`; a decorative flourish
 * belongs in the background. An element doing both is one of them lying.
 */
const SRC_ROOT = join(process.cwd(), "src");

const collectFiles = (dir, extensions) => {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectFiles(full, extensions));
      continue;
    }
    if (extensions.some((ext) => entry.endsWith(ext)) && !entry.includes(".test.")) {
      out.push(full);
    }
  }
  return out;
};

const relative = (file) => file.slice(SRC_ROOT.length + 1).replace(/\\/g, "/");

const jsxFiles = collectFiles(SRC_ROOT, [".jsx", ".tsx"]);
const cssFiles = collectFiles(SRC_ROOT, [".css"]);

/**
 * Splits JSX into individual element tags so a rule can look at one element at a time.
 * Block comments go first — these very files document the rules by naming `<img>`, and a
 * scanner that reads its own documentation as markup reports the docs as violations.
 */
const elementTags = (source) => {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, "");
  return withoutComments.match(/<[a-zA-Z][^>]*?\/?>/gs) ?? [];
};

describe("markup conventions", () => {
  test("the sweep actually found the components", () => {
    expect(jsxFiles.length).toBeGreaterThan(30);
  });

  test("no element carries both an image source and a background image", () => {
    const offenders = [];

    jsxFiles.forEach((file) => {
      elementTags(readFileSync(file, "utf8")).forEach((tag) => {
        const hasBackgroundImage = /backgroundImage|\bbg-\[url\(/.test(tag);
        const isImageElement = /^<img[\s/>]/.test(tag) || /\bsrc=/.test(tag);
        if (hasBackgroundImage && isImageElement) {
          offenders.push(`${relative(file)}: ${tag.slice(0, 90)}`);
        }
      });
    });

    expect(offenders).toEqual([]);
  });

  /**
   * A Tailwind gradient class *is* a background-image. Combining one with an inline
   * `backgroundImage` gives an element two competing sources, and the loser is dead code
   * that reads like an intentional layer.
   */
  test("no element combines a gradient class with an inline background image", () => {
    const offenders = [];

    jsxFiles.forEach((file) => {
      elementTags(readFileSync(file, "utf8")).forEach((tag) => {
        if (/backgroundImage/.test(tag) && /\bbg-gradient-to-/.test(tag)) {
          offenders.push(`${relative(file)}: ${tag.slice(0, 90)}`);
        }
      });
    });

    expect(offenders).toEqual([]);
  });

  /**
   * Content imagery must be an `<img>`. Stylesheets may only paint gradients and the
   * font-face URLs — a `url(...)` pointing at a picture means a photo a crawler cannot see.
   */
  test("stylesheets declare no photographic background images", () => {
    const offenders = [];

    cssFiles.forEach((file) => {
      const source = readFileSync(file, "utf8");
      const withoutFontFaces = source.replace(/@font-face\s*\{[\s\S]*?\}/g, "");
      [...withoutFontFaces.matchAll(/background(-image)?\s*:[^;}]*url\(([^)]*)\)/g)].forEach(
        (match) => {
          offenders.push(`${relative(file)}: ${match[0].slice(0, 90)}`);
        },
      );
    });

    expect(offenders).toEqual([]);
  });

  /** An `<img>` with no `alt` at all is unreadable; decorative ones say `alt=""`. */
  test("every img element declares alt", () => {
    const offenders = [];

    jsxFiles.forEach((file) => {
      elementTags(readFileSync(file, "utf8"))
        .filter((tag) => /^<img[\s/>]/.test(tag))
        .forEach((tag) => {
          if (!/\balt=/.test(tag)) {
            offenders.push(`${relative(file)}: ${tag.slice(0, 90)}`);
          }
        });
    });

    expect(offenders).toEqual([]);
  });
});
