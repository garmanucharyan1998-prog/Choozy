import { redirect } from "react-router";
import { serializeClearedSessionCookie } from "entities/session";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

/**
 * `Path`/`SameSite` on the cleared cookie must match `serializeSessionCookie`'s exactly
 * (see serializeClearedSessionCookie's own comment) — otherwise the redirect happens but
 * the browser keeps the old cookie and the next loader re-authenticates the visitor.
 */
export async function action({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);

  throw redirect(localizedPath("/", language), {
    headers: {
      "Set-Cookie": serializeClearedSessionCookie({ secure: url.protocol === "https:" }),
    },
  });
}

/** A direct GET has no page to render — bounce home instead of erroring. */
export function loader({ request }) {
  const url = new URL(request.url);
  throw redirect(localizedPath("/", getLanguageFromPath(url.pathname)));
}
