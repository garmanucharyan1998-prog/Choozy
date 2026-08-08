import { redirect } from "react-router";
import { dashboardPathForRole, readSessionFromRequest } from "entities/session";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

/**
 * `/login` never had its own page — logging in happens from the header modal. Redirecting
 * straight to `/account` used to send an anonymous visitor through `/login -> /account ->
 * /` (the account guard bounces them again); reading the session here collapses that to
 * one hop, and a signed-in visitor lands on their own dashboard instead of always /account.
 */
export function loader({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  const session = readSessionFromRequest(request);
  const target = session.isAuthenticated ? dashboardPathForRole(session.role) : "/";
  throw redirect(localizedPath(target, language));
}
