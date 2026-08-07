import { useLanguage } from "contexts";
import { LocalizedLink } from "shared/ui/link";

const ABOUT_US_IMAGE = "/assets/images/AboutUs/AboutUs.jpg";

const AboutUs = () => {
  const { t } = useLanguage();

  return (
    <section id="about-us" className="mb-6 flex justify-center gap-3 sm:mb-10 sm:gap-5 lg:mb-[120px] lg:pt-[120px]" aria-label={t("aboutUs.sectionAriaLabel")}>
      <article className="flex flex-col text-center items-center gap-4 sm:gap-8 cont-width-default lg:grid lg:grid-cols-2 lg:text-left lg:items-center">
        <div className="flex flex-col justify-center gap-2 box-border bg-section-bg p-3 h-full rounded-2xl max-h-[250px] sm:gap-2.5 sm:p-3.5 sm:rounded-[32px] sm:max-h-[280px] md:gap-4 md:p-8 lg:gap-8 lg:p-9 lg:max-h-none">
          <h2 className="mx-auto m-0 text-base font-semibold sm:text-lg md:text-xl lg:text-[2rem] lg:mx-0">
            {t("aboutUs.title")}
          </h2>
          <p className="text-[11px] text-[#333] m-0 leading-normal sm:text-xs md:text-sm lg:text-base lg:leading-6 lg:font-normal lg:text-left">
            <strong>Choosy</strong>
            {t("aboutUs.descriptionStart")}{" "}
            <strong>Choosy</strong>
            {t("aboutUs.descriptionEnd")}
          </p>
          <LocalizedLink
            to="/about"
            className="flex w-fit mx-auto px-2.5 py-2 bg-navy text-white text-xs no-underline rounded-pill font-medium leading-none tracking-normal transition-colors duration-300 hover:bg-navy-light hover:shadow-[#15214760_0_0_10px] sm:px-3 sm:py-2.5 sm:text-sm lg:text-base lg:px-4 lg:py-3.5 lg:mx-0"
          >
            {t("aboutUs.learnMoreLabel")}
          </LocalizedLink>
        </div>

        {/*
          One request only: the photo used to be loaded twice — once as a hidden <img>
          and again as a CSS background on the overlay.
        */}
        <figure className="relative m-0 w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden group">
          <img
            src={ABOUT_US_IMAGE}
            alt={t("aboutUs.imageAlt")}
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover rounded-2xl sm:rounded-3xl transition-transform duration-[400ms] motion-reduce:transition-none group-hover:scale-105 max-h-[220px] sm:max-h-[280px] lg:max-h-none"
          />
          <figcaption className="sr-only">{t("aboutUs.imageCaption")}</figcaption>
        </figure>
      </article>
    </section>
  );
};

export default AboutUs;
