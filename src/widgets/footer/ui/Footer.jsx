import choozyMainLogoWhite from "shared/assets/logos/choozyMainLogoWhite.svg";
import { useLanguage } from "contexts";
import { ORGANIZATION_SOCIAL_PROFILES } from "shared/config/organization";
import { LocalizedLink } from "shared/ui/link";
import "./Footer.css";

/**
 * Icon paths only — the profiles themselves (href, label) come from
 * `shared/config/organization` so the footer and the Organization JSON-LD never disagree
 * about which accounts exist.
 */
const SOCIAL_ICON_PATHS = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  telegram:
    "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
};

const socialLinks = ORGANIZATION_SOCIAL_PROFILES.map((profile) => ({
  ...profile,
  iconPath: SOCIAL_ICON_PATHS[profile.id],
}));

const footerColumnsConfig = [
  [
    { id: "home", href: "/", labelKey: "footer.columns.primary.home" },
    { id: "about", href: "/about", labelKey: "footer.columns.primary.about" },
    { id: "catalog", href: "/filter", labelKey: "footer.columns.primary.catalog" },
  ],
  [
    { id: "contact", href: "#contact", labelKey: "footer.columns.contact.contact" },
    {
      id: "email",
      href: "mailto:info@choosy.com",
      labelKey: "footer.columns.contact.email",
      withEmailIcon: true,
    },
  ],
  [
    { id: "privacy", href: "/privacy-policy", labelKey: "footer.columns.legal.privacy" },
    { id: "terms", href: "/terms-of-service", labelKey: "footer.columns.legal.terms" },
  ],
];

const columnClassName =
  "flex flex-col gap-2 items-center text-center min-w-0 sm:gap-[10px] md:gap-4 md:items-stretch md:text-left md:min-w-[150px] lg:min-w-[200px]";
/**
 * `py-1 -my-1` is a hit area, not spacing. At 11px these links stood 20px tall, under the 24px
 * WCAG 2.2 AA floor, and every one of them — six links, on every page, in every language. The
 * padding grows the tappable box to 28px while the negative margin gives the same amount back to
 * the flow, so the footer looks identical and the column gap (8px, and more above `sm`) is wide
 * enough that neighbouring hit areas meet without overlapping.
 */
const textLinkClassName =
  "flex items-center text-white no-underline text-[11px] mr-auto py-1 -my-1 transition-opacity duration-300 hover:opacity-80 sm:text-xs md:text-sm md:mr-0";

const SocialLink = ({ href, label, iconPath }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="text-white no-underline transition-opacity duration-300 hover:opacity-80"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d={iconPath} />
    </svg>
  </a>
);

const FooterLink = ({ href, label, withEmailIcon = false }) => (
  <LocalizedLink to={href} className={`${textLinkClassName}${withEmailIcon ? " gap-2" : ""}`}>
    {withEmailIcon && (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    )}
    {label}
  </LocalizedLink>
);

const Footer = () => {
  const { t } = useLanguage();
  const footerColumns = footerColumnsConfig.map((column) =>
    column.map((link) => ({
      ...link,
      label: t(link.labelKey, link.id),
    })),
  );

  return (
    <footer id="contact" className="bg-navy text-white text-sm">
      <div className="cont-width-default mx-auto box-border px-3 py-3 sm:px-4 sm:py-4 md:px-10 md:py-[31px] lg:px-[60px] lg:py-12 2xl:px-[100px] 2xl:py-[70px]">
        <div className="flex flex-col gap-5 sm:gap-[30px] mb-4 sm:mb-5 sm:items-center md:flex-row md:justify-between md:items-start md:gap-0 md:mb-0">
          <div className="flex flex-col gap-5">
            <div>
              <img
                src={choozyMainLogoWhite}
                alt="Choosy"
                className="block h-[38px] sm:h-[47px] w-auto rounded mr-auto mb-auto"
              />
            </div>
            <div className="flex gap-4">
              {socialLinks.map((socialLink) => (
                <SocialLink
                  key={socialLink.label}
                  href={socialLink.href}
                  label={socialLink.label}
                  iconPath={socialLink.iconPath}
                />
              ))}
            </div>
          </div>

          {/**
           * The wide spacing waits for `xl`, not `lg`, because it does not fit at `lg`.
           *
           * A flex item cannot shrink below its min-content width (`min-width: auto`), and at
           * `lg` this nav's min-content was 920px: three 200px columns (`lg:min-w-[200px]`) plus
           * two 80px gaps plus 160px of its own padding. The `lg` breakpoint starts at 1024px,
           * where the row only has 800px to give it — so the nav stood 120px wider than its
           * parent, broke out of the footer's right padding, and put 60px of horizontal scroll
           * on *every page of the site* at that width. It went unseen because 1024 sits exactly
           * in the gap between the two widths the responsive harness used to check, 768 and 1280.
           *
           * At `lg` the columns and their 48px gaps come to 696px, inside the 800px available;
           * by `xl` (1280px) the row has 1056px, so the original 80px gaps and padding fit.
           */}
          <nav className="flex flex-col gap-3 w-full sm:gap-5 md:flex-row md:gap-10 md:w-auto md:flex-1 md:justify-end lg:gap-12 xl:gap-20 xl:px-20">
            {footerColumns.map((column) => (
              <ul key={column[0].id} className={`m-0 list-none p-0 ${columnClassName}`}>
                {column.map((link) => (
                  <li key={`${link.id}-${link.href}`}>
                    <FooterLink
                      href={link.href}
                      label={link.label}
                      withEmailIcon={link.withEmailIcon}
                    />
                  </li>
                ))}
              </ul>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom-bar bg-black pt-3 text-center sm:pt-5">
        <p className="m-0 text-xs sm:text-sm text-white">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
};

export default Footer;
