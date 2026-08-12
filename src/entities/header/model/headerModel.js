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

/**
 * Real routes, not in-page anchors: `#top-products`, `#variety-products` and `#about-us`
 * only exist on the home page, and `#privacy` had no target at all. `topProducts` and
 * `varietyProducts` both land on `/filter` — `/products` and `/variety` are still
 * ComingSoon stubs, and `/filter` is the same fallback the home page's own "view more"
 * links (`TopProducts.jsx`, `Variety.jsx`) already use for these two sections.
 * `#contact` is kept — the footer carries that id on every page.
 */
export const MOBILE_MENU_ITEMS = [
  { id: "topProducts", labelKey: "header.mobileMenuItems.topProducts", href: "/filter" },
  { id: "varietyProducts", labelKey: "header.mobileMenuItems.varietyProducts", href: "/filter" },
  { id: "contact", labelKey: "header.mobileMenuItems.contact", href: "#contact" },
  { id: "aboutUs", labelKey: "header.mobileMenuItems.aboutUs", href: "/about" },
  { id: "privacy", labelKey: "header.mobileMenuItems.privacy", href: "/privacy-policy" },
];

export const headerModel = {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  MOBILE_MENU_ITEMS,
};

export default headerModel;
