import SiteShell from "./SiteShell";

/**
 * Route-module wrapper: `routes.ts` references layout routes by file, not by JSX
 * element, so it can't pass `mainBackground` as a prop directly — this and
 * `SiteShellSubtle` are the two fixed variants it points at instead.
 */
const SiteShellWhite = () => <SiteShell mainBackground="white" />;

export default SiteShellWhite;
