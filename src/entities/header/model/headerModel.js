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
export const MOBILE_MENU_ITEMS = [
  { label: "Թոփ Ապրանքներ", href: "#top-products" },
  { label: "Տեսականի", href: "#variety-products" },
  { label: "Կապ Մեզ Հետ", href: "#contact" },
  { label: "Մեր Մասին", href: "#about-us" },
  { label: "Գաղտնիության Քաղաքականություն", href: "#privacy" },
];

export const headerModel = {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  MOBILE_MENU_ITEMS,
};

export default headerModel;
