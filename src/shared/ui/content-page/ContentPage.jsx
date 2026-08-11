import { useLanguage } from "contexts";

/**
 * A prose page — About, Privacy, Terms — built from an i18n subtree rather than markup
 * repeated three times. These were `ComingSoon` placeholders carrying `noindex`, which for a
 * marketplace is a real trust gap: privacy and terms are pages both visitors and search
 * engines expect a commerce site to have.
 *
 * Sections are read positionally (`sections.0`, `sections.1`, …) until a heading is missing,
 * so a locale can add or drop a section without a code change.
 *
 * @param {{ namespace: string }} props — i18n prefix, e.g. `"aboutPage"`.
 */
const MAX_SECTIONS = 12;

const ContentPage = ({ namespace }) => {
  const { t } = useLanguage();

  /**
   * `t` answers a missing path with the path itself (see getTranslator), so that — not an
   * empty string — is what marks the end of the list. Passing `""` as a fallback does not
   * help: the translator treats a falsy fallback as "no fallback given".
   */
  const sections = [];
  for (let index = 0; index < MAX_SECTIONS; index += 1) {
    const headingKey = `${namespace}.sections.${index}.heading`;
    const heading = t(headingKey);
    if (!heading || heading === headingKey) break;
    const bodyKey = `${namespace}.sections.${index}.body`;
    const body = t(bodyKey);
    sections.push({ heading, body: body === bodyKey ? "" : body });
  }

  return (
    <article className="cont-width-default mx-auto w-full max-w-[75ch] py-10 text-start md:py-14">
      <h1 className="m-0 text-2xl font-bold text-navy md:text-3xl lg:text-[34px]">
        {t(`${namespace}.heading`)}
      </h1>
      <p className="m-0 pt-4 text-base leading-relaxed text-text-dark">
        {t(`${namespace}.intro`)}
      </p>

      {sections.map((section) => (
        <section key={section.heading} className="pt-8">
          <h2 className="m-0 text-lg font-semibold text-navy md:text-xl">{section.heading}</h2>
          <p className="m-0 pt-3 text-sm leading-relaxed text-text-muted md:text-base">
            {section.body}
          </p>
        </section>
      ))}
    </article>
  );
};

export default ContentPage;
