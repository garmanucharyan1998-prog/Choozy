import { redirect } from "react-router";
import { getLanguageFromPath, localizedPath } from "shared/lib/locale";

/** `/favorites` predates the account dashboard's own favorites tab. */
export function loader({ request }) {
  const url = new URL(request.url);
  const language = getLanguageFromPath(url.pathname);
  throw redirect(localizedPath("/account/favorite", language));
}
