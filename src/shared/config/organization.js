/**
 * Who Choosy is, as facts rather than markup. The footer renders these as links and the
 * home page's `Organization` JSON-LD reports them as `sameAs` — search engines use profile
 * links to connect a site to its social accounts, and they were only ever present as
 * anchor hrefs inside the footer component.
 */
export const ORGANIZATION_NAME = "Choosy";

/** ISO 3166-1 alpha-2 — this marketplace serves Armenia only. */
export const ORGANIZATION_AREA_SERVED = "AM";

export const ORGANIZATION_ADDRESS = {
  addressCountry: "AM",
  addressLocality: "Yerevan",
};

/** @type {{ id: string, href: string, label: string }[]} */
export const ORGANIZATION_SOCIAL_PROFILES = [
  { id: "instagram", href: "https://www.instagram.com/", label: "Instagram" },
  { id: "facebook", href: "https://www.facebook.com/", label: "Facebook" },
  { id: "telegram", href: "https://t.me/", label: "Telegram" },
];
