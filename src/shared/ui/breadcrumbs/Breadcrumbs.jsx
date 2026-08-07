import { LocalizedLink } from "shared/ui/link";
import { useLanguage } from "contexts";

/**
 * Visible breadcrumb trail. Mirrors the `BreadcrumbList` JSON-LD emitted by the page,
 * so the structured data matches what the user actually sees.
 *
 * @param {{ items: { label: string, href?: string }[] }} props — last item is the current page.
 */
const Breadcrumbs = ({ items }) => {
  const { t } = useLanguage();
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <nav aria-label={t("breadcrumbs.ariaLabel")} className="min-w-0">
      <ol className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 p-0 text-xs text-text-muted sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {isLast || !item.href ? (
                <span
                  className="truncate text-text-dark"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <LocalizedLink
                  to={item.href}
                  className="text-link-blue no-underline hover:underline"
                >
                  {item.label}
                </LocalizedLink>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
