import { createContext, useContext, useMemo } from "react";

/**
 * @typedef {{
 *   isAuthenticated: boolean,
 *   role: "buyer" | "seller" | null,
 *   email: string | null,
 * }} SessionContextValue
 */

const SIGNED_OUT = { isAuthenticated: false, role: null, email: null };

/**
 * Explicit generic (see LanguageContext.jsx for why): without it, TS narrows the default
 * value's type to exactly the signed-out literal, and `root.tsx`'s TypeScript consumers
 * of `useSession()` would fail to compile.
 * @type {import("react").Context<SessionContextValue>}
 */
const SessionContext = createContext(SIGNED_OUT);

/**
 * The demo session (see entities/session — a cookie the browser sets on itself, not a
 * real server-verified credential) comes from `root.tsx`'s loader, which reads it from
 * the request's `Cookie` header. This context is just how that value reaches the React
 * tree without threading it through every route's own loader/props.
 *
 * Lives in `contexts` rather than wrapping `entities/session` here: `contexts` may only
 * import `shared` (see eslint.config.js's boundary policy), so the provider takes the
 * already-parsed session as a plain prop instead of reading the cookie itself.
 */
export const SessionProvider = ({ session, children }) => {
  const value = useMemo(() => session ?? SIGNED_OUT, [session]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * Deliberately does NOT throw when no provider is mounted, unlike `useLanguage`.
 * `root.tsx`'s `ErrorBoundary` renders *instead of* `App` when a loader throws before the
 * tree ever mounts, so there's a real, valid render path with no `SessionProvider` above
 * it. Signed-out is the correct default there, not an error condition. Widget unit tests
 * (e.g. SiteShell.test.jsx) also render without one for the same reason.
 */
export const useSession = () => useContext(SessionContext);

export default SessionContext;
