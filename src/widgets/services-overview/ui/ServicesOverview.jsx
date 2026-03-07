import { useServicesPresenter } from "features/services-overview";
import "./ServicesOverview.css";

const ServicesOverview = () => {
  const { services } = useServicesPresenter();

  return (
    <section
      className="min-h-fit cursor-default flex justify-center my-8 sm:my-[60px]"
      aria-labelledby="services-overview-heading"
    >
      <div className="w-full cont-width-default">
        <h2 id="services-overview-heading" className="sr-only">
          {"Մեր ծառայությունները"}
        </h2>

        <div
          className="flex flex-col gap-3 sm:gap-5 w-full justify-between items-stretch 2xl:flex-row"
          role="list"
          aria-label={"Ծառայությունների ցանկ"}
        >
          {services.map((service) => (
            <article
              key={service.id}
              className="service-card flex-1 bg-white rounded-xl sm:rounded-[20px] p-3 sm:p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-2 border-border-blue flex flex-col items-start text-left transition-all duration-150 motion-reduce:transition-none hover:bg-[#e8efff66] hover:duration-300 motion-reduce:hover:transform-none focus-within:outline focus-within:outline-2 focus-within:outline-blue-500 focus-within:outline-offset-2"
              role="listitem"
              aria-labelledby={`service-title-${service.id}`}
              aria-describedby={`service-desc-${service.id}`}
            >
              <img
                className="service-icon rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-[#fef3c7] to-[#f59e0b] w-[56px] h-[56px] text-[1.75rem] mb-3 sm:w-[70px] sm:h-[70px] sm:text-[2.25rem] sm:mb-5 md:w-20 md:h-20 md:text-[2.5rem] md:mb-6 lg:w-[90px] lg:h-[90px] lg:text-[2.75rem] xl:w-20 xl:h-20 xl:text-[2.5rem] 2xl:w-[100px] 2xl:h-[100px] 2xl:text-[3rem] 2xl:mb-8"
                src={service.icon}
                alt={`${service.title} icon`}
                aria-label={`${service.title} image`}
              />

              <h3
                id={`service-title-${service.id}`}
                className="service-title font-system font-bold text-[#1a202c] leading-[1.3] text-lg mb-2 sm:text-[1.375rem] sm:mb-[0.875rem] md:text-2xl md:mb-4 lg:text-base xl:text-2xl 2xl:text-lg 2xl:mb-6"
              >
                {service.title}
              </h3>

              <p
                id={`service-desc-${service.id}`}
                className="service-description font-system text-text-service m-0 grow text-[0.8rem] leading-[1.5] sm:text-[0.95rem] sm:leading-[1.6] md:text-base md:leading-[1.7] lg:text-sm xl:text-base"
              >
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
