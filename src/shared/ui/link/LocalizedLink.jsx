import { forwardRef } from "react";
import { Link } from "react-router";
import { useLanguage } from "contexts";
import { localizedPath } from "shared/lib/locale";

/**
 * Router `Link` that keeps the active language prefix (`/filter` → `/ru/filter`).
 * Use this for every internal navigation target — a bare `<a href>` would drop the
 * language and reload the whole SPA.
 *
 * External URLs, `mailto:`, `tel:` and in-page anchors are passed through untouched
 * and rendered as a plain anchor.
 */
export const LocalizedLink = forwardRef(({ to, children, ...rest }, ref) => {
  const { language } = useLanguage();
  const target = typeof to === "string" ? to : "";
  const isExternal = /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(target) || target.startsWith("#");

  if (isExternal) {
    return (
      <a ref={ref} href={target} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link ref={ref} to={localizedPath(target, language)} {...rest}>
      {children}
    </Link>
  );
});

LocalizedLink.displayName = "LocalizedLink";

export default LocalizedLink;
