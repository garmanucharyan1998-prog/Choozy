import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Resets window scroll when the route pathname changes.
 * React Router does not do this automatically in SPAs.
 */
const ScrollToTopOnNavigate = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

export default ScrollToTopOnNavigate;
