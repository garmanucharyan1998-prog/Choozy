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
      if (value && typeof value === "object" && !Array.isArray(value)) {
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
