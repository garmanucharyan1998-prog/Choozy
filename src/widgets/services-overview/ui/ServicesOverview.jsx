import { FaSearch, FaStar, FaUser } from "react-icons/fa";
import { useServicesPresenter } from "features/services-overview";
import { useLanguage } from "contexts";
import "./ServicesOverview.css";

/** Maps `entities/service`'s `iconKey` onto an actual glyph — kept out of the model layer. */
const SERVICE_ICONS = {
  search: FaSearch,
  star: FaStar,
  user: FaUser,
};

const ServicesOverview = () => {
  const { t } = useLanguage();
  const { services } = useServicesPresenter();

  return (
    <section
      className="mb-8 flex min-h-fit cursor-default justify-center pt-8 sm:mb-[60px] sm:pt-[60px]"
      aria-labelledby="services-overview-heading"
    >
      <div className="w-full cont-width-default">
        <h2 id="services-overview-heading" className="sr-only">
          {t("servicesOverview.heading")}
        </h2>

        {/*
          A real <ul>/<li>: `role="list"` on a flex container is dropped by Safari +
          VoiceOver, and `role="listitem"` on <article> overrode the article role.
        */}
        <ul
          className="m-0 flex list-none flex-col gap-3 p-0 sm:gap-5 w-full justify-between items-stretch 2xl:flex-row"
          aria-label={t("servicesOverview.listAriaLabel")}
        >
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.iconKey];
            return (
              <li
                key={service.id}
                className="service-card flex-1 bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-border-blue flex flex-col items-start text-left transition-all duration-150 motion-reduce:transition-none hover:bg-[#e8efff66] hover:duration-300 motion-reduce:hover:transform-none focus-within:outline focus-within:outline-2 focus-within:outline-blue-500 focus-within:outline-offset-2"
              >
                {/* Decorative: the heading right below already names the service. */}
                <div
                  className="service-icon rounded-full flex items-center justify-center shrink-0 w-[56px] h-[56px] text-[1.75rem] mb-3 bg-[#FFF4E8] text-[#FFB45D] sm:w-[70px] sm:h-[70px] sm:text-[2.25rem] sm:mb-5 md:w-20 md:h-20 md:text-[2.5rem] md:mb-6 lg:w-[90px] lg:h-[90px] lg:text-[2.75rem] xl:w-20 xl:h-20 xl:text-[2.5rem] 2xl:w-[100px] 2xl:h-[100px] 2xl:text-[3rem] 2xl:mb-8"
                  aria-hidden="true"
                >
                  <Icon />
                </div>

                <h3 className="service-title font-sans font-bold text-[#1a202c] leading-[1.3] text-lg mb-2 sm:text-[1.375rem] sm:mb-[0.875rem] md:text-2xl md:mb-4 lg:text-base xl:text-2xl 2xl:text-lg 2xl:mb-6">
                  {service.title}
                </h3>

                <p className="service-description font-sans text-text-service m-0 grow text-[0.8rem] leading-[1.5] sm:text-[0.95rem] sm:leading-[1.6] md:text-base md:leading-[1.7] lg:text-sm xl:text-base">
                  {service.description}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default ServicesOverview;
