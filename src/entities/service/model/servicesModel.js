/**
 * Services Model — data for services overview section.
 * MVP: Model — data access only, no UI logic.
 */

import cartIcon from "shared/assets/icons/cart.svg";
import settingsIcon from "shared/assets/icons/settings.svg";
import shareIcon from "shared/assets/icons/shareBlank.svg";

export const getServices = () => [
  {
    id: "ai-powered-search",
    icon: cartIcon,
    titleKey: "servicesOverview.items.aiPoweredSearch.title",
    descriptionKey: "servicesOverview.items.aiPoweredSearch.description",
  },
  {
    id: "smart-recommendations",
    icon: settingsIcon,
    titleKey: "servicesOverview.items.smartRecommendations.title",
    descriptionKey: "servicesOverview.items.smartRecommendations.description",
  },
  {
    id: "personalized-service",
    icon: shareIcon,
    titleKey: "servicesOverview.items.personalizedService.title",
    descriptionKey: "servicesOverview.items.personalizedService.description",
  },
];

export const servicesModel = { getServices };
export default servicesModel;
