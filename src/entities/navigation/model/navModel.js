/**
 * Nav Model — data for navigation panel.
 * MVP: Model — data access only, no UI logic.
 */

export const getNavItems = () => [
  {
    id: "tech-electronics",
    labelKey: "navPanel.items.techElectronics",
    aria: "Tech and Electronics",
  },
  {
    id: "portable-speakers",
    labelKey: "navPanel.items.portableSpeakers",
    aria: "Portable Speakers",
  },
  {
    id: "home-appliances",
    labelKey: "navPanel.items.homeAppliances",
    aria: "Home Appliances",
  },
  {
    id: "kitchen-appliances",
    labelKey: "navPanel.items.kitchenAppliances",
    aria: "Kitchen Appliances",
  },
  {
    id: "beauty-care",
    labelKey: "navPanel.items.beautyCare",
    aria: "Beauty and Care",
  },
];

export const navModel = { getNavItems };
export default navModel;
