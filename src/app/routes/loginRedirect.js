import { redirect } from "react-router";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

/** `/login` never had its own page — logging in happens from the header modal. */
export function loader({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  throw redirect(localizedPath("/account", language));
}
