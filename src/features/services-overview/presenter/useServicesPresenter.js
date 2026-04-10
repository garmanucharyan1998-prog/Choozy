/**
 * useServicesPresenter — MVP Presenter for ServicesOverview section.
 * Loads services data from Model, passes to View.
 */

import { useMemo } from "react";
import { servicesModel } from "entities/service";
import { useLanguage } from "contexts";

export const useServicesPresenter = () => {
  const { t } = useLanguage();
  const services = useMemo(
    () =>
      servicesModel.getServices().map((service) => ({
        ...service,
        title: t(service.titleKey, service.id),
        description: t(service.descriptionKey, service.id),
      })),
    [t],
  );

  return { services };
};

export default useServicesPresenter;
