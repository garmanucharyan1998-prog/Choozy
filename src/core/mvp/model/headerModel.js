/**
 * Header Model — static data for header component.
 * MVP: Model — data access only, no UI logic.
 */

export const LANGUAGES = {
  am: { code: "am", name: "Հայ", flag: "am", alt: "Հայերեն" },
  en: { code: "en", name: "Eng", flag: "gb", alt: "English" },
  ru: { code: "ru", name: "Рус", flag: "ru", alt: "Русский" },
};

export const DEFAULT_LANGUAGE = "am";

export const headerModel = {
  LANGUAGES,
  DEFAULT_LANGUAGE,
};

export default headerModel;
