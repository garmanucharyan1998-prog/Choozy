import { useCallback } from "react";
import { useSubmit } from "react-router";
import { useLanguage } from "contexts";
import { localizedPath } from "shared/lib/locale";

/**
 * Posts to `/session/logout` (a resource-route `action` that clears the session cookie
 * and redirects — see app/routes/sessionLogoutAction.js). A server action rather than a
 * client-side `document.cookie` write for the same reason login uses one: the response's
 * `Set-Cookie` header is what tells React Router to revalidate every loader, so the header
 * flips back to the signed-out state immediately, with no reload and no useRevalidator().
 */
export const useLogout = () => {
  const submit = useSubmit();
  const { language } = useLanguage();

  return useCallback(
    () => submit(null, { method: "post", action: localizedPath("/session/logout", language) }),
    [submit, language],
  );
};

export default useLogout;
