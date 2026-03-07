/**
 * Nav Model — data for navigation panel.
 * MVP: Model — data access only, no UI logic.
 */

export const getNavItems = () => [
  { label: "Տեխնիկա և էլեկտրոնիկա", aria: "Tech and Electronics" },
  { label: "Շարժական բարձրախոսներ", aria: "Portable Speakers" },
  { label: "Կենցաղային Տեխնիկա", aria: "Home Appliances" },
  { label: "Խոհանոցային Տեխնիկա", aria: "Kitchen Appliances" },
  { label: "Գեղեցկություն և խնամք", aria: "Beauty and Care" },
];

export const navModel = { getNavItems };
export default navModel;
