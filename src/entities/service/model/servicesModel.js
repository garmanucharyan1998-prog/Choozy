/**
 * Services Model — data for services overview section.
 * MVP: Model — data access only, no UI logic.
 *
 * `iconKey` names the icon rather than pointing at an image file: the three fixed SVGs this
 * used to reference (cart, gear, share) didn't match what any of the three services actually
 * are, and no better-matching badge asset exists yet. The widget layer maps `iconKey` onto a
 * react-icons glyph, keeping icon choice a presentation concern.
 */
export const getServices = () => [
  {
    id: "ai-powered-search",
    iconKey: "search",
    titleKey: "servicesOverview.items.aiPoweredSearch.title",
    descriptionKey: "servicesOverview.items.aiPoweredSearch.description",
  },
  {
    id: "smart-recommendations",
    iconKey: "star",
    titleKey: "servicesOverview.items.smartRecommendations.title",
    descriptionKey: "servicesOverview.items.smartRecommendations.description",
  },
  {
    id: "personalized-service",
    iconKey: "user",
    titleKey: "servicesOverview.items.personalizedService.title",
    descriptionKey: "servicesOverview.items.personalizedService.description",
  },
];

export const servicesModel = { getServices };
export default servicesModel;
