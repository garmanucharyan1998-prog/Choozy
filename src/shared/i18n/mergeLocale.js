/**
 * Deep-merge string overrides onto a base locale tree (mock i18n for en/ru).
 */
export const buildLocale = (base, overrides) => {
  const result = structuredClone(base);

  const walk = (target, source) => {
    Object.keys(source).forEach((key) => {
      const value = source[key];
      if (typeof value === "string") {
        target[key] = value;
        return;
      }
      /**
       * An array is replaced wholesale, not merged element-by-element: a locale that
       * supplies a list of prose sections supplies all of them, and index-wise merging
       * would leave a shorter override trailing the base locale's leftovers.
       *
       * Arrays used to be skipped entirely — the condition below excluded them — so an
       * override's list silently kept the Armenian base text in English and Russian.
       */
      if (Array.isArray(value)) {
        target[key] = structuredClone(value);
        return;
      }
      if (value && typeof value === "object") {
        if (!target[key] || typeof target[key] !== "object") {
          target[key] = {};
        }
        walk(target[key], value);
      }
    });
  };

  walk(result, overrides);
  return result;
};

export default buildLocale;
