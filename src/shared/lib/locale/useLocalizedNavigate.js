import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useLanguage } from "contexts";
import { localizedPath } from "./localizedPath";

/**
 * `useNavigate` that keeps the active language prefix.
 * Use instead of the router hook for every internal programmatic navigation.
 *
 * @returns {(to: string, options?: object) => void}
 */
export const useLocalizedNavigate = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return useCallback(
    (to, options) => {
      navigate(typeof to === "string" ? localizedPath(to, language) : to, options);
    },
    [navigate, language],
  );
};

export default useLocalizedNavigate;
