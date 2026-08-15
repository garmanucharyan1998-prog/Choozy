import { useCallback, useState } from "react";

/**
 * The open/closed state of the logout confirmation, and nothing else.
 *
 * Deliberately free of `useLogout` — and therefore of `useSubmit`, which needs a data router.
 * `Header` renders under a plain declarative `MemoryRouter` in `SiteShell.test.jsx` with no
 * signed-in session, and the existing `LogoutButton` component exists solely to keep `useSubmit`
 * out of Header's unconditional render path. A hook that owns only a boolean can be called
 * anywhere; the submission itself stays inside the dialog, which mounts only once opened.
 *
 * One hook per page rather than one per button, because the header has two logout triggers —
 * the compact icon and the mobile panel entry — and two `isConfirming` flags would let two
 * dialogs mount at once.
 */
export const useLogoutConfirm = () => {
  const [isConfirming, setIsConfirming] = useState(false);

  const requestLogout = useCallback(() => setIsConfirming(true), []);
  const cancelLogout = useCallback(() => setIsConfirming(false), []);

  return { isConfirming, requestLogout, cancelLogout };
};

export default useLogoutConfirm;
