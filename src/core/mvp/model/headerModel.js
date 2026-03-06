/**
 * Header Model — static data for header component.
 * MVP: Model — data access only, no UI logic.
 */

export const LANGUAGES = {
  am: { code: "am", name: "\u0540\u0561\u0575", flag: "am", alt: "\u0540\u0561\u0575\u0565\u0580\u0565\u0576" },
  en: { code: "en", name: "Eng", flag: "gb", alt: "English" },
  ru: { code: "ru", name: "\u0420\u0443\u0441", flag: "ru", alt: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439" },
};

export const DEFAULT_LANGUAGE = "am";

export const headerModel = {
  LANGUAGES,
  DEFAULT_LANGUAGE,
};

export default headerModel;
