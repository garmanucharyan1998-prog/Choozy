/**
 * Resolves a spec row's value for display. A row carries either a literal, language-neutral
 * `value` ("14.2″", "512 GB", "Apple") or a `valueKey` for values that are actual words
 * ("Yes", "30 hours") — those rendered in English on Armenian and Russian pages when every
 * value was a literal.
 *
 * @param {{ value?: string, valueKey?: string, valueParams?: Record<string, string> }} row
 * @param {(key: string) => string} t
 * @returns {string}
 */
export const resolveSpecValue = (row, t) => {
  if (!row) return "";
  if (!row.valueKey) return row.value ?? "";

  const template = t(row.valueKey);
  const params = row.valueParams ?? {};
  return Object.entries(params).reduce(
    (text, [name, value]) => text.replace(`{{${name}}}`, value),
    template,
  );
};

export default resolveSpecValue;
