import { redirect } from "react-router";
import { dashboardPathForRole, normalizeRole, serializeSessionCookie } from "entities/session";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

/**
 * Demo "login" (see features/login — any non-empty email/password succeeds; there's no
 * real backend to verify against). This is a server `action` rather than a client-side
 * `document.cookie` write specifically so the redirect response carries `Set-Cookie`:
 * React Router treats that header as a signal to revalidate every loader on the next
 * render, including root's — the header updates to the signed-in state with no reload
 * and no `useRevalidator()` bookkeeping.
 */
export async function action({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  const formData = await request.formData();
  const role = normalizeRole(formData.get("role"));
  const email = formData.get("email");

  /**
   * Unreachable from the UI — the form only ever posts a validated role (see
   * entities/session's roleRegistry, which now validates on read as well as on write). This
   * used to redirect home with no cookie, so a corrupted registry entry looked exactly like
   * a successful login that silently didn't happen: the modal had already closed
   * optimistically and the visitor landed on the home page still signed out. A hand-crafted
   * request gets an honest error instead.
   */
  if (!role) {
    throw new Response("Invalid role", { status: 400 });
  }

  throw redirect(localizedPath(dashboardPathForRole(role), language), {
    headers: {
      "Set-Cookie": serializeSessionCookie(role, typeof email === "string" ? email : null, {
        secure: url.protocol === "https:",
      }),
    },
  });
}

/** A direct GET has no page to render — bounce home instead of erroring. */
export function loader({ request }) {
  const url = new URL(request.url);
  throw redirect(localizedPath("/", getLanguageFromPath(url.pathname)));
}
