/**
 * Route inventory lives in the app layer, not `shared`: it has to know which products and
 * categories exist, and `shared` may not reach into `entities`. It is the app's answer to
 * "which URLs exist", which is an app-level question.
 */
export {
  getIndexableRoutes,
  getLocalizedRouteInventory,
} from "./routeInventory";
