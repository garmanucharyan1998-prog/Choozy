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
  { id: "topProducts", labelKey: "header.mobileMenuItems.topProducts", href: "#top-products" },
  { id: "varietyProducts", labelKey: "header.mobileMenuItems.varietyProducts", href: "#variety-products" },
  { id: "contact", labelKey: "header.mobileMenuItems.contact", href: "#contact" },
  { id: "aboutUs", labelKey: "header.mobileMenuItems.aboutUs", href: "#about-us" },
  { id: "privacy", labelKey: "header.mobileMenuItems.privacy", href: "#privacy" },
];

export const headerModel = {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  MOBILE_MENU_ITEMS,
};

export default headerModel;
