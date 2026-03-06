import "./ServicesOverview.css";
import { useServicesPresenter } from "../../../core/mvp/presenter";

const ServicesOverview = () => {
  const { services } = useServicesPresenter();

  return (
    <section
      className="services-overview"
      role="region"
      aria-labelledby="services-overview-heading"
    >
      <div className="services-container cont-width-default">
        <h2 id="services-overview-heading" className="sr-only">
          Մեր ծառայությունները
        </h2>

        <div
          className="services-grid"
          role="list"
          aria-label="Ծառայությունների ցանկ"
        >
          {services.map((service, index) => (
            <article
              key={service.id}
              className="service-card"
              role="listitem"
              aria-labelledby={`service-title-${service.id}`}
              aria-describedby={`service-desc-${service.id}`}
            >
              <img
                className="service-icon"
                role="img"
                src={service.icon}
                alt={`${service.title} icon`}
                aria-label={`${service.title} image`}
              />

              <h3 id={`service-title-${service.id}`} className="service-title">
                {service.title}
              </h3>

              <p
                id={`service-desc-${service.id}`}
                className="service-description"
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
